import { tool } from "@langchain/core/tools";
import { z } from "zod";
import nodemailer from "nodemailer";

export const sendEmailTool = tool(
  async ({
    email,
    subject,
    body,
  }: {
    email: string;
    subject: string;
    body: string;
  }) => {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASSWORD,
        },
      });
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: subject,
        text: body,
      };
      await transporter.sendMail(mailOptions);
      return "Email sent successfully";
    } catch (error) {
      console.error("Error sending email:", error);
      return "Error sending email";
    }
  },
  {
    name: "sendEmail",
    description: "Sends an email to a specified recipient.",
    schema: z.object({
      email: z.email(),
      subject: z.string(),
      body: z.string(),
    }),
  }
);
