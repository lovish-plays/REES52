import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitizes backend/database errors so that technical stack traces, SQL errors,
 * Supabase messages, or internal implementation details are never exposed to the frontend.
 */
export function sanitizeErrorMessage(
  error: unknown,
  fallbackMessage: string = "An error occurred. Please try again."
): string {
  if (!error) return fallbackMessage;

  const message =
    typeof error === "string"
      ? error
      : error instanceof Error
      ? error.message
      : typeof (error as Record<string, unknown>)?.message === "string"
      ? String((error as Record<string, unknown>).message)
      : String(error);

  // Log raw technical details to server/console for debugging
  console.error("[Backend Error Logged]:", error);

  const lower = message.toLowerCase();

  // List of technical backend terms that must NEVER be shown to the user
  const technicalKeywords = [
    "supabase",
    "postgres",
    "pgrst",
    "column",
    "relation",
    "schema",
    "table",
    "violates",
    "constraint",
    "foreign key",
    "unique constraint",
    "uuid",
    "todo:",
    "null value in",
    "sql",
    "pg_",
    "syntax error",
    "auth.users",
    "service_role",
    "jwt",
    "token",
    "fetch failed",
    "internal server error",
    "500",
    "404",
    "403",
    "connection refused",
    "econnrefused",
    "etimedout",
  ];

  const hasTechnicalKeyword = technicalKeywords.some((keyword) => lower.includes(keyword));

  if (hasTechnicalKeyword) {
    return fallbackMessage;
  }

  // Common user-friendly validation messages that are safe to show
  const safePhrases = [
    "required",
    "invalid email",
    "please fill",
    "please enter",
    "unauthenticated",
    "permission denied",
    "not found",
    "incorrect",
    "already registered",
    "already enrolled",
    "passwords do not match",
    "invalid credentials",
    "user not found",
    "account",
    "signed out",
  ];

  const isSafeMessage = safePhrases.some((phrase) => lower.includes(phrase));
  if (isSafeMessage) {
    return message;
  }

  // If the error message is too long (> 120 chars) or looks like a stack trace/dump, sanitize it
  if (message.length > 120 || message.includes("\n") || message.includes("at ")) {
    return fallbackMessage;
  }

  return message;
}
