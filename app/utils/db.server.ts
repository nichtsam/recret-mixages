import { drizzle } from "drizzle-orm/libsql";
import * as schema from "#drizzle/schema";
import { createClient } from "@libsql/client";
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

const client = createClient({
  url: env.TURSO_DB_URL,
  authToken: env.TURSO_DB_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
