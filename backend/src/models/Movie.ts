import mongoose, { Document, Schema } from "mongoose";

export interface IMovieDoc extends Document {
  id: string;
  title: string;
  genre: string;
  release_year: number;
  description: string;
  image_url: string;
  status: "active" | "hidden" | "under_review" | "removed";
  is_featured: boolean;
  rating: number;
  views_count: number;
  created_at: Date;
  updated_at: Date;
}

const MovieSchema = new Schema<IMovieDoc>(
  {
    title: {
      type: String,
      required: [true, "Movie title is required"],
      trim: true,
      maxlength: [200, "Movie title cannot exceed 200 characters"],
    },
    genre: {
      type: String,
      required: [true, "Genre is required"],
      trim: true,
      maxlength: [100, "Genre cannot exceed 100 characters"],
    },
    release_year: {
      type: Number,
      required: [true, "Release year is required"],
      min: [1888, "Release year must be valid (>= 1888)"],
      max: [new Date().getFullYear() + 5, "Release year cannot be too far in the future"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    image_url: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "hidden", "under_review", "removed"],
      default: "active",
    },
    is_featured: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 8.0,
      min: 0,
      max: 10,
    },
    views_count: {
      type: Number,
      default: 0,
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
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (_doc, ret: any) {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for high performance search and filtering
MovieSchema.index({ title: "text" });
MovieSchema.index({ title: 1 });
MovieSchema.index({ genre: 1 });
MovieSchema.index({ release_year: 1 });
MovieSchema.index({ genre: 1, release_year: 1 });
MovieSchema.index({ status: 1, is_featured: 1 });

export const Movie = mongoose.model<IMovieDoc>("Movie", MovieSchema);
