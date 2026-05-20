import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import express from "express";
import multer from "multer";

// Verify GEMINI_API_KEY is configured
if (!process.env.GEMINI_API_KEY) {
    console.error("Error: GEMINI_API_KEY is not defined in the environment variables. Please check your .env file.");
    process.exit(1);
}

const app = express();
const upload = multer();
const port = process.env.PORT || 3000;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.use(express.json());

// Express Async Handler wrapper to avoid repetitive try/catch blocks in routes
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Common helper to handle content generation for media files (images, documents, audio)
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {string} defaultPrompt
 */
async function handleMediaGeneration(req, res, defaultPrompt) {
    const { prompt } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({
            status: "error",
            message: "No file uploaded. Please upload a file."
        });
    }

    const contents = [
        prompt || defaultPrompt,
        {
            inlineData: {
                data: file.buffer.toString("base64"),
                mimeType: file.mimetype
            }
        }
    ];

    const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents
    });

    res.json({
        status: "success",
        data: response.text
    });
}

// Routes
app.post("/generate-text", upload.none(), asyncHandler(async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({
            status: "error",
            message: "Prompt is required."
        });
    }

    const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt
    });

    res.json({
        status: "success",
        data: response.text
    });
}));

app.post("/generate-from-image", upload.single("image"), asyncHandler(async (req, res) => {
    await handleMediaGeneration(req, res, "Please analyze this image");
}));

app.post("/generate-from-document", upload.single("document"), asyncHandler(async (req, res) => {
    await handleMediaGeneration(req, res, "Please analyze this document");
}));

app.post("/generate-from-audio", upload.single("audio"), asyncHandler(async (req, res) => {
    await handleMediaGeneration(req, res, "Please tell me what this audio is about");
}));

// Global error handler middleware
app.use((err, req, res, next) => {
    console.error("Error occurred in request handler:", err);
    res.status(err.status || 500).json({
        status: "error",
        message: err.message || "Internal server error"
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});