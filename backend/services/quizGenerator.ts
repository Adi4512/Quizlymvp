import { OpenRouter } from "@openrouter/sdk";

interface QuizGenerationParams {
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Mix";
  numberOfQuestions: number;
  subjects: string[];
  identifiedAs: string;
}

interface QuizQuestion {
  questionNumber: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
  explanation?: string;
}

interface QuizResult {
  topic: string;
  difficulty: string;
  totalQuestions: number;
  questions: QuizQuestion[];
}

/**
 * Generates MCQs strictly from provided syllabus subjects
 * Difficulty only affects complexity, NOT subject scope
 */
export async function generateQuiz(
  params: QuizGenerationParams,
  openRouter: OpenRouter
): Promise<QuizResult> {
  const { topic, difficulty, numberOfQuestions, subjects, identifiedAs } =
    params;

  // Difficulty descriptions - complexity only, not topic change
  const difficultyDescriptions = {
    Easy: "basic/fundamental questions (simple concepts, straightforward problems)",
    Medium:
      "standard exam-level questions (moderate complexity, typical difficulty)",
    Hard: "advanced exam-level questions (complex multi-step problems, analytical thinking)",
    Mix: "balanced combination of Easy, Medium, and Hard questions",
  };

  const subjectsList = subjects
    .map((sub, idx) => `${idx + 1}. ${sub}`)
    .join("\n");

  const quizPrompt = `Generate exactly ${numberOfQuestions} Multiple Choice Questions (MCQ) for: "${topic}"

TOPIC TYPE: ${identifiedAs}

SYLLABUS SUBJECTS (Generate questions ONLY from these subjects - DO NOT deviate):
${subjectsList}

DIFFICULTY: ${difficulty}
${difficultyDescriptions[difficulty]}

🚨 ABSOLUTE REQUIREMENTS:

1. SYLLABUS LOCK:
   - Generate questions STRICTLY from the subjects listed above
   - Do NOT add subjects not in the list
   - Do NOT generate questions about topics outside these subjects
   - For technical topics: Generate scenario-based, hands-on practical questions
   - For competitive exams: Generate questions that appear in actual written exam papers
   - For academic: Generate questions from the specified curriculum

2. QUESTION STYLE:
   ✅ Scenario-based questions (real-world problems, practical applications)
   ✅ Questions that test understanding and problem-solving
   ✅ Questions requiring calculation, reasoning, or analysis
   ✅ Questions that would appear in actual exam papers or textbooks
   
   ❌ ABSOLUTELY FORBIDDEN - NEVER generate:
   - Questions containing: eligibility, age limit, exam date, conducted by, training academy, application process, exam pattern, marking scheme, cut-off, motto
   - Full forms or "what does X stand for"
   - "Where is X located" or "What is the location of X"
   - Questions about the exam/institution itself
   - Definitions without problem-solving context

3. DIFFICULTY HANDLING:
   - Difficulty ONLY affects complexity: ${difficultyDescriptions[difficulty]}
   - ALL difficulty levels use the SAME subjects listed above
   - Easy = simpler versions of syllabus questions, NOT different topics
   - Medium = standard syllabus questions
   - Hard = advanced syllabus questions
   - Mix = combination of all difficulty levels from the same subjects

4. EXPLANATION REQUIREMENTS:
   - Keep explanations CONCISE and BRIEF
   - Maximum 4 lines per explanation
   - For math/technical questions: Provide only key steps or hints, not full derivations
   - Focus on: "Why this answer is correct" or "Key concept/approach"
   - DO NOT write lengthy step-by-step solutions
   - Examples:
     * Good: "Use the formula x = (-b ± √(b²-4ac))/2a. Substituting values gives x = 2 or x = 3."
     * Bad: Long derivation with every algebraic step shown

5. OUTPUT FORMAT (STRICT JSON, no markdown):
{
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "totalQuestions": ${numberOfQuestions},
  "questions": [
    {
      "questionNumber": 1,
      "question": "Scenario-based question text here",
      "options": {
        "A": "Option A",
        "B": "Option B",
        "C": "Option C",
        "D": "Option D"
      },
      "correctAnswer": "A",
      "explanation": "Brief 2-4 line explanation with key hint or approach only"
    }
  ]
}

Generate EXACTLY ${numberOfQuestions} questions from the subjects above.`;

  const result = await openRouter.chat.send({
    model: "google/gemini-2.5-flash",
    messages: [
      {
        role: "user",
        content: quizPrompt,
      },
    ],
    stream: false,
  });

  const content = result.choices?.[0]?.message?.content;
  const responseText =
    typeof content === "string" ? content : JSON.stringify(content) || "";

  // Extract JSON from response
  let jsonString = responseText.trim();
  if (jsonString.includes("```json")) {
    jsonString = jsonString.split("```json")[1].split("```")[0].trim();
  } else if (jsonString.includes("```")) {
    jsonString = jsonString.split("```")[1].split("```")[0].trim();
  }

  // Sanitize JSON: remove control characters that break JSON parsing
  jsonString = jsonString.replace(/[\x00-\x1F\x7F]/g, "");

  try {
    const parsed = JSON.parse(jsonString);

    // Validate structure
    if (
      !parsed.questions ||
      !Array.isArray(parsed.questions) ||
      parsed.questions.length !== numberOfQuestions
    ) {
      throw new Error(
        `Invalid quiz: expected ${numberOfQuestions} questions, got ${
          parsed.questions?.length || 0
        }`
      );
    }

    // Post-process: Truncate explanations to max 4 lines
    const processedQuiz = parsed as QuizResult;
    processedQuiz.questions = processedQuiz.questions.map((q) => {
      if (q.explanation) {
        // Split by newlines and take first 4 lines
        const lines = q.explanation.split(/\n/).filter((line) => line.trim());
        q.explanation = lines.slice(0, 4).join(" ").trim();
        // If still too long (more than 300 chars), truncate
        if (q.explanation.length > 300) {
          q.explanation = q.explanation.substring(0, 297) + "...";
        }
      }
      return q;
    });

    return processedQuiz;
  } catch (error) {
    console.error("Error parsing quiz generation:", error);
    throw new Error(
      `Failed to generate quiz. LLM response was invalid: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
