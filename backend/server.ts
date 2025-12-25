import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { OpenRouter } from "@openrouter/sdk";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { inferSyllabus } from "./services/syllabusInference.js";
import { generateQuiz } from "./services/quizGenerator.js";

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from root directory (parent of backend folder)
dotenv.config({ path: join(__dirname, "..", ".env") });

const app = express();
const PORT: number = parseInt(process.env.PORT || "3000", 10);

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenRouter SDK
const OPENROUTER_API_KEY: string | undefined = process.env.OPEN_ROUTER_API_KEY;
const openRouter = new OpenRouter({
  apiKey: OPENROUTER_API_KEY || "",
});

// Types for request body
interface GenerateQuizRequest {
  prompt: string; // Topic name (any topic in the world)
  difficulty: "Easy" | "Medium" | "Hard" | "Mix";
  numberOfQuestions?: number | string;
}

// Output validation - rejects exam metadata questions
function containsForbiddenContent(text: string): boolean {
  const forbiddenPatterns = [
    /what does \w+ stand for/i,
    /what is the full form/i,
    /where is \w+ located/i,
    /what is the age limit/i,
    /what is the eligibility/i,
    /when is \w+ exam conducted/i,
    /when is \w+ exam held/i,
    /exam date/i,
    /conducted by/i,
    /training academy/i,
    /training center/i,
    /admission process/i,
    /application process/i,
    /exam pattern/i,
    /marking scheme/i,
    /cut-off/i,
    /cutoff/i,
    /motto of/i,
    /motto is/i,
  ];

  return forbiddenPatterns.some((pattern) => pattern.test(text));
}

// Validate generated quiz
function validateQuiz(quiz: any): boolean {
  if (!quiz || !quiz.questions || !Array.isArray(quiz.questions)) {
    return false;
  }

  // Check each question for forbidden content
  for (const question of quiz.questions) {
    if (question.question && containsForbiddenContent(question.question)) {
      return false;
    }
  }

  return true;
}

// Simple test route
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Quizethic AI Backend API is running!" });
});

// Route to call Gemini API via OpenRouter
app.post(
  "/api/generate",
  async (req: Request<{}, {}, GenerateQuizRequest>, res: Response) => {
    try {
      const { prompt, difficulty, numberOfQuestions } = req.body;

      if (!prompt || !difficulty) {
        return res
          .status(400)
          .json({ error: "Prompt and difficulty are required" });
      }

      // Validate numberOfQuestions
      const numQuestions = numberOfQuestions
        ? parseInt(String(numberOfQuestions), 10)
        : 10; // Default to 10 if not provided

      if (isNaN(numQuestions) || numQuestions < 1 || numQuestions > 20) {
        return res.status(400).json({
          error: "numberOfQuestions must be a number between 1 and 20",
        });
      }

      if (!OPENROUTER_API_KEY) {
        console.error(
          "❌ OPEN_ROUTER_API_KEY not found in environment variables"
        );
        return res.status(500).json({
          error: "OpenRouter API key is not configured",
        });
      }

      // ────────────────────────────────────────────────────────────────
      // PHASE 1: SYLLABUS INFERENCE
      // ────────────────────────────────────────────────────────────────
      console.log(`🔍 Phase 1: Inferring syllabus for "${prompt}"...`);

      let syllabus;
      try {
        syllabus = await inferSyllabus(prompt, openRouter);
        console.log(`✅ Syllabus inferred:`, {
          identifiedAs: syllabus.identifiedAs,
          subjectsCount: syllabus.subjects.length,
          subjects: syllabus.subjects,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error(`❌ Syllabus inference failed:`, errorMessage);
        return res.status(400).json({
          error: "Failed to infer syllabus for this topic",
          message: errorMessage,
        });
      }

      // ────────────────────────────────────────────────────────────────
      // PHASE 2: QUIZ GENERATION (with validation and retry)
      // ────────────────────────────────────────────────────────────────
      console.log(
        `📝 Phase 2: Generating ${numQuestions} questions at ${difficulty} difficulty...`
      );

      let quiz;
      let attempts = 0;
      const maxAttempts = 2; // Regenerate once if invalid

      while (attempts < maxAttempts) {
        attempts++;

        try {
          quiz = await generateQuiz(
            {
              topic: prompt,
              difficulty,
              numberOfQuestions: numQuestions,
              subjects: syllabus.subjects,
              identifiedAs: syllabus.identifiedAs,
            },
            openRouter
          );

          // Validate quiz
          if (validateQuiz(quiz)) {
            console.log(`✅ Valid quiz generated on attempt ${attempts}`);
            break;
          } else {
            console.log(
              `⚠️ Invalid quiz detected on attempt ${attempts}, regenerating...`
            );
            if (attempts >= maxAttempts) {
              console.error(
                `❌ Failed to generate valid quiz after ${maxAttempts} attempts`
              );
              return res.status(500).json({
                error: "Failed to generate valid questions",
                message:
                  "Generated questions contained forbidden content. Please try again.",
              });
            }
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          console.error(`❌ Quiz generation failed:`, errorMessage);

          if (attempts >= maxAttempts) {
            return res.status(500).json({
              error: "Failed to generate quiz",
              message: errorMessage,
            });
          }
        }
      }

      // Convert quiz to JSON string for frontend compatibility
      const responseContent = JSON.stringify(quiz, null, 2);

      // Return the validated quiz
      res.json({
        success: true,
        response: responseContent,
      });
    } catch (error) {
      console.error("Error calling OpenRouter API:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({
        error: "Internal server error",
        message: errorMessage,
      });
    }
  }
);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 Test endpoint: POST http://localhost:${PORT}/api/generate`);
});
