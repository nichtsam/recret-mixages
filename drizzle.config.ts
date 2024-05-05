import "dotenv/config";
import type { Config } from "drizzle-kit";
import { z } from "zod";

const envSchema = z.object({
  TURSO_DB_URL: z.string().url(),
  TURSO_DB_AUTH_TOKEN: z.string(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "❌ Invalid environment variables:",
    parsedEnv.error.flatten().fieldErrors
  );

  throw new Error("Invalid environment variables");
}

const env = parsedEnv.data;

export default {
  driver: "turso",
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: env.TURSO_DB_URL,
    authToken: env.TURSO_DB_AUTH_TOKEN,
  },
} satisfies Config;
