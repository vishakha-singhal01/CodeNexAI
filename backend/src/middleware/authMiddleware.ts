import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User'; // Adjust path as necessary

const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthenticatedRequest extends Request {
    user?: IUser; // Add user property to Request
    token?: string; // Optionally add token if needed downstream
}

export const protectWithJwt = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let token;

    if (!JWT_SECRET) {
        console.error("CRITICAL: JWT_SECRET is not defined. Cannot authenticate JWT.");
        return res.status(500).json({ message: 'Server configuration error.' });
    }

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

            // Get user from the token
            // Ensure your JWT payload contains the user's ID as 'id'
            if (decoded.id) {
                const user = await User.findById(decoded.id).select('-password'); // Exclude password
                if (user) {
                    req.user = user; // Attach user to the request object
                    req.token = token; // Optionally attach token
                    next();
                } else {
                    res.status(401).json({ message: 'Not authorized, user not found for token.' });
                }
            } else {
                res.status(401).json({ message: 'Not authorized, token invalid (missing ID).' });
            }
        } catch (error) {
            console.error('JWT Verification Error:', error);
            res.status(401).json({ message: 'Not authorized, token failed verification.' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token provided.' });
    }
};
