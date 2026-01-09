// API Configuration - automatically switches between development and production

const PROD_API_URL = "https://quizlymvp.onrender.com";
const DEV_API_URL = "http://localhost:3000";

// Detect dev environment by checking if we're on localhost
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.startsWith("192.168."));

// Use environment variable if set, otherwise detect based on actual hostname
export const API_URL =
  import.meta.env.VITE_API_URL || (isLocalhost ? DEV_API_URL : PROD_API_URL);
