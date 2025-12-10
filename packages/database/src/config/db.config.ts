import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log("MongoDB already connected");
      return;
    }

    const uri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/weather-agent";
    if (!uri) {
      throw new Error(
        "Please provide MONGODB_URI in the environment variables"
      );
    }

    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Error inside db.config.ts file", error);
    process.exit(1);
  }
};

export default connectDB;
