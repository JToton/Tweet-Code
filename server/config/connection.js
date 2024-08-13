import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    console.log("Attempting to connect to MongoDB...");

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("MongoDB connection error:", error);

    // More detailed error logging
    if (error.name === "MongooseServerSelectionError") {
      console.error(
        "Unable to connect to any servers in your MongoDB Atlas cluster. Check your connection string and network access."
      );
    }

    if (
      error.name === "MongooseError" &&
      error.message.includes("buffering timed out")
    ) {
      console.error(
        "Connection attempt timed out. Check your network connection and MongoDB Atlas status."
      );
    }

    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;
