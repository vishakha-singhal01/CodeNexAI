import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  email?: string; // Optional for OAuth users initially
  password?: string; // Optional for OAuth users
  googleId?: string;
  githubId?: string;
  username?: string; // Optional username
  displayName?: string; // Name from OAuth provider or user input
  plan: 'free' | 'pro' | 'enterprise'; // Subscription plan
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple documents to have null email (for OAuth)
    lowercase: true,
    trim: true,
    // Basic email validation, consider a more robust library if needed
    match: [/.+@.+\..+/, 'Please fill a valid email address'],
  },
  password: {
    type: String,
    // Required only if not using OAuth
    // We'll handle this logic during user creation/update
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  githubId: {
    type: String,
    unique: true,
    sparse: true,
  },
  username: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple documents to have null username
    trim: true,
    lowercase: true, // Optional: standardize usernames
  },
  displayName: {
    type: String,
    trim: true,
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to hash password before saving a new user or when password changes
UserSchema.pre<IUser>('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password') || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    // Ensure errors are passed correctly, potentially casting if needed
    next(err as Error);
  }
});

// Method to compare candidate password with the stored hash
UserSchema.methods.comparePassword = function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password || '');
};

export default mongoose.model<IUser>('DocUser', UserSchema);
