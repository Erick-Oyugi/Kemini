import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";
import OpenAI from 'openai';
import { routes } from './routes/routes.js';
import os from 'os'
import { username } from 'username';




dotenv.config();

const app: Application = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());
app.use(routes)

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const userInfo = os.userInfo();

const machineUser = await username();
console.log(machineUser); // => 'erick'

// const machineUser = userInfo.username;

console.log(`Current machine user is: ${machineUser}`);


app.get('/api/system-user', (req, res) => {
  try {
    //const user = os.userInfo().username;
    const user = username();
    res.json({ username: user });
  } catch (error) {
    res.status(500).json({ error: "Could not read machine username" });
  }
});

app.get("/", (req : Request, res : Response) => {
  res.send("Kemini API running");
});

app.post('/api/chat', async (req: Request, res: Response) => {
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY as string,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
  try {
    const { prompt } = req.body;

if (!prompt || typeof prompt !== 'string') {
      console.log("Valid text prompt is required");
      return res.status(400).json({ error: "Prompt string is required" });
    }

    const cleanUserPrompt: string = prompt.trim();

    /**
     * FIX: Use ai.models.generateContent instead of getGenerativeModel.
     * In the new SDK, 'text' is a property on the response, not a function call.
     */
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Use 1.5-flash or the latest 2.0-flash
      contents: cleanUserPrompt
    });

    console.log(response.text)

    res.json({ reply: response.text });
  } catch (error : any) {

  // Checking both error.status and error.statusCode depending on SDK version
    const statusCode = error.status || error.statusCode || (error.response && error.response.status);

    if (statusCode === 429) {
      console.warn("⚠️ Gemini Rate limit hit (429)! Redirecting traffic to ChatGPT...");
      try {
    const userMessageContent = typeof req.body.prompt === 'string' ? req.body.prompt : "Hello";
    const gptResponse : any = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { 
              role: "user", 
              content: userMessageContent // TypeScript is now guaranteed this is a string, not a function!
            }
          ],
        });
        const gptText = gptResponse.choices[0].message.content;
        console.log("✅ Successfully resolved using ChatGPT fallback.");
        
        // Return matching structure so your React frontend doesn't break
        return res.json({ reply: gptText });

      } catch (openAiError: any) {
        console.error("❌ Secondary Failover to OpenAI failed:", openAiError);
        return res.status(500).json({ error: "Both Gemini and ChatGPT failover failed." });
      }
    }

    // For any other unexpected errors (500, 400, auth problems, etc.)
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});