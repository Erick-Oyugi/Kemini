import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";
import OpenAI from 'openai';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY as string,
});

app.get("/", (req : Request, res : Response) => {
  res.send("Kemini API running");
});

app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      console.log("Prompt is required")
      return res.status(400).json({ error: "Prompt is required" });
    }

    /**
     * FIX: Use ai.models.generateContent instead of getGenerativeModel.
     * In the new SDK, 'text' is a property on the response, not a function call.
     */
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Use 1.5-flash or the latest 2.0-flash
      contents: prompt
    });

    console.log(response.text)

    res.json({ reply: response.text });
  } catch (error : any) {
    if (error.status === 429) {
       console.log("Rate limit hit, retrying...");
       await delay(2000); // Wait 2 seconds and retry once
       // (In a real app, you'd use a loop or a proper retry library)
    }
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/ussd", async (req: Request, res: Response) => {
  const { text } = req.body;

  let response = "";

  try {

    // Main menu
    if (text === "") {
      response = `CON Welcome to AI Assistant
1. Chat with AI
2. Exit`;
    }

    // User selected AI chat
    else if (text === "1") {
      response = "CON Enter your question";
    }

    // User entered question
    else if (text.startsWith("1*")) {

      const userQuestion = text.split("*")[1];

      const aiResponse : any = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "user",
            content: userQuestion,
          },
        ],
        max_tokens: 100,
      });

      const answer : any =
        aiResponse.choices[0].message.content || "No response";

      response = `END ${answer.substring(0, 160)}`;
    }

    else {
      response = "END Invalid option";
    }

    res.set("Content-Type", "text/plain");
    res.send(response);

  } catch (error) {
    console.error(error);
    res.send("END System error occurred");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});