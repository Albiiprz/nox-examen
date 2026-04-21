import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  APP_URL: z.string().url().optional(),
  TRUST_PROXY: z
    .string()
    .optional()
    .transform((value) => value === "1" || value === "true"),
});

let cachedEnv: z.infer<typeof EnvSchema> | null = null;

export function getEnv() {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Configuración de entorno inválida: ${issues}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}
