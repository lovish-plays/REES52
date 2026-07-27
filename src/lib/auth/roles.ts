export type AppRole = "Student" | "Teacher" | "Admin";

export function normalizeRole(role?: string | null): AppRole {
  const normalized = role?.trim().toLowerCase();

  if (normalized === "admin") return "Admin";
  if (normalized === "teacher") return "Teacher";
  return "Student";
}

/**
 * Admin is retained as a privileged legacy role so existing installations do
 * not lose access while moving to the teacher-facing workspace.
 */
export function isTeacherRole(role?: string | null): boolean {
  const normalized = normalizeRole(role);
  return normalized === "Teacher" || normalized === "Admin";
}

export function roleLabel(role?: string | null): "Student" | "Teacher" {
  return isTeacherRole(role) ? "Teacher" : "Student";
}
