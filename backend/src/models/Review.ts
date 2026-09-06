import mongoose, { Document, Schema } from "mongoose";

export interface IReviewDoc extends Document {
  id: string;
  user: mongoose.Types.ObjectId;
  user_name: string;
  user_avatar?: string;
  movie: mongoose.Types.ObjectId;
  rating: number; // 1 to 5 stars
  comment: string;
  created_at: Date;
  updated_at: Date;
}

const ReviewSchema = new Schema<IReviewDoc>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    user_name: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
    },
    user_avatar: {
      type: String,
      trim: true,
    },
    movie: {
      type: Schema.Types.ObjectId,
      ref: "Movie",
      required: [true, "Movie reference is required"],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required (1-5)"],
      min: [1, "Rating must be at least 1 star"],
      max: [5, "Rating cannot exceed 5 stars"],
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true,
      maxlength: [1000, "Review cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret: any) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index to ensure one review per user per movie
ReviewSchema.index({ user: 1, movie: 1 }, { unique: true });

export const Review = mongoose.model<IReviewDoc>("Review", ReviewSchema);
