import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true,
    },
    weatherEmails: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WeatherEmail",
      },
    ],
  },
  {
    timestamps: true,
    collection: "user",
  }
);

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
