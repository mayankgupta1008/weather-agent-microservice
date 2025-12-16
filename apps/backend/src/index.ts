import express from "express";
import connectDB from "./lib/db";

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(
      "Backend service connected to DB and is running on PORT:",
      PORT
    );
  });
};

startServer();
