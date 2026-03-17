import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  APP_BASE_URL: z.string().url().default("http://localhost:3000"),
  APP_TIMEZONE: z.string().default("Asia/Ulaanbaatar"),
  ADMIN_EMAIL: z.string().email().default("admin@example.com"),
  ADMIN_PASSWORD: z.string().min(8).default("ChangeMe123!"),
  ADMIN_SESSION_SECRET: z.string().min(32),
  JOB_SHARED_SECRET: z.string().min(16),
  FTMO_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(45000),
  FTMO_MAX_RETRIES: z.coerce.number().int().positive().max(5).default(3),
  FTMO_TRADER_TIMEOUT_MS: z.coerce.number().int().positive().default(45000),
  FTMO_ROOM_TIMEOUT_MS: z.coerce.number().int().positive().default(480000),
  FTMO_BROWSER_HEADLESS: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  SMTP_HOST: z.string().optional().or(z.literal("")),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional().or(z.literal("")),
  SMTP_PASS: z.string().optional().or(z.literal("")),
  SMTP_FROM: z.string().default("FTMO Challenge Rooms <no-reply@example.com>"),
  TELEGRAM_BOT_TOKEN: z.string().optional().or(z.literal("")),
  TELEGRAM_CHAT_ID: z.string().optional().or(z.literal("")),
});

export const env = envSchema.parse(process.env);
