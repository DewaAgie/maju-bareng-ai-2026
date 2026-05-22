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
app.use(express.static('public/pages/chatbot'))


// Express Async Handler wrapper to avoid repetitive try/catch blocks in routes
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Helper to call ai.models.generateContent with automatic retry on transient errors (like 503/429)
 * 
 * @param {object} options Options to pass to generateContent
 * @param {number} maxRetries Maximum number of retries before throwing error
 * @param {number} initialDelay Initial delay between retries in milliseconds
 */
async function generateContentWithRetry(options, maxRetries = 3, initialDelay = 1000) {
  let delay = initialDelay;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(options);
    } catch (error) {
      const isTransient = 
        error.status === 503 || 
        error.status === 429 ||
        error.statusCode === 503 ||
        error.statusCode === 429 ||
        error.message?.includes('503') ||
        error.message?.includes('429') ||
        error.message?.includes('UNAVAILABLE') ||
        error.message?.includes('RESOURCE_EXHAUSTED') ||
        error.message?.includes('high demand');

      if (isTransient && attempt < maxRetries) {
        console.warn(`Gemini API returned transient error (attempt ${attempt}/${maxRetries}): ${error.message}. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // exponential backoff
      } else {
        throw error;
      }
    }
  }
}

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

  const response = await generateContentWithRetry({
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

  const response = await generateContentWithRetry({
    model: GEMINI_MODEL,
    contents: prompt
  });

  res.json({
    status: "success",
    data: response.text
  });
}));

app.post('/api/chat', async (req, res) => {
  const { conversation } = req.body;

  try {
    if (!conversation) {
      return res.status(400).json({ message: "Invalid payload! Can't find conversation." });
    }

    // Convert single object to an array of one item
    const conversationList = Array.isArray(conversation) ? conversation : [conversation];

    let isValid = true;
    conversationList.forEach((msg) => {
      if (!isValid) return;

      // Check if text exists and is a string
      if (!msg || !msg.text || typeof msg.text !== 'string') {
        isValid = false;
      }
    });

    if (!isValid) {
      return res.status(400).json({ message: "Invalid payload!" });
    }

    const contents = conversationList.map(({ role, text }) => {
      // Normalize role: only 'model' or 'user' are supported by Gemini.
      // If it is 'model' (or 'bot' / 'assistant'), map to 'model'. Otherwise default to 'user'.
      const normalizedRole = role && ['model', 'bot', 'assistant'].includes(role.toLowerCase())
        ? 'model'
        : 'user';

      return {
        role: normalizedRole,
        parts: [{ text }]
      };
    });

    const response = await generateContentWithRetry({
      model: GEMINI_MODEL,
      contents,
      config: {
        temperature: 0.9,
        systemInstruction: "Jawab hanya menggunakan bahasa indonesia."
      }
    });

    res.status(200).json({ result: response.text });

  } catch (e) {
    console.error(e);
    const isUnavailable = 
      e.status === 503 || 
      e.statusCode === 503 ||
      e.message?.includes('503') ||
      e.message?.includes('UNAVAILABLE') ||
      e.message?.includes('high demand');

    if (isUnavailable) {
      return res.status(503).json({ 
        message: "Layanan Gemini sedang sibuk karena permintaan yang tinggi. Silakan coba sesaat lagi." 
      });
    }
    res.status(500).json({ message: e.message });
  }
});

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