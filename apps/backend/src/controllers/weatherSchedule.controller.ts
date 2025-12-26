import { Request, Response } from "express";
import WeatherEmail from "@weather-agent/shared/src/models/weatherEmail.model.js";

export const createWeatherSchedule = async (req: Request, res: Response) => {
  try {
    const { city } = (req as any).body;
    const authUser = (req as any).user;

    const weatherEmail = new WeatherEmail({
      user: authUser.id,
      city,
      recipientEmail: authUser.email,
    });
    await weatherEmail.save();
    return res.status(201).json({
      message: "Weather schedule created successfully",
      weatherEmail,
    });
  } catch (error: any) {
    console.log("Error inside createSchedule controller", error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const deleteWeatherSchedule = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    const { scheduleId } = (req as any).params;

    const weatherEmail = await WeatherEmail.findOneAndDelete({
      _id: scheduleId,
      user: authUser.id,
    });
    if (!weatherEmail) {
      return res.status(404).json({
        message: "Weather schedule not found",
      });
    }

    return res.status(200).json({
      message: "Weather schedule deleted successfully",
    });
  } catch (error: any) {
    console.log("Error inside deleteSchedule controller", error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
