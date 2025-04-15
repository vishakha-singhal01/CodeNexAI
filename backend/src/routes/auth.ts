import express, { Router, Request, Response, NextFunction, RequestHandler } from 'express'; // Import RequestHandler
import passport from 'passport';
import rateLimit from 'express-rate-limit'; // Import rate-limiter
import User, { IUser } from '../models/User'; // Adjust path if necessary

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
    const { email, password, displayName } = req.body;

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
            displayName: displayName || normalizedEmail.split('@')[0] // Default display name from normalized email
        });

        await newUser.save();

        // Wrap req.logIn in a Promise to handle async nature correctly within RequestHandler
        await new Promise<void>((resolve, reject) => {
            req.logIn(newUser, (err) => {
                if (err) {
                    console.error("Error during req.logIn after signup:", err);
                    // Reject the promise, which will be caught by the outer catch block
                    return reject(new Error('Login after signup failed.'));
                }
                resolve(); // Resolve the promise if login is successful
            });
        });

        // If the promise resolved (login successful), send the success response
        const userResponse = { id: newUser._id, email: newUser.email, displayName: newUser.displayName, plan: newUser.plan };
        res.status(201).json({ message: 'Signup successful.', user: userResponse });
        // Implicitly returns Promise<void> here

    } catch (error) {
        // Catch errors from findOne, save, or the login Promise rejection
        next(error); // Pass error to the error handling middleware
        // Implicitly returns Promise<void> here
    }
};

// Apply the handler and limiter to the signup route
router.post('/signup', authLimiter, signupHandler);

// POST /api/auth/login (Email/Password Login)
// Apply the limiter to the login route
router.post('/login', authLimiter, (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', (err: Error | null, user: IUser | false, info: { message: string }) => {
        if (err) { return next(err); }
        if (!user) {
            // Use the message from the LocalStrategy verify callback
            return res.status(401).json({ message: info.message || 'Login failed.' });
        }
         req.logIn(user, (err) => {
             if (err) { return next(err); }
             // Send back user info (excluding password)
             const userResponse = { id: user._id, email: user.email, displayName: user.displayName, plan: user.plan };
             return res.json({ message: 'Login successful.', user: userResponse });
         });
    })(req, res, next);
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response, next: NextFunction) => {
    req.logout((err) => { // req.logout requires a callback
        if (err) { return next(err); }
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
            const targetOrigin = frontendUrl ? `'${frontendUrl}'` : "'*'"; // Use specific origin if available, else '*' for error message only
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
            const targetOrigin = frontendUrl ? `'${frontendUrl}'` : "'*'"; // Use specific origin if available, else '*' for error message only
            // Safely access message from info object
            const errorMessage = (info && typeof info === 'object' && 'message' in info && typeof info.message === 'string')
                ? info.message
                : 'GitHub authentication failed.';
            console.log(`[Auth Callback - GitHub Error] Sending error message to origin: ${frontendUrl || 'Not Set (using *)'}`);
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


export default router;
