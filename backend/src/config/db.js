import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.warn("MONGO_URI not set. Skipping DB connection.");
      return;
    }

    await mongoose.connect(uri);

    console.log("Database connection established.");
  } catch (error) {
    console.error("Database connection failed.", error);
    // Do not exit the process here so the server (and Swagger UI) can still start.
  }
};