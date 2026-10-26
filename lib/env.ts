import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1).default('demo-api-key'),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1).default('demo-campus-archive.firebaseapp.com'),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1).default('demo-campus-archive'),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1).default('demo-campus-archive.appspot.com'),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1).default('123456789012'),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1).default('1:123456789012:web:demoabcdef123456'),
  NEXT_PUBLIC_USE_FIREBASE_EMULATOR: z.enum(['true', 'false']).default('false'),
  NEXT_PUBLIC_EMULATOR_AUTH_URL: z.string().default('http://localhost:9099'),
  NEXT_PUBLIC_EMULATOR_FIRESTORE_PORT: z.string().default('8080'),
  NEXT_PUBLIC_EMULATOR_STORAGE_PORT: z.string().default('9199'),
  NEXT_PUBLIC_ALLOWED_COLLEGE_EMAIL_DOMAIN: z.string().default('college.edu'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const parsedEnv = envSchema.safeParse({
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_USE_FIREBASE_EMULATOR: process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR,
  NEXT_PUBLIC_EMULATOR_AUTH_URL: process.env.NEXT_PUBLIC_EMULATOR_AUTH_URL,
  NEXT_PUBLIC_EMULATOR_FIRESTORE_PORT: process.env.NEXT_PUBLIC_EMULATOR_FIRESTORE_PORT,
  NEXT_PUBLIC_EMULATOR_STORAGE_PORT: process.env.NEXT_PUBLIC_EMULATOR_STORAGE_PORT,
  NEXT_PUBLIC_ALLOWED_COLLEGE_EMAIL_DOMAIN: process.env.NEXT_PUBLIC_ALLOWED_COLLEGE_EMAIL_DOMAIN,
  NODE_ENV: process.env.NODE_ENV,
});

if (!parsedEnv.success) {
  console.warn('⚠️ Environment variable validation warnings:', parsedEnv.error.format());
}

export const env = parsedEnv.success ? parsedEnv.data : envSchema.parse({});
