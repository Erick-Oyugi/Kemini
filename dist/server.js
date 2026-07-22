import express, {} from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";
import OpenAI from 'openai';
import { routes } from './routes/routes.js';
import os from 'os';
import { username } from 'username';
import multer from 'multer';
dotenv.config();
const app = express();
const PORT = Number(process.env.PORT) || 3000;
app.use(cors());
app.use(express.json());
app.use(routes);
const delay = (ms) => new Promise(res => setTimeout(res, ms));
const userInfo = os.userInfo();
const machineUser = await username();
console.log(machineUser); // => 'erick'
// const machineUser = userInfo.username;
console.log(`Current machine user is: ${machineUser}`);
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Strict 5MB upload limit
});
function fileToGenerativePart(buffer, mimeType) {
    return {
        inlineData: {
            data: buffer.toString("base64"),
            mimeType
        },
    };
}
app.get('/api/system-user', (req, res) => {
    try {
        //const user = os.userInfo().username;
        const user = username();
        res.json({ username: user });
    }
    catch (error) {
        res.status(500).json({ error: "Could not read machine username" });
    }
});
app.get("/", (req, res) => {
    res.send("Kemini API running");
});
app.post('/api/chat', upload.single('image'), async (req, res) => {
    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
    });
    try {
        const { prompt } = req.body;
        const imageFile = req.file;
        console.log(prompt);
        if (!prompt || typeof prompt !== 'string') {
            console.log("Valid text prompt is required");
            return res.status(400).json({ error: "Prompt string is required" });
        }
        const cleanUserPrompt = prompt.trim();
        const contentsPayload = [cleanUserPrompt];
        if (imageFile) {
            console.log(`Processing attached image: ${imageFile.originalname} (${imageFile.mimetype})`);
            const imagePart = fileToGenerativePart(imageFile.buffer, imageFile.mimetype);
            contentsPayload.push(imagePart);
        }
        // --- PRIMARY ROUTE: GEMINI 2.5 FLASH ---
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contentsPayload
        });
        console.log(response.text);
        return res.json({ reply: response.text, provider: 'gemini' });
    }
    catch (error) {
        console.error("Gemini API Error details:", error);
        const statusCode = error.status || error.statusCode || (error.response && error.response.status);
        const errString = error.toString() || error.message || "";
        const isRateLimitedOrUnavailable = statusCode === 429 ||
            statusCode === 503 ||
            errString.includes("429") ||
            errString.includes("503") ||
            errString.includes("UNAVAILABLE") ||
            errString.includes("high demand");
        // --- FAILOVER ROUTE: GEMMA ---
        if (isRateLimitedOrUnavailable) {
            console.warn("⚠️ Gemini Primary overloaded! Seamlessly rerouting traffic to Gemma...");
            try {
                // FIX: Safely re-extract and trim the prompt directly from the request body inside this block
                const fallbackPrompt = typeof req.body.prompt === 'string' ? req.body.prompt.trim() : "Analyze this context";
                let gemmaPrompt = fallbackPrompt;
                // If an image was attached, append a note since Gemma is a text-only model
                if (req.file) {
                    gemmaPrompt = `[System Note: An image was attached by the user, but the primary multimodal engine is experiencing high traffic. Please answer their question based on text context alone.]\n\n${fallbackPrompt}`;
                }
                // Call Gemma using your existing 'ai' instance
                const gemmaResponse = await ai.models.generateContent({
                    model: "gemma-4-26b-a4b-it",
                    contents: gemmaPrompt,
                });
                console.log("✅ Successfully resolved using Gemma fallback.");
                return res.json({
                    reply: gemmaResponse.text,
                    provider: 'gemma',
                    fallbackNotice: 'Traffic rerouted to Gemma due to heavy Gemini demand.'
                });
            }
            catch (gemmaError) {
                console.error("❌ Secondary Failover to Gemma failed:", gemmaError);
                return res.status(502).json({ error: "Both Gemini and Gemma failover chains failed." });
            }
        }
        // For any other unexpected errors (400, bad keys, etc.)
        return res.status(500).json({
            error: "Internal Server Error",
            data: error.message
        });
    }
    ;
});
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map