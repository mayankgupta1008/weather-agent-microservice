import { z } from "zod";
import { tool } from "@langchain/core/tools";

export const formatEmailTool = tool(
  async ({
    weatherData,
    city,
  }: {
    weatherData: {
      temperature: number;
      feelsLike: number;
      description: string;
      humidity: number;
      windSpeed: number;
      icon: string;
    };
    city: string;
  }) => {
    try {
      const emailBody = `Dear User,

Here's your daily weather update for ${city}:

🌡️ Temperature: ${weatherData.temperature}°C
🤔 Feels Like: ${weatherData.feelsLike}°C
☁️ Conditions: ${weatherData.description}
💧 Humidity: ${weatherData.humidity}%
💨 Wind Speed: ${weatherData.windSpeed} m/s

Have a great day!

Best regards,
Your Weather Bot`;

      return emailBody;
    } catch (error) {
      console.error("Error formatting weather email:", error);
      return "Error formatting weather email";
    }
  },
  {
    name: "formatWeatherEmail",
    description:
      "Formats weather data, city, and an AI summary into an email body.",
    schema: z.object({
      weatherData: z
        .object({
          temperature: z.number(),
          feelsLike: z.number(),
          description: z.string(),
          humidity: z.number(),
          windSpeed: z.number(),
          icon: z.string(),
        })
        .describe("The raw weather forecast or current conditions."),
      city: z.string().describe("The name of the city for the weather data."),
    }),
  }
);
