export const TOPIC_BUCKETS = {
  // 🇮🇳 INDIA — National & Academic
  india_exams: [
    "UPSC",
    "CSAT",
    "JEE",
    "NEET",
    "NDA",
    "SSC CGL",
    "CLAT",
    "MPPSC",
    "State PSC Exams",
  ],

  // 🇮🇳 INDIA — School & College
  india_academics: [
    "Class 9 History NCERT",
    "Class 10 Mathematics",
    "Class 11 Physics",
    "Class 12 Chemistry",
    "Maths-1 Engineering",
    "Engineering Mathematics",
    "B.Tech Operating Systems",
    "B.Tech Data Structures",
    "LLB Constitutional Law",
  ],

  // 🇺🇸 USA — Exams & Academics
  usa_exams: [
    "SAT",
    "ACT",
    "GRE",
    "GMAT",
    "LSAT",
    "MCAT",
    "AP Calculus",
    "AP Physics",
  ],

  usa_academics: [
    "High School Algebra",
    "High School Geometry",
    "AP US History",
    "College Calculus",
    "Linear Algebra",
    "Probability and Statistics",
    "Computer Science Fundamentals",
  ],

  // 🇪🇺 EUROPE — Exams & Curriculum
  europe_exams: [
    "A-Levels",
    "GCSE Mathematics",
    "GCSE Physics",
    "IB Mathematics",
    "IB Physics",
    "IB Chemistry",
  ],

  europe_academics: [
    "A-Level Mathematics",
    "A-Level Physics",
    "IB Higher Level Maths",
    "European History",
    "Applied Mathematics",
  ],

  // 🇨🇳 CHINA
  china_exams: ["GAOKAO"],

  china_academics: [
    "GAOKAO Mathematics",
    "GAOKAO Physics",
    "GAOKAO Chemistry",
    "Chinese High School Mathematics",
  ],

  // 🇯🇵 JAPAN
  japan_exams: ["EJU", "National Center Test"],

  japan_academics: [
    "Japanese High School Mathematics",
    "Japanese High School Physics",
    "Engineering Mathematics Japan",
  ],

  // 🇰🇷 SOUTH KOREA
  korea_exams: ["CSAT Korea"],

  korea_academics: [
    "Korean High School Mathematics",
    "Korean High School Science",
  ],

  // 🇵🇰 PAKISTAN
  pakistan_exams: ["CSS Pakistan", "PMC MDCAT"],

  pakistan_academics: [
    "FSc Mathematics",
    "FSc Physics",
    "Intermediate Chemistry",
  ],

  // 🌍 TECH (Global, exam-relevant)
  tech: [
    "MERN",
    "Java",
    "Data Structures",
    "Algorithms",
    "Operating Systems",
    "Database Management Systems",
    "System Design",
    "Machine Learning",
  ],

  // 🎨 CREATIVE / DESIGN (Structured & Serious)
  creative: [
    "UI/UX Design",
    "Product Design",
    "Graphic Design",
    "3D Modeling",
    "Motion Design",
    "Design Fundamentals",
  ],
};

// Get all topics as a flat array
export const getAllTopics = (): string[] => {
  return Object.values(TOPIC_BUCKETS).flat();
};

// Get 6 random topics
export const getRandomTopics = (count: number = 5): string[] => {
  const allTopics = getAllTopics();
  const shuffled = [...allTopics].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// Get a single random topic not in the current list
export const getNewRandomTopic = (currentTopics: string[]): string => {
  const allTopics = getAllTopics();
  const available = allTopics.filter((t) => !currentTopics.includes(t));
  if (available.length === 0)
    return allTopics[Math.floor(Math.random() * allTopics.length)];
  return available[Math.floor(Math.random() * available.length)];
};
