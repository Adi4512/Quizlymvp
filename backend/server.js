import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { OpenRouter } from "@openrouter/sdk";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from root directory (parent of backend folder)
dotenv.config({ path: join(__dirname, "..", ".env") });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenRouter SDK
const OPENROUTER_API_KEY = process.env.OPEN_ROUTER_API_KEY;
const openRouter = new OpenRouter({
  apiKey: OPENROUTER_API_KEY,
});

// Simple test route
app.get("/", (req, res) => {
  res.json({ message: "Quizethic AI Backend API is running!" });
});

// Route to call Gemini API via OpenRouter
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, difficulty } = req.body;

    if (!prompt || !difficulty) {
      return res
        .status(400)
        .json({ error: "Prompt and difficulty are required" });
    }

    if (!OPENROUTER_API_KEY) {
      console.error(
        "❌ OPEN_ROUTER_API_KEY not found in environment variables"
      );
      return res.status(500).json({
        error: "OpenRouter API key is not configured",
      });
    }

    // Call OpenRouter API with Gemini model using SDK
    const result = await openRouter.chat.send({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content: `Generate a quiz on ${prompt} with ${difficulty} difficulty`,
        },
      ],
      stream: false,
    });

    // Extract the content from the response
    const responseContent =
      result.choices?.[0]?.message?.content || "No response received";

    // Return the response from Gemini
    res.json({
      success: true,
      response: responseContent,
      fullData: result, // Include full response for debugging
    });
  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 Test endpoint: POST http://localhost:${PORT}/api/generate`);
});
