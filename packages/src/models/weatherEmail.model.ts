import mongoose from "mongoose";

const weatherEmailSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    city: { type: String, required: true },
    recipientEmail: { type: String, required: true },
    enabled: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const WeatherEmail = mongoose.model("WeatherEmail", weatherEmailSchema);
export default WeatherEmail;
