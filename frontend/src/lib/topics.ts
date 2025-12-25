export const TOPIC_BUCKETS = {
  india_exams: [
    "UPSC",
    "JEE",
    "NEET",
    "CSAT",
    "NDA",
    "SSC CGL",
    "CLAT",
    "MPPSC",
  ],
  academics: [
    "Maths-1 Engineering",
    "Engineering Mathematics",
    "Class 9 History NCERT",
    "Class 12 Physics",
    "B.Tech Operating Systems",
    "LLB Constitutional Law",
  ],
  tech: [
    "MERN",
    "Java",
    "Data Structures",
    "System Design",
    "Machine Learning",
  ],
  international_exams: [
    "SAT",
    "GRE",
    "GMAT",
    "A-Levels",
    "IB Mathematics",
    "GAOKAO",
  ],
  creative: [
    "UI/UX Design",
    "Graphic Design",
    "Product Design",
    "3D Modeling",
    "Motion Design",
  ],
};

// Get all topics as a flat array
export const getAllTopics = (): string[] => {
  return Object.values(TOPIC_BUCKETS).flat();
};

// Get 6 random topics
export const getRandomTopics = (count: number = 6): string[] => {
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
