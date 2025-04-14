import express, { Request, Response, Router as ExpressRouter } from 'express'; // Alias Router
import mongoose from 'mongoose'; // Import mongoose
import ContactSubmission from '../models/ContactSubmission'; // Import the model

const router: ExpressRouter = express.Router(); // Use the alias

// Define the handler function separately
const handleContactSubmission = async (req: Request, res: Response): Promise<void | express.Response> => {
  const { firstName, lastName, email, company, message } = req.body;

  // Basic validation (more robust validation can be added)
  if (!firstName || !lastName || !email || !message) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const newSubmission = new ContactSubmission({
      firstName,
      lastName,
      email,
      company, // Company is optional
      message,
    });

    await newSubmission.save();

    res.status(201).json({ message: 'Contact submission received successfully!' });

  } catch (error) {
    console.error('Error saving contact submission:', error);
    // Check for Mongoose validation errors specifically
    if (error instanceof mongoose.Error.ValidationError) { // Use mongoose.Error.ValidationError
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    res.status(500).json({ message: 'Server error while saving submission' });
  }
};

// POST /api/contact - Handle contact form submission
router.post('/', handleContactSubmission); // Pass the named handler function

export default router;
