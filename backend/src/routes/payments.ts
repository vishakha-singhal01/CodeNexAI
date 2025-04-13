import express, { Request, Response, Router } from 'express';
import Razorpay from 'razorpay';
// Import specific types needed from the Razorpay SDK
import { Orders } from 'razorpay/dist/types/orders'; // Adjust path if necessary based on package structure
import crypto from 'crypto';
import dotenv from 'dotenv';
import User from '../models/User'; // Assuming User model path

dotenv.config({ path: '../../.env' }); // Load main .env file

const router: Router = express.Router();

// Ensure environment variables are loaded
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET; // Need to add this to .env later

if (!razorpayKeyId || !razorpayKeySecret) {
    console.error("Error: Razorpay API keys are not defined in the environment variables.");
    // Potentially throw an error or exit, depending on desired behavior
    // For now, we'll log the error and proceed, but Razorpay instance will be undefined.
}

// Initialize Razorpay instance (handle potential undefined keys)
let razorpayInstance: Razorpay | undefined;
if (razorpayKeyId && razorpayKeySecret) {
    razorpayInstance = new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
    });
} else {
    console.error("Razorpay instance could not be initialized due to missing API keys.");
}

import { NextFunction } from 'express'; // Import NextFunction

// Middleware to check if user is authenticated (replace with your actual auth middleware)
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => { // Use NextFunction type
    // Placeholder: Implement your actual authentication check here
    // e.g., check req.user or session
    if (req.isAuthenticated()) { // Assuming passport.js style authentication
        return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
};

// POST /api/payments/create-order
// Creates a Razorpay order
router.post('/create-order', isAuthenticated, async (req: Request, res: Response): Promise<void> => { // Add return type Promise<void>
    if (!razorpayInstance) {
         res.status(500).json({ message: 'Razorpay service not initialized' });
         return; // Explicitly return
    }

    const { amount, currency = 'INR', receipt, userId } = req.body; // Amount should be in the smallest currency unit (e.g., paise for INR), Added userId

    if (!amount) {
         res.status(400).json({ message: 'Amount is required' });
         return; // Explicitly return
    }

    // Include userId in notes for webhook processing
    if (!userId) {
        console.warn("Warning: userId not provided in create-order request. Webhook update might fail.");
        // Depending on requirements, you might want to return an error here:
        // res.status(400).json({ message: 'User ID is required for payment processing' });
        // return;
    }

    // Use the imported Orders namespace/type correctly
    const options: Orders.RazorpayOrderCreateRequestBody = {
        amount: amount, // amount in the smallest currency unit
        currency: currency,
        receipt: receipt || `receipt_order_${Date.now()}`, // Optional: Provide a unique receipt ID
        notes: {
            userId: userId // Pass userId here
        }
    };

    try {
        const order = await razorpayInstance.orders.create(options);
        if (!order) {
             res.status(500).json({ message: 'Failed to create Razorpay order' });
             return; // Explicitly return
        }
        console.log("Razorpay Order Created:", order);
        res.json({ orderId: order.id, currency: order.currency, amount: order.amount });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ message: 'Error creating Razorpay order', error: error });
    }
});

// POST /api/payments/webhook
// Handles Razorpay webhook events (e.g., payment success)
// Use express.json() for automatic parsing if signature verification is done correctly
router.post('/webhook', async (req: Request, res: Response): Promise<void> => { // Add return type Promise<void>
    const secret = razorpayWebhookSecret; // Get webhook secret from env

    if (!secret) {
        console.error("Razorpay webhook secret is not configured.");
         res.status(500).send("Webhook secret not configured.");
         return; // Explicitly return
    }

    const razorpaySignature = req.headers['x-razorpay-signature'] as string; // Type assertion

    if (!razorpaySignature) {
        console.error("Webhook received without signature.");
        res.status(400).send("Signature missing");
        return; // Explicitly return
    }

    // IMPORTANT: Use the raw body for verification, not the parsed body
    // We need to configure express to provide the raw body.
    // Let's assume the raw body is available on req.rawBody (needs middleware setup in index.ts)
    // For now, we'll proceed assuming express.raw() middleware was used correctly *before* this route.
    // If using express.json(), verification needs the raw buffer.

    // Re-verify using the raw body if available, otherwise log a warning.
    // This part needs adjustment based on how raw body is handled in index.ts
    let generatedSignature = "invalid"; // Default to invalid
    if (req.rawBody) { // Check if rawBody is populated by middleware
        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(req.rawBody); // Use raw body buffer
        generatedSignature = shasum.digest('hex');
    } else {
         console.warn("Warning: req.rawBody not available for webhook signature verification. Ensure express.raw() middleware is used correctly before this route.");
         // Attempt verification with stringified JSON body as a fallback (less secure, might fail)
         try {
            const shasum = crypto.createHmac('sha256', secret);
            shasum.update(JSON.stringify(req.body)); // Fallback: Use stringified JSON
            generatedSignature = shasum.digest('hex');
         } catch (e) {
            console.error("Error stringifying body for fallback verification:", e);
         }
    }


    if (generatedSignature === razorpaySignature) {
        console.log('Webhook signature verified successfully.');
        const event = req.body; // Now we can safely use the parsed body

        // Handle the event
        if (event.event === 'payment.captured') {
            const payment = event.payload.payment.entity;
            console.log('Payment captured:', payment);

            // Extract necessary info (e.g., user identifier if passed in notes or metadata)
            const userId = payment.notes?.userId || payment.notes?.user_id; // Adjust based on how you pass user info

            if (!userId) {
                console.error('User ID not found in payment notes. Cannot update plan.');
                // Respond successfully to Razorpay to acknowledge receipt, even if internal processing fails
                 res.status(200).json({ status: 'ok - user ID missing' });
                 return; // Explicitly return
            }

            try {
                // Find user and update their plan to 'pro'
                const updatedUser = await User.findByIdAndUpdate(
                    userId,
                    { $set: { plan: 'pro' } },
                    { new: true } // Return the updated document
                );

                if (updatedUser) {
                    console.log(`User ${userId} plan updated to 'pro'.`);
                } else {
                    console.error(`User ${userId} not found. Could not update plan.`);
                    // Still respond 200 to Razorpay
                }
            } catch (dbError) {
                console.error(`Database error updating plan for user ${userId}:`, dbError);
                // Still respond 200 to Razorpay, but log the internal error
            }

        } else {
            console.log(`Received unhandled event: ${event.event}`);
        }

        // Acknowledge receipt to Razorpay
        // Acknowledge receipt to Razorpay *before* potentially long DB operations
        res.status(200).json({ status: 'ok' });

    } else {
        console.error('Webhook signature verification failed.');
        console.error('Generated:', generatedSignature);
        console.error('Received:', razorpaySignature);
        res.status(400).send('Invalid signature');
    }
});


// Use module augmentation for Express Request type extension
declare module 'express-serve-static-core' {
    interface Request {
        rawBody?: Buffer;
    }
}


export default router;
