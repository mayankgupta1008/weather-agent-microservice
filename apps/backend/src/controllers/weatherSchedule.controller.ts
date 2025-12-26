import { Request, Response } from "express";
import WeatherEmail from "@weather-agent/shared/src/models/weatherEmail.model.js";
import User from "@weather-agent/shared/src/models/user.model.js";
import mongoose from "mongoose";

export const createWeatherSchedule = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { city } = (req as any).body;
    const authUser = (req as any).user;

    const weatherEmail = new WeatherEmail({
      user: authUser.id,
      city,
      recipientEmail: authUser.email,
    });

    await weatherEmail.save();

    await User.findByIdAndUpdate(
      authUser.id,
      {
        $push: { weatherEmails: weatherEmail._id },
      },
      { new: true, session }
    );

    await session.commitTransaction();

    return res.status(200).json({
      message: "Weather schedule created successfully",
      weatherEmail,
    });
  } catch (error: any) {
    await session.abortTransaction();
    console.log("Error inside createSchedule controller", error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  } finally {
    session.endSession();
  }
};

export const deleteWeatherSchedule = async (req: Request, res: Response) => {
  // Use transaction to ensure data consistency, if weather schedule deletion is not successful, then user should not be updated
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const authUser = (req as any).user;
    const { scheduleId } = (req as any).params;

    const weatherEmail = await WeatherEmail.findOneAndDelete(
      {
        _id: scheduleId,
        user: authUser.id,
      },
      { session }
    );

    if (!weatherEmail) {
      await session.abortTransaction();
      return res.status(404).json({
        message: "Weather schedule not found",
      });
    }

    await User.findByIdAndUpdate(
      authUser.id,
      { $pull: { weatherEmails: weatherEmail._id } },
      { new: true, session }
    );

    await session.commitTransaction();

    return res.status(200).json({
      message: "Weather schedule deleted successfully",
    });
  } catch (error: any) {
    await session.abortTransaction();
    console.log("Error inside deleteSchedule controller", error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  } finally {
    session.endSession();
  }
};
