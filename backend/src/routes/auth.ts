import express, { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto'; // Import crypto for token generation
import User, { IUser } from '../models/User'; // Adjust path if necessary
import { sendVerificationEmail } from '../services/emailService'; // Import email service

const router: Router = express.Router(); // Explicitly type the router

// --- Rate Limiter for Auth Routes ---
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs (adjust as needed)
    message: 'Too many login/signup attempts from this IP, please try again after 15 minutes',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// --- Local Authentication Routes ---

// Define the signup handler separately to ensure correct typing
const signupHandler: RequestHandler = async (req, res, next) => {
    const { email, password, username, displayName } = req.body; // Added username

    // --- Enhanced Input Validation ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email format regex
    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required.' });
        return undefined; // Explicitly return undefined
    }
    if (!emailRegex.test(email)) {
        res.status(400).json({ message: 'Invalid email format.' });
        return undefined; // Explicitly return undefined
    }
    if (password.length < 8) { // Enforce minimum password length
        res.status(400).json({ message: 'Password must be at least 8 characters long.' });
        return undefined; // Explicitly return undefined
    }
    // Consider adding more complex password rules (uppercase, number, symbol) if needed
    // --- End Enhanced Input Validation ---

    try {
        const normalizedEmail = email.toLowerCase(); // Normalize email before searching/saving
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            res.status(409).json({ message: 'Email already exists.' }); // 409 Conflict
            return undefined; // Explicitly return undefined
        }

        const newUser = new User({
            email: normalizedEmail, // Use normalized email
            password: password, // Password will be hashed by the pre-save hook in User model
            username: username ? username.toLowerCase() : undefined, // Save username if provided, store lowercase
            displayName: displayName || username || normalizedEmail.split('@')[0] // Default display name: provided displayName, then username, then from email
        });

        await newUser.save();

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        newUser.emailVerificationToken = verificationToken;
        newUser.emailVerificationTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

        await newUser.save(); // Save user with verification token

        try {
            if (newUser.email) { // Ensure email exists before sending
                await sendVerificationEmail(newUser.email, verificationToken);
            } else {
                // This case should ideally not happen if email is required for signup
                // Or handle OAuth signups that might not have email immediately differently
                console.warn(`User ${newUser._id} signed up without an email. Skipping verification email.`);
            }
        } catch (emailError) {
            console.error("Error sending verification email:", emailError);
            // Decide on error handling:
            // Option 1: Let user sign up but inform them email sending failed.
            // Option 2: Fail the signup (as implemented by passing error to next())
            // For now, we'll pass the error, which will prevent login and send a generic server error.
            // A more user-friendly approach might be to log the error and still allow signup,
            // with a message to the user to try verifying later or contact support.
            return next(new Error('Signup succeeded, but failed to send verification email. Please try logging in and resending verification.'));
        }

        // User is NOT logged in immediately after signup.
        // They must verify their email first.
        // The req.logIn call has been removed from here.
        
        // Send response indicating signup was successful and email verification is needed.
        // No user object is sent back in the response here, as they are not logged in.
        res.status(201).json({ 
            message: 'Signup successful. Please check your email to verify your account.'
            // We are not sending the user object anymore as they are not logged in.
            // user: { email: newUser.email, isEmailVerified: newUser.isEmailVerified } 
        });

    } catch (error) {
        // Catch errors from findOne, save, or the login Promise rejection
        next(error); // Pass error to the error handling middleware
        // Implicitly returns Promise<void> here
    }
};

// Apply the handler and limiter to the signup route
router.post('/signup', authLimiter, signupHandler);


// POST /api/auth/login (Email/Password Login for existing session-based flow)
// Apply the limiter to the login route
router.post('/login', authLimiter, (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', (err: Error | null, user: IUser | false, info: { message: string }) => {
        if (err) { return next(err); }
        if (!user) {
            return res.status(401).json({ message: info.message || 'Login failed.' });
        }
        if (!user.isEmailVerified) {
            return res.status(403).json({ message: 'Please verify your email address before logging in.' });
        }
        req.logIn(user, (loginErr) => { // Renamed err to loginErr to avoid conflict with outer err
            if (loginErr) { return next(loginErr); }

            const userResponse = { id: user._id, email: user.email, displayName: user.displayName, plan: user.plan, isEmailVerified: user.isEmailVerified };
            return res.json({ message: 'Login successful.', user: userResponse });
        });
    })(req, res, next);
});

