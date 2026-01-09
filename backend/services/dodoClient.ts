import DodoPayments from "dodopayments";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load .env before accessing env variables (needed because this module may load before server.ts calls dotenv)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "..", ".env") });

type DodoEnvironment = "test_mode" | "live_mode";

const environment =
  (process.env.DODO_ENVIRONMENT as DodoEnvironment) ||
  (process.env.DODO_MODE as DodoEnvironment) ||
  "test_mode";

const bearerToken = process.env.DODO_API_KEY || "";

if (!bearerToken) {
  console.warn(
    "[DodoPayments] DODO_API_KEY is not set. Subscription creation will fail until it is configured."
  );
}

export const dodo = new DodoPayments({
  bearerToken,
  environment,
});
