import { z } from "zod";
import { tool } from "@langchain/core/tools";
import axios from "axios";

export const fetchWeatherTool = tool(
  async ({ city }: { city: string }) => {
    try {
      const apiKey = process.env.OPENWEATHER_API_KEY;

      if (!apiKey) {
        throw new Error(
          "OpenWeather API key is not set in environment variables."
        );
      }

      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather`,
        {
          params: {
            q: city,
            appid: apiKey,
            units: "metric",
          },
        }
      );
      const data = response.data;

      return {
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        icon: data.weather[0].icon,
      };
    } catch (error) {
      console.log("Error in fetchWeatherTool:");
      throw new Error(`Failed to fetch weather for ${city}: ${error}`);
    }
  },
  {
    name: "fetchWeather",
    description:
      "Fetches the current weather for a given city. Input should be a JSON object with a 'city' field.",
    schema: z.object({
      city: z.string().min(1, "City is required"),
    }),
  }
);
