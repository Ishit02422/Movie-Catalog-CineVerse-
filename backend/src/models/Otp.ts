import mongoose, { Document, Schema } from "mongoose";

export interface IOtpDoc extends Document {
  identifier: string; // phone or email
  phone?: string;
  email?: string;
  otp: string;
  expires_at: Date;
  created_at: Date;
}

const OtpSchema = new Schema<IOtpDoc>(
  {
    identifier: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expires_at: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Auto-delete expired OTP documents
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false,
    },
  }
);

export const Otp = mongoose.model<IOtpDoc>("Otp", OtpSchema);

