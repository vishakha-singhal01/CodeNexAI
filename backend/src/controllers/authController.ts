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

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { token, password } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    user.password = password; // This will trigger the pre-save hook to hash the password
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    next(error);
  }
};
