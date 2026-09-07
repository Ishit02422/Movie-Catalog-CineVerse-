import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI =
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/movie_catalog";

    const conn = await mongoose.connect(mongoURI);

    console.log(`🍃 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error: any) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Do not crash the entire process immediately in dev mode, but log clearly
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB disconnected. Attempting to reconnect...");
});

mongoose.connection.on("error", (err: any) => {
  console.error("❌ MongoDB connection error:", err);
});
