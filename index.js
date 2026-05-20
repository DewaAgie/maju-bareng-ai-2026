import { GoogleGenAI } from "@google/genai";
import "dotenv/config"
import express from "express";
import multer from "multer";

const app = express()
const upload = multer()
const port = 3000;
const GEMINI_MODEL = "gemini-3.5-flash"

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.use(express.json());

app.post("/generate-text", upload.none(), async (req, res) => {
    try {
        const { prompt } = req.body;
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt
        });

        res.json({
            status: "success",
            data: response.text
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: "error",
            message: "Internal server error"
        })
    }
})

app.post("/generate-from-image", upload.single("image"), async (req, res) => {
    try {
        const { prompt } = req.body;
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                {
                    text: prompt,
                    type: "text"
                },
                {
                    inlineData: {
                        data: req.file.buffer.toString('base64'),
                        mimeType: req.file.mimetype
                    },
                    type: "image"
                }
            ]
        })
        res.json({
            status: "success",
            data: response.text
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: "error",
            message: "Internal server error"
        })
    }
})

app.post("/generate-from-document", upload.single("document"), async (req, res) => {
    try {
        const { prompt } = req.body;
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                {
                    text: prompt ? prompt : "Please analyze this document",
                    type: "text"
                },
                {
                    inlineData: {
                        data: req.file.buffer.toString('base64'),
                        mimeType: req.file.mimetype
                    },
                    type: "document"
                }
            ]
        })

        res.json({
            status: "success",
            data: response.text
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: "error",
            message: "Internal server error"
        })
    }
})

app.post("/generate-from-audio", upload.single("audio"), async (req, res) => {
    try {
        const { prompt } = req.body
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                {
                    text: prompt ? prompt : "Please tell me what is this audio about?",
                    type: "text"
                },
                {
                    inlineData: {
                        data: req.file.buffer.toString("base64"),
                        mimeType: req.file.mimetype
                    },
                    type: "audio"
                }
            ]
        })

        res.json({
            status: "success",
            data: response.text
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: "error",
            message: "Internal server error"
        })
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})