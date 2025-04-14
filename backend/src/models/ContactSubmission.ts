import mongoose, { Schema, Document } from 'mongoose';

export interface IContactSubmission extends Document {
  firstName: string;
  lastName: string;
  email: string;
  company?: string; // Optional field
  message: string;
  createdAt: Date;
}

const ContactSubmissionSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, match: /.+@.+\..+/ }, // Basic email validation (removed unnecessary escape)
  company: { type: String },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IContactSubmission>('ContactSubmission', ContactSubmissionSchema);
