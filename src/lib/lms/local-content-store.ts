import 'server-only';

import fs from 'fs';
import path from 'path';
import { lmsCourses } from '@/lib/lms/mock-data';
import { lmsProjects } from '@/lib/lms/mock-data';
import type { LmsCourse, LmsProject } from '@/lib/lms/types';

type LocalCourseRecord = { course: LmsCourse; isPublished: boolean };
type LocalContentState = {
  courses: Record<string, LocalCourseRecord>;
  deletedCourseIds: string[];
  projects: Record<string, LocalProjectRecord>;
  deletedProjectIds: string[];
};

type LocalProjectRecord = { project: LmsProject; isPublished: boolean };

const localStorePath = path.join(process.cwd(), 'scratch', 'local-lms-content.json');

export function getLocalCourses(includeDrafts = false): LmsCourse[] {
  const state = readState();
  const deletedIds = new Set(state.deletedCourseIds);
  const baseCourses = lmsCourses
    .filter((course) => !deletedIds.has(course.id || course.slug))
    .map((course) => state.courses[course.id || course.slug]?.course || course);
  const baseIds = new Set(baseCourses.map((course) => course.id || course.slug));
  const addedCourses = Object.values(state.courses)
    .map((record) => record.course)
    .filter((course) => !baseIds.has(course.id || course.slug));
  const courses = [...addedCourses, ...baseCourses];

  if (includeDrafts) return courses;
  return courses.filter((course) => isLocalCoursePublished(course, state));
}

export function isLocalCoursePublished(course: LmsCourse, state = readState()): boolean {
  return state.courses[course.id || course.slug]?.isPublished ?? true;
}

export function upsertLocalCourse(course: LmsCourse, isPublished: boolean): void {
  const key = course.id || course.slug;
  const state = readState();
  state.courses[key] = { course, isPublished };
  state.deletedCourseIds = state.deletedCourseIds.filter((id) => id !== key);
  writeState(state);
}

export function deleteLocalCourse(id: string): LmsCourse | null {
  const state = readState();
  const existing = getLocalCourses(true).find((course) => (course.id || course.slug) === id);
  if (!existing) return null;
  delete state.courses[id];
  if (!state.deletedCourseIds.includes(id)) state.deletedCourseIds.push(id);
  writeState(state);
  return existing;
}

export function getLocalProjects(includeDrafts = false): LmsProject[] {
  const state = readState();
  const deletedIds = new Set(state.deletedProjectIds);
  const baseProjects = lmsProjects
    .filter((project) => !deletedIds.has(project.id || project.slug))
    .map((project) => state.projects[project.id || project.slug]?.project || project);
  const baseIds = new Set(baseProjects.map((project) => project.id || project.slug));
  const addedProjects = Object.values(state.projects)
    .map((record) => record.project)
    .filter((project) => !baseIds.has(project.id || project.slug));
  const projects = [...addedProjects, ...baseProjects];
  if (includeDrafts) return projects;
  return projects.filter((project) => isLocalProjectPublished(project, state));
}

export function isLocalProjectPublished(project: LmsProject, state = readState()): boolean {
  return state.projects[project.id || project.slug]?.isPublished ?? true;
}

export function upsertLocalProject(project: LmsProject, isPublished: boolean): void {
  const key = project.id || project.slug;
  const state = readState();
  state.projects[key] = { project, isPublished };
  state.deletedProjectIds = state.deletedProjectIds.filter((id) => id !== key);
  writeState(state);
}

export function deleteLocalProject(id: string): LmsProject | null {
  const state = readState();
  const existing = getLocalProjects(true).find((project) => (project.id || project.slug) === id);
  if (!existing) return null;
  delete state.projects[id];
  if (!state.deletedProjectIds.includes(id)) state.deletedProjectIds.push(id);
  writeState(state);
  return existing;
}

function readState(): LocalContentState {
  try {
    const parsed = JSON.parse(fs.readFileSync(localStorePath, 'utf8')) as Partial<LocalContentState>;
    return {
      courses: parsed.courses || {},
      deletedCourseIds: parsed.deletedCourseIds || [],
      projects: parsed.projects || {},
      deletedProjectIds: parsed.deletedProjectIds || [],
    };
  } catch {
    return { courses: {}, deletedCourseIds: [], projects: {}, deletedProjectIds: [] };
  }
}

function writeState(state: LocalContentState) {
  fs.mkdirSync(path.dirname(localStorePath), { recursive: true });
  const tempPath = `${localStorePath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(state, null, 2), 'utf8');
  fs.renameSync(tempPath, localStorePath);
}
