import express, { Router, Request, Response, NextFunction } from 'express'; // Import Router type
import passport from 'passport';
import User, { IUser } from '../models/User'; // Adjust path if necessary

const router: Router = express.Router(); // Explicitly type the router

// --- Local Authentication Routes ---

// POST /api/auth/signup (Email/Password Registration)
router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, displayName } = req.body;

    // Basic validation
    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required.' });
        return; // Explicit return
    }
    // Add more robust validation as needed (e.g., password complexity)

    try {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            res.status(409).json({ message: 'Email already exists.' }); // 409 Conflict
            return; // Explicit return
        }

        const newUser = new User({
            email: email.toLowerCase(),
            password: password, // Password will be hashed by the pre-save hook in User model
            displayName: displayName || email.split('@')[0] // Default display name
        });

        await newUser.save();

        // Log in the user immediately after signup
        req.logIn(newUser, (err) => {
            if (err) {
                next(err); // Pass error
                return; // Explicit return
            }
            // Send back user info (excluding password)
            const userResponse = { id: newUser._id, email: newUser.email, displayName: newUser.displayName };
            res.status(201).json({ message: 'Signup successful.', user: userResponse });
            return; // Explicit return
        });

    } catch (error) {
        next(error); // Pass error to the error handling middleware
        return; // Explicit return
    }
});

// POST /api/auth/login (Email/Password Login)
router.post('/login', (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', (err: any, user: IUser | false, info: { message: string }) => {
        if (err) { return next(err); }
        if (!user) {
            // Use the message from the LocalStrategy verify callback
            return res.status(401).json({ message: info.message || 'Login failed.' });
        }
        req.logIn(user, (err) => {
            if (err) { return next(err); }
            // Send back user info (excluding password)
            const userResponse = { id: user._id, email: user.email, displayName: user.displayName };
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
        const userResponse = { id: user._id, email: user.email, displayName: user.displayName, googleId: user.googleId, githubId: user.githubId };
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
router.get('/google/callback', passport.authenticate('google', {
    // successRedirect: '/dashboard', // Redirect on success (adjust URL) - Frontend should handle this
    failureRedirect: '/login?error=google_failed' // Redirect on failure (adjust URL) - Frontend should handle this
}), (req: Request, res: Response) => {
    // Successful authentication. Frontend should ideally poll /api/auth/current_user or handle redirect.
    // Sending user data back directly might be useful for SPAs.
    const user = req.user as IUser;
    // Successful authentication. Redirect to the frontend.
    // The frontend should handle the session/token and update its state.
    res.redirect(process.env.FRONTEND_URL || '/');
});


// --- GitHub OAuth Routes ---

// GET /api/auth/github (Initiate GitHub OAuth flow)
router.get('/github', passport.authenticate('github', {
    scope: ['user:email'] // Request email access
}));

// GET /api/auth/github/callback (GitHub OAuth callback URL)
router.get('/github/callback', passport.authenticate('github', {
    // successRedirect: '/dashboard', // Redirect on success (adjust URL) - Frontend should handle this
    failureRedirect: '/login?error=github_failed' // Redirect on failure (adjust URL) - Frontend should handle this
}), (req: Request, res: Response) => {
    // Successful authentication. Frontend should ideally poll /api/auth/current_user or handle redirect.
    const user = req.user as IUser;
    // Successful authentication. Redirect to the frontend.
    // The frontend should handle the session/token and update its state.
    res.redirect(process.env.FRONTEND_URL || '/');
});


export default router;
