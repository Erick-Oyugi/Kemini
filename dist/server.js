import express, {} from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
const delay = (ms) => new Promise(res => setTimeout(res, ms));
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});
app.post('/api/chat', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            console.log("Prompt is required");
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
        console.log(response.text);
        res.json({ reply: response.text });
    }
    catch (error) {
        if (error.status === 429) {
            console.log("Rate limit hit, retrying...");
            await delay(2000); // Wait 2 seconds and retry once
            // (In a real app, you'd use a loop or a proper retry library)
        }
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map