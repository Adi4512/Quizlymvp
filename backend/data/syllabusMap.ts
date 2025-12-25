export type TopicType = "competitive_exam" | "academic" | "technical";

export interface SyllabusMapping {
  type: TopicType;
  subjects: string[];
  description: string;
}

export const syllabusMap: Record<string, SyllabusMapping> = {
  // Competitive Exams
  NDA: {
    type: "competitive_exam",
    subjects: [
      "Mathematics (Algebra, Trigonometry, Geometry, Calculus basics)",
      "General Ability Test - General Knowledge (History, Geography, Current Affairs, Awards, Sports)",
      "General Ability Test - General Science (Physics, Chemistry, Biology basics)",
      "General Ability Test - English (Grammar, Vocabulary, Comprehension)",
    ],
    description: "National Defence Academy written exam syllabus",
  },
  UPSC: {
    type: "competitive_exam",
    subjects: [
      "History (Ancient, Medieval, Modern India, World History)",
      "Geography (Physical, Human, Indian Geography)",
      "Polity (Indian Constitution, Governance, Political System)",
      "Economics (Indian Economy, Economic Development)",
      "Environment and Ecology",
      "Science and Technology",
      "Current Affairs",
    ],
    description: "Union Public Service Commission Civil Services exam syllabus",
  },
  MPPSC: {
    type: "competitive_exam",
    subjects: [
      "Madhya Pradesh History",
      "Madhya Pradesh Geography",
      "Madhya Pradesh Economy",
      "General Knowledge (National and International)",
      "Current Affairs (State and National)",
      "Indian Polity",
      "Science and Technology",
    ],
    description: "Madhya Pradesh Public Service Commission exam syllabus",
  },
  CSAT: {
    type: "competitive_exam",
    subjects: [
      "Quantitative Aptitude (Arithmetic, Algebra, Geometry, Data Interpretation)",
      "Logical Reasoning (Analytical, Critical, Verbal Reasoning)",
      "Reading Comprehension (English passages and questions)",
    ],
    description: "Civil Services Aptitude Test syllabus",
  },
  SSC: {
    type: "competitive_exam",
    subjects: [
      "General Awareness (History, Geography, Science, Current Affairs)",
      "Quantitative Aptitude",
      "English Language",
      "General Intelligence and Reasoning",
    ],
    description: "Staff Selection Commission exam syllabus",
  },
  CDS: {
    type: "competitive_exam",
    subjects: [
      "Mathematics",
      "General Knowledge (History, Geography, Current Affairs, Science)",
      "English (Grammar, Vocabulary, Comprehension)",
    ],
    description: "Combined Defence Services exam syllabus",
  },

  // Technical Topics
  MERN: {
    type: "technical",
    subjects: [
      "MongoDB (Database operations, queries, schema design, aggregation)",
      "Express.js (Routing, middleware, error handling, REST APIs)",
      "React (Components, hooks, state management, lifecycle, JSX)",
      "Node.js (Event loop, modules, file system, async operations)",
    ],
    description: "MERN stack development - scenario-based practical questions",
  },
  React: {
    type: "technical",
    subjects: [
      "React Components and JSX",
      "Hooks (useState, useEffect, useContext, custom hooks)",
      "State Management",
      "Props and Component Communication",
      "Event Handling",
      "Conditional Rendering",
      "React Router",
    ],
    description: "React.js framework - practical scenario-based questions",
  },
  Python: {
    type: "technical",
    subjects: [
      "Python Syntax and Data Types",
      "Control Flow (if/else, loops)",
      "Functions and Modules",
      "Data Structures (lists, dictionaries, tuples, sets)",
      "Object-Oriented Programming",
      "File Handling",
      "Error Handling",
    ],
    description: "Python programming - scenario-based coding questions",
  },
  JavaScript: {
    type: "technical",
    subjects: [
      "JavaScript Fundamentals (variables, data types, operators)",
      "Functions and Scope",
      "Arrays and Objects",
      "DOM Manipulation",
      "Async Programming (Promises, async/await)",
      "ES6+ Features",
      "Error Handling",
    ],
    description: "JavaScript programming - practical scenario-based questions",
  },

  // Academic Subjects
  "Class 9 History NCERT": {
    type: "academic",
    subjects: [
      "The French Revolution",
      "Socialism in Europe and the Russian Revolution",
      "Nazism and the Rise of Hitler",
      "Forest Society and Colonialism",
      "Pastoralists in the Modern World",
      "Peasants and Farmers",
      "History and Sport: The Story of Cricket",
      "Clothing: A Social History",
    ],
    description: "NCERT Class 9 History textbook syllabus",
  },
  "Class 10 Maths": {
    type: "academic",
    subjects: [
      "Real Numbers",
      "Polynomials",
      "Pair of Linear Equations in Two Variables",
      "Quadratic Equations",
      "Arithmetic Progressions",
      "Triangles",
      "Coordinate Geometry",
      "Trigonometry",
      "Circles",
      "Areas Related to Circles",
      "Surface Areas and Volumes",
      "Statistics",
      "Probability",
    ],
    description: "Class 10 Mathematics curriculum",
  },
};

/**
 * Resolves syllabus for a given topic name
 * Returns null if topic not found
 */
export function resolveSyllabus(topicName: string): SyllabusMapping | null {
  const normalized = topicName.trim();

  // Direct match
  if (syllabusMap[normalized]) {
    return syllabusMap[normalized];
  }

  // Case-insensitive match
  const lower = normalized.toLowerCase();
  for (const [key, value] of Object.entries(syllabusMap)) {
    if (key.toLowerCase() === lower) {
      return value;
    }
  }

  return null;
}
