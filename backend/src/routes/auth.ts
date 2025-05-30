import express, { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import User, { IUser } from '../models/User';
import { sendVerificationEmail } from '../services/emailService';
import { resetPassword, forgotPassword } from '../controllers/authController';

const router: Router = express.Router();

const forgotPasswordHandler: RequestHandler = async (req, res) => {
  await forgotPassword(req, res);
};

const resetPasswordHandler: RequestHandler = async (req, res) => {
  await resetPassword(req, res);
};

// Forgot Password Route
router.post('/forgot-password', forgotPasswordHandler);
router.post('/reset-password', resetPasswordHandler);

// --- Rate Limiter for Auth Routes ---
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many login/signup attempts from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

// --- Local Authentication Routes ---

const signupHandler: RequestHandler = async (req, res, next) => {
    const { email, password, username, displayName } = req.body;

    // Enhanced Input Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required.' });
        return undefined;
    }
    if (!emailRegex.test(email)) {
        res.status(400).json({ message: 'Invalid email format.' });
        return undefined;
    }
    if (password.length < 8) {
        res.status(400).json({ message: 'Password must be at least 8 characters long.' });
        return undefined;
    }
    // Consider adding more complex password rules (uppercase, number, symbol) if needed

    try {
        const normalizedEmail = email.toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            res.status(409).json({ message: 'Email already exists.' });
            return undefined;
        }

        const newUser = new User({
            email: normalizedEmail,
            password: password,
            username: username ? username.toLowerCase() : undefined,
            displayName: displayName || username || normalizedEmail.split('@')[0]
        });

        await newUser.save();

        const verificationToken = crypto.randomBytes(32).toString('hex');
        newUser.emailVerificationToken = verificationToken;
        newUser.emailVerificationTokenExpires = new Date(Date.now() + 15 * 60 * 1000);

        await newUser.save();

        try {
            if (newUser.email) {
                await sendVerificationEmail(newUser.email, verificationToken);
            } else {
                console.warn(`User ${newUser._id} signed up without an email. Skipping verification email.`);
            }
        } catch (emailError) {
            console.error("Error sending verification email:", emailError);
            return next(new Error('Signup succeeded, but failed to send verification email. Please try logging in and resending verification.'));
        }

        res.status(201).json({ 
            message: 'Signup successful. Please check your email to verify your account.'
        });

    } catch (error) {
        next(error);
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
        req.logIn(user, (loginErr) => {
            if (loginErr) { return next(loginErr); }

            const userResponse = { id: user._id, email: user.email, displayName: user.displayName, plan: user.plan, isEmailVerified: user.isEmailVerified };
            return res.json({ message: 'Login successful.', user: userResponse });
        });
    })(req, res, next);
});

// --- New Login Handler for VS Code (JWT based) ---
router.post('/vscode-login', authLimiter, async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, redirect_uri } = req.body;

    if (!redirect_uri || !redirect_uri.startsWith('vscode://')) {
        res.status(400).send("Invalid or missing redirect_uri for VS Code login.");
        return;
    }

    try {
        const normalizedEmail = email.toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
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
        next(error);
    }
});
// --- End New Login Handler for VS Code ---


// POST /api/auth/logout (for session-based logout)
router.post('/logout', (req: Request, res: Response, next: NextFunction) => {
    console.log(`[Auth Route] Received POST request for /api/auth/logout. User authenticated: ${req.isAuthenticated()}`);
    req.logout((err) => {
        if (err) {
            console.error('[Auth Route] Error during req.logout:', err);
            return next(err);
        }
        console.log('[Auth Route] req.logout successful. Attempting session destroy.');
        req.session.destroy((destroyErr) => {
             if (destroyErr) {
                 console.error("Error destroying session:", destroyErr);
             }
             res.json({ message: 'Logout successful.' });
        });
    });
});

// GET /api/auth/current_user (Check login status)
router.get('/current_user', (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
         const user = req.user as IUser;
         const userResponse = { id: user._id, email: user.email, displayName: user.displayName, googleId: user.googleId, githubId: user.githubId, plan: user.plan };
         res.json({ user: userResponse });
     } else {
        res.json({ user: null });
    }
});


// --- Google OAuth Routes ---

// GET /api/auth/google (Initiate Google OAuth flow)
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// GET /api/auth/google/callback (Google OAuth callback URL)
router.get('/google/callback', (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('google', { failureRedirect: '/login?error=google_failed', session: true }, (err: Error | null, user: IUser | false, info: { message: string }) => {
        if (err) { return next(err); }
        if (!user) {
            const frontendUrl = process.env.FRONTEND_URL;
            let targetOrigin: string;
            if (frontendUrl) {
                targetOrigin = `'${frontendUrl}'`;
            } else {
                targetOrigin = "'*'";
            }
            const errorMessage = (info && typeof info === 'object' && 'message' in info && typeof info.message === 'string')
                ? info.message
                : 'Google authentication failed.';
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
                             if (window.opener) {
                                window.opener.postMessage(${messagePayload}, ${targetOrigin});
                                console.log('Popup: Error message sent to:', ${targetOrigin});
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
         req.logIn(user, (loginErr) => {
             if (loginErr) { return next(loginErr); }
             const frontendUrlSuccess = process.env.FRONTEND_URL;
             if (!frontendUrlSuccess) {
                 console.error("CRITICAL: FRONTEND_URL not set. Cannot securely send user data via postMessage.");
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
         });
    })(req, res, next);
});


// --- GitHub OAuth Routes ---

// GET /api/auth/github (Initiate GitHub OAuth flow)
router.get('/github', passport.authenticate('github', {
    scope: ['user:email']
}));

// GET /api/auth/github/callback (GitHub OAuth callback URL)
router.get('/github/callback', (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('github', { failureRedirect: '/login?error=github_failed', session: true }, (err: Error | null, user: IUser | false, info: { message: string }) => {
        if (err) { return next(err); }
        if (!user) {
            const frontendUrl = process.env.FRONTEND_URL;
            let targetOrigin: string;
            if (frontendUrl) {
                targetOrigin = `'${frontendUrl}'`;
            } else {
                targetOrigin = "'*'";
            }
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
                             if (window.opener) {
                                window.opener.postMessage(${messagePayload}, ${targetOrigin});
                                console.log('Popup: Error message sent to:', ${targetOrigin});
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
         req.logIn(user, (loginErr) => {
             if (loginErr) { return next(loginErr); }
             const frontendUrlSuccess = process.env.FRONTEND_URL;
             if (!frontendUrlSuccess) {
                 console.error("CRITICAL: FRONTEND_URL not set. Cannot securely send user data via postMessage.");
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
        user.emailVerificationToken = undefined;
        user.emailVerificationTokenExpires = undefined;

        await user.save();

        // Optionally, log the user in automatically after verification
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            const userResponse = { id: user._id, email: user.email, displayName: user.displayName, googleId: user.googleId, githubId: user.githubId, plan: user.plan };
            res.json({ message: 'Email verified successfully.', user: userResponse });
        });
        return;

    } catch (error) {
        console.error("Error during email verification:", error);
        next(error);
    }
};

// GET /api/auth/verify-email/:token
router.get('/verify-email/:token', verifyEmailHandler);


export default router;
