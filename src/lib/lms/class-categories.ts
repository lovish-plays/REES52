export const schoolClassOptions = [
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
] as const;

export type SchoolClass = (typeof schoolClassOptions)[number];

export const defaultSchoolClass: SchoolClass = "Class 6";

export function normalizeSchoolClass(value?: string | null): SchoolClass {
  const normalized = value?.trim().toLowerCase().replace(/\s+/g, " ");
  const match = normalized?.match(/(?:class\s*)?(3|4|5|6|7|8|9|10|11|12)(?:st|nd|rd|th)?$/);
  if (!match) return defaultSchoolClass;

  const option = `Class ${match[1]}` as SchoolClass;
  return schoolClassOptions.includes(option) ? option : defaultSchoolClass;
}
