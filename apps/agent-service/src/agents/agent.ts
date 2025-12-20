import { Annotation, StateGraph, START, END } from "@langchain/langgraph";
import { fetchWeatherTool } from "./tools/fetchWeather.tool.js";
import { formatEmailTool } from "./tools/formatEmail.tool.js";
import { sendEmailTool } from "./tools/sendEmail.tool.js";

// Define the state that flows through the agent
const StateAnnotation = Annotation.Root({
  city: Annotation<string>,
  recipientEmail: Annotation<string>,
  weatherData: Annotation<any>,
  formattedEmail: Annotation<string>,
  result: Annotation<string>,
  error: Annotation<string | null>,
});

// Step 1: Fetch weather
async function fetchWeatherNode(state: any) {
  try {
    console.log(`Fetching weather for ${state.city}...`);
    const weatherData = await fetchWeatherTool.invoke({ city: state.city });
    console.log("Weather data fetched:", weatherData);
    return { weatherData };
  } catch (error: any) {
    console.error("Error fetching weather:", error);
    return { error: `Failed to fetch weather: ${error.message}` };
  }
}

// Step 2: Format email
async function formatEmailNode(state: any) {
  if (state.error) {
    console.log("Skipping format due to error:", state.error);
    return {};
  }

  try {
    console.log("Formatting email...");
    const formattedEmail = await formatEmailTool.invoke({
      weatherData: state.weatherData,
      city: state.city,
    });
    console.log("Email formatted successfully");
    return { formattedEmail };
  } catch (error: any) {
    console.error("Error formatting email:", error);
    return { error: `Failed to format email: ${error.message}` };
  }
}

// Step 3: Send email
async function sendEmailNode(state: any) {
  if (state.error) {
    console.log("Skipping send due to error:", state.error);
    return { result: `Failed: ${state.error}` };
  }

  try {
    console.log(`Sending email to ${state.recipientEmail}...`);
    const result = await sendEmailTool.invoke({
      email: state.recipientEmail,
      subject: `Weather Update for ${state.city}`,
      body: state.formattedEmail,
    });
    console.log("Email sent successfully!");
    return { result };
  } catch (error: any) {
    console.error("Error sending email:", error);
    return {
      error: `Failed to send email: ${error.message}`,
      result: "Failed to send email",
    };
  }
}

// Build the workflow: fetch → format → send
const workflow = new StateGraph(StateAnnotation)
  .addNode("fetchWeather", fetchWeatherNode)
  .addNode("formatEmail", formatEmailNode)
  .addNode("sendEmail", sendEmailNode)
  .addEdge(START, "fetchWeather")
  .addEdge("fetchWeather", "formatEmail")
  .addEdge("formatEmail", "sendEmail")
  .addEdge("sendEmail", END);

// Export the compiled agent
export const weatherEmailAgent = workflow.compile();
