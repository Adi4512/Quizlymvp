// API Configuration - automatically switches between development and production

const PROD_API_URL = "https://quizlymvp.onrender.com";
const DEV_API_URL = "http://localhost:3000";

// Use environment variable if set, otherwise detect based on hostname
export const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? PROD_API_URL : DEV_API_URL);