// --- New Login Handler for VS Code (JWT based) ---
router.post('/vscode-login', authLimiter, async (req: Request, res: Response, next: NextFunction) => { // Removed wrapping parenthesis
    const { email, password, redirect_uri } = req.body;

    if (!redirect_uri || !redirect_uri.startsWith('vscode://')) {
        res.status(400).send("Invalid or missing redirect_uri for VS Code login.");
        return;
    }

    // We'll manually authenticate here, similar to how passport-local strategy would,
    // because we need to control the response (redirect with token) differently.
    try {
        const normalizedEmail = email.toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            // Instead of sending JSON, redirect with error for VS Code if possible, or show error page.
            // For simplicity, we'll send an error that the VS Code extension won't directly parse as a token.
            // A more advanced flow might redirect to an error page on codenexai.com that then tries to message VS Code.
            const errorUrl = new URL(redirect_uri);
            errorUrl.searchParams.set('error', 'invalid_credentials');
            errorUrl.searchParams.set('message', 'Invalid email or password.');
            res.redirect(errorUrl.toString());
            return;
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            const errorUrl = new URL(redirect_uri);
            errorUrl.searchParams.set('error', 'invalid_credentials');
            errorUrl.searchParams.set('message', 'Invalid email or password.');
            res.redirect(errorUrl.toString());
            return;
        }

        if (!user.isEmailVerified) {
            const errorUrl = new URL(redirect_uri);
            errorUrl.searchParams.set('error', 'email_unverified');
            errorUrl.searchParams.set('message', 'Please verify your email address before logging in.');
            res.redirect(errorUrl.toString());
            return;
        }
        
        res.redirect(redirect_uri);
        return;

    } catch (error) {
        console.error("Error during VS Code login:", error);
        // Pass error to Express error handling middleware
        next(error);
    }
});
// --- End New Login Handler for VS Code ---


// POST /api/auth/logout (for session-based logout)
router.post('/logout', (req: Request, res: Response, next: NextFunction) => {
    console.log(`[Auth Route] Received POST request for /api/auth/logout. User authenticated: ${req.isAuthenticated()}`); // <-- Add logging
    req.logout((err) => { // req.logout requires a callback
        if (err) {
            console.error('[Auth Route] Error during req.logout:', err); // <-- Log logout errors
            return next(err);
        }
        console.log('[Auth Route] req.logout successful. Attempting session destroy.'); // <-- Log success
        req.session.destroy((destroyErr) => { // Optional: Destroy session completely
             if (destroyErr) {
                 console.error("Error destroying session:", destroyErr);
                 // Decide if you want to send an error or just log it
             }
             res.json({ message: 'Logout successful.' });
        });
    });
});

// GET /api/auth/current_user (Check login status)
router.get('/current_user', (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
         // Send back user info (excluding password and potentially sensitive fields)
         const user = req.user as IUser; // Cast req.user
         const userResponse = { id: user._id, email: user.email, displayName: user.displayName, googleId: user.googleId, githubId: user.githubId, plan: user.plan };
         res.json({ user: userResponse });
     } else {
        res.json({ user: null }); // No user logged in
    }
});


// --- Google OAuth Routes ---

// GET /api/auth/google (Initiate Google OAuth flow)
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'] // Request profile and email access
}));

// GET /api/auth/google/callback (Google OAuth callback URL)
router.get('/google/callback', (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('google', { failureRedirect: '/login?error=google_failed', session: true }, (err: Error | null, user: IUser | false, info: unknown) => {
        if (err) { return next(err); }
        if (!user) {
            // Send error message back to opener window
            const frontendUrl = process.env.FRONTEND_URL; // Get frontend URL
            let targetOrigin: string;
            if (frontendUrl) {
                targetOrigin = `'${frontendUrl}'`;
            } else {
                targetOrigin = "'*'";
            }
            // Safely access message from info object
            const errorMessage = (info && typeof info === 'object' && 'message' in info && typeof info.message === 'string')
                ? info.message
                : 'Google authentication failed.';
            console.log(`[Auth Callback - Google Error] Sending error message to origin: ${frontendUrl || 'Not Set (using *)'}`);
            const messagePayload = JSON.stringify({ type: 'auth-error', error: errorMessage });
            const script = `
                 <!DOCTYPE html>
                <html>
                <head><title>Authentication Failed</title></head>
                <body>
                    <script>
                        try {
                            console.log('Popup: Attempting postMessage (error)...');
                            // Use targetOrigin defined above
                             if (window.opener) {
                                window.opener.postMessage(${messagePayload}, ${targetOrigin});
                                console.log('Popup: Error message sent to:', ${targetOrigin});
                                // Add a small delay before closing
                                setTimeout(() => window.close(), 100);
                            } else {
                                console.error('Popup: window.opener is not available.');
                                document.body.innerText = 'Error: Could not communicate back to the original window. Please close this window manually.';
                            }
                        } catch (e) {
                            console.error('Popup: Error executing postMessage script:', e);
                            document.body.innerText = 'An error occurred during authentication. Please close this window.';
                        }
                    </script>
                     <p>Authentication failed: ${errorMessage}. Closing this window...</p>
                </body>
                </html>
            `;
            return res.send(script);
        }
        // Login the user to establish the session
         req.logIn(user, (loginErr) => {
             if (loginErr) { return next(loginErr); }
             // --- Secure postMessage for Success ---
             const frontendUrlSuccess = process.env.FRONTEND_URL;
             if (!frontendUrlSuccess) {
                 console.error("CRITICAL: FRONTEND_URL not set. Cannot securely send user data via postMessage.");
                 // Optionally send a generic error back or just close
                 return res.status(500).send("<script>alert('Configuration error: Cannot complete login.'); window.close();</script>");
             }
             const userResponse = { id: user._id, email: user.email, displayName: user.displayName, googleId: user.googleId, githubId: user.githubId, plan: user.plan };
             const script = `
                 <script>
                    window.opener.postMessage({ type: 'auth-success', user: ${JSON.stringify(userResponse)} }, '${frontendUrlSuccess}');
                    window.close();
                </script>
            `;
            res.send(script);
             // --- End Secure postMessage ---
        });
    })(req, res, next);
});


