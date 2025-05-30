import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../services/emailService';

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiration = new Date(Date.now() + 3600000); // 1 hour

    await user.save();

    if (user.email) {
      await sendPasswordResetEmail(user.email, resetToken).catch(err => {
        console.error("Error sending password reset email:", err);
        return next(err); // Pass the error to the error handler
      });
      res.status(200).json({ message: 'Password reset email sent.' });
    } else {
      res.status(400).json({ message: 'Email address not found for this user.' });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    next(error); // Pass the error to the error handling middleware
  }
};
