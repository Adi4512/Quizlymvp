import { OpenRouter } from "@openrouter/sdk";

interface SyllabusInferenceResult {
  topic: string;
  identifiedAs: string; // e.g., "competitive exam", "technical topic", "academic subject"
  subjects: string[];
}

/**
 * Infers syllabus subjects for any topic using LLM
 * DO NOT generate questions - only identify what subjects are studied
 */
export async function inferSyllabus(
  topic: string,
  openRouter: OpenRouter
): Promise<SyllabusInferenceResult> {
  const inferencePrompt = `You are a syllabus expert. Your task is to identify what subjects/topics are studied or tested for: "${topic}"

CRITICAL RULES:
1. Identify ONLY the academic/technical subjects that students actually STUDY or that appear in exams
2. DO NOT mention:
   - Exam eligibility, age limits, dates
   - Exam centers, application process
   - Training academies, institutions
   - Exam pattern, marking scheme
   - Full forms or acronym meanings
3. Focus on SUBJECTS/TOPICS that are part of the curriculum or exam syllabus

EXAMPLES:
- "NDA" → ["Mathematics", "General Knowledge (History, Geography, Current Affairs)", "General Science (Physics, Chemistry, Biology)", "English (Grammar, Vocabulary, Comprehension)"]
- "CSAT" → ["Quantitative Aptitude", "Logical Reasoning", "Reading Comprehension"]
- "MERN" → ["MongoDB", "Express.js", "React", "Node.js"]
- "B.Tech Chemical Engineering 2nd Year" → ["Chemical Thermodynamics", "Mass Transfer", "Chemical Reaction Engineering", "Process Control", "Fluid Mechanics"]
- "UPSC" → ["History", "Geography", "Polity", "Economics", "Environment", "Science and Technology", "Current Affairs"]

OUTPUT FORMAT (JSON only, no markdown):
{
  "topic": "${topic}",
  "identifiedAs": "competitive exam" | "technical topic" | "academic subject" | "professional course",
  "subjects": ["Subject 1", "Subject 2", "Subject 3", ...]
}

Now identify the subjects for: "${topic}"`;

  const result = await openRouter.chat.send({
    model: "google/gemini-2.5-flash-lite",
    messages: [
      {
        role: "user",
        content: inferencePrompt,
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

  try {
    const parsed = JSON.parse(jsonString);

    // Validate structure
    if (
      !parsed.subjects ||
      !Array.isArray(parsed.subjects) ||
      parsed.subjects.length === 0
    ) {
      throw new Error(
        "Invalid syllabus inference: missing or empty subjects array"
      );
    }

    return {
      topic: parsed.topic || topic,
      identifiedAs: parsed.identifiedAs || "academic subject",
      subjects: parsed.subjects,
    };
  } catch (error) {
    console.error("Error parsing syllabus inference:", error);
    throw new Error(
      `Failed to infer syllabus for "${topic}". LLM response was invalid.`
    );
  }
}