// --- GitHub OAuth Routes ---

// GET /api/auth/github (Initiate GitHub OAuth flow)
router.get('/github', passport.authenticate('github', {
    scope: ['user:email'] // Request email access
}));

// GET /api/auth/github/callback (GitHub OAuth callback URL)
router.get('/github/callback', (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('github', { failureRedirect: '/login?error=github_failed', session: true }, (err: Error | null, user: IUser | false, info: unknown) => {
        if (err) { return next(err); }
        if (!user) {
            // Send error message back to opener window
            const frontendUrl = process.env.FRONTEND_URL; // Get frontend URL
            let targetOrigin: string;
            if (frontendUrl) {
                targetOrigin = `'${frontendUrl}'`;
            } else {
                targetOrigin = "'*'";
            }
            // Safely access message from info object
            const errorMessage = (info && typeof info === 'object' && 'message' in info && typeof info.message === 'string')
                ? info.message
                : 'GitHub authentication failed.';
            console.log(`[Auth Callback - Google Error] Sending error message to origin: ${frontendUrl || 'Not Set (using *)'}`);
            const messagePayload = JSON.stringify({ type: 'auth-error', errorMessage });
            const script = `
                 <!DOCTYPE html>
                <html>
                <head><title>Authentication Failed</title></head>
                <body>
                    <script>
                        try {
                            console.log('Popup: Attempting postMessage (error)...');
                            // Use targetOrigin defined above
                             if (window.opener) {
                                window.opener.postMessage(${messagePayload}, ${targetOrigin});
                                console.log('Popup: Error message sent to:', ${targetOrigin});
                                // Add a small delay before closing
                                setTimeout(() => window.close(), 100);
                            } else {
                                console.error('Popup: window.opener is not available.');
                                document.body.innerText = 'Error: Could not communicate back to the original window. Please close this window manually.';
                            }
                        } catch (e) {
                            console.error('Popup: Error executing postMessage script:', e);
                            document.body.innerText = 'An error occurred during authentication. Please close this window.';
                        }
                    </script>
                     <p>Authentication failed: ${errorMessage}. Closing this window...</p>
                </body>
                </html>
            `;
            return res.send(script);
        }
        // Login the user to establish the session
         req.logIn(user, (loginErr) => {
             if (loginErr) { return next(loginErr); }
             // --- Secure postMessage for Success ---
             const frontendUrlSuccess = process.env.FRONTEND_URL;
             if (!frontendUrlSuccess) {
                 console.error("CRITICAL: FRONTEND_URL not set. Cannot securely send user data via postMessage.");
                 // Optionally send a generic error back or just close
                 return res.status(500).send("<script>alert('Configuration error: Cannot complete login.'); window.close();</script>");
             }
             const userResponse = { id: user._id, email: user.email, displayName: user.displayName, googleId: user.googleId, githubId: user.githubId, plan: user.plan };
             const script = `
                 <script>
                    window.opener.postMessage({ type: 'auth-success', user: ${JSON.stringify(userResponse)} }, '${frontendUrlSuccess}');
                    window.close();
                </script>
            `;
            res.send(script);
             // --- End Secure postMessage ---
        });
    })(req, res, next);
});

// Define the email verification handler
const verifyEmailHandler: RequestHandler = async (req, res, next) => {
    const { token } = req.params;

    if (!token) {
        res.status(400).json({ message: 'Verification token is missing.' });
        return;
    }

    try {
        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationTokenExpires: { $gt: Date.now() }, // Check if token is not expired
        });

        if (!user) {
            res.status(400).json({ message: 'Invalid or expired verification token.' });
            return;
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined; // Clear the token
        user.emailVerificationTokenExpires = undefined; // Clear the expiry

        await user.save();

        // Optionally, log the user in automatically after verification
        // await new Promise<void>((resolve, reject) => {
        //     req.logIn(user, (err) => {
        //         if (err) return reject(err);
        //         resolve();
        //     });
        // });

        // Instead of redirecting from backend, send a success message.
        // The frontend will handle the redirect or UI update.
        res.status(200).json({ message: 'Email verified successfully.' });
        return;

    } catch (error) {
        console.error("Error during email verification:", error);
        next(error);
    }
};

// GET /api/auth/verify-email/:token
router.get('/verify-email/:token', verifyEmailHandler);


export default router;
