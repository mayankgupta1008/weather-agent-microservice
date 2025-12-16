import express from "express";
import { connectDB } from "@weather-agent/shared";

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(
      "Weather agent service connected to DB and is running on PORT:",
      PORT
    );
  });
};

startServer();
