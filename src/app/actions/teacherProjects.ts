'use server';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/app/actions/auth';
import { isTeacherRole } from '@/lib/auth/roles';
import { deleteLocalProject, getLocalProjects, isLocalProjectPublished, upsertLocalProject } from '@/lib/lms/local-content-store';
import type { LmsComponent, LmsLevel, LmsProject } from '@/lib/lms/types';
import { normalizeSchoolClass, type SchoolClass } from '@/lib/lms/class-categories';
import { hasSupabaseEnv } from '@/lib/supabaseConfig';
import { createClient } from '@/lib/supabaseServer';

export type TeacherProject = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  classLevel: SchoolClass;
  level: LmsLevel;
  estimatedTime: string;
  thumbnailUrl: string;
  videoUrl: string;
  circuitDiagramUrl: string;
  sourceCode: string;
  steps: string[];
  troubleshooting: string[];
  products: LmsComponent[];
  isPublished: boolean;
};

export type TeacherProjectInput = Omit<TeacherProject, 'id'> & { id?: string };

type ProjectRow = {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  category: string | null;
  class_level: string | null;
  level: string | null;
  estimated_time: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  circuit_diagram_url: string | null;
  source_code: string | null;
  steps: string | null;
  troubleshooting: string | null;
  is_published: boolean | null;
};

type ProjectComponentRow = {
  id: string;
  project_id: string;
  component_name: string;
  quantity: number | null;
  product_url: string | null;
};

async function requireTeacher() {
  const user = await getCurrentUser();
  if (!user || !isTeacherRole(user.role)) throw new Error('Teacher access is required to manage projects.');
  return user;
}

export async function getTeacherProjectsAction(): Promise<{ projects?: TeacherProject[]; error?: string }> {
  try {
    await requireTeacher();
    if (!hasSupabaseEnv) return { projects: getLocalProjects(true).map(mapLocalProject) };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('projects')
      .select('id,title,slug,short_description,description,category,class_level,level,estimated_time,thumbnail_url,video_url,circuit_diagram_url,source_code,steps,troubleshooting,is_published')
      .order('created_at', { ascending: false });
    if (error) return { error: error.message };

    const projectRows = data as ProjectRow[];
    const projectIds = projectRows.map((project) => project.id);
    const { data: componentData, error: componentError } = projectIds.length
      ? await supabase
          .from('project_components')
          .select('id,project_id,component_name,quantity,product_url')
          .in('project_id', projectIds)
          .order('created_at', { ascending: true })
      : { data: [], error: null };

    if (componentError) return { error: componentError.message };
    const components = (componentData || []) as ProjectComponentRow[];
    return {
      projects: projectRows.map((project) =>
        mapProjectRow(
          project,
          components.filter((component) => component.project_id === project.id),
        ),
      ),
    };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

export async function createProjectAction(input: TeacherProjectInput): Promise<{ project?: TeacherProject; error?: string }> {
  try {
    await requireTeacher();
    const project = validateProjectInput(input);
    if (!hasSupabaseEnv) {
      if (getLocalProjects(true).some((item) => item.slug === project.slug)) return { error: 'A project with this slug already exists.' };
      const localProject: LmsProject = {
        id: randomUUID(),
        title: project.title,
        slug: project.slug,
        shortDescription: project.shortDescription,
        description: project.description,
        category: project.category,
        classLevel: project.classLevel,
        level: project.level,
        estimatedTime: project.estimatedTime,
        thumbnailUrl: project.thumbnailUrl,
        videoUrl: project.videoUrl || undefined,
        circuitDiagramUrl: project.circuitDiagramUrl || undefined,
        sourceCode: project.sourceCode,
        steps: project.steps,
        troubleshooting: project.troubleshooting,
        components: project.products,
      };
      upsertLocalProject(localProject, project.isPublished);
      revalidateProject(project.slug);
      return { project: mapLocalProject(localProject) };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('projects')
      .insert(toProjectRow(project))
      .select('id,title,slug,short_description,description,category,class_level,level,estimated_time,thumbnail_url,video_url,circuit_diagram_url,source_code,steps,troubleshooting,is_published')
      .single();
    if (error) return { error: error.message };

    const componentError = await replaceProjectProducts(supabase, data.id, project.products);
    if (componentError) {
      await supabase.from('projects').delete().eq('id', data.id);
      return { error: componentError };
    }

    revalidateProject(project.slug);
    return { project: mapProjectRow(data as ProjectRow, toProjectComponentRows(data.id, project.products)) };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

export async function updateProjectAction(input: TeacherProjectInput): Promise<{ project?: TeacherProject; error?: string }> {
  try {
    await requireTeacher();
    if (!input.id) return { error: 'Project ID is required.' };
    const project = validateProjectInput(input);
    if (!hasSupabaseEnv) {
      const projects = getLocalProjects(true);
      const current = projects.find((item) => (item.id || item.slug) === input.id);
      if (!current) return { error: 'Project not found.' };
      if (projects.some((item) => (item.id || item.slug) !== input.id && item.slug === project.slug)) return { error: 'A project with this slug already exists.' };
      const updated: LmsProject = { ...current, ...toLmsProject(project), id: current.id };
      upsertLocalProject(updated, project.isPublished);
      revalidateProject(project.slug);
      return { project: mapLocalProject(updated) };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('projects')
      .update(toProjectRow(project))
      .eq('id', input.id)
      .select('id,title,slug,short_description,description,category,class_level,level,estimated_time,thumbnail_url,video_url,circuit_diagram_url,source_code,steps,troubleshooting,is_published')
      .single();
    if (error) return { error: error.message };

    const componentError = await replaceProjectProducts(supabase, data.id, project.products);
    if (componentError) return { error: componentError };

    revalidateProject(project.slug);
    return { project: mapProjectRow(data as ProjectRow, toProjectComponentRows(data.id, project.products)) };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

export async function deleteProjectAction(id: string): Promise<{ success?: boolean; error?: string }> {
  try {
    await requireTeacher();
    if (!id) return { error: 'Project ID is required.' };
    if (!hasSupabaseEnv) {
      const removed = deleteLocalProject(id);
      if (!removed) return { error: 'Project not found.' };
      revalidateProject(removed.slug);
      return { success: true };
    }
    const supabase = await createClient();
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) return { error: error.message };
    revalidateProject();
    return { success: true };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

function validateProjectInput(input: TeacherProjectInput): Omit<TeacherProject, 'id'> {
  const title = input.title?.trim();
  const slug = slugify(input.slug || input.title || '');
  const category = input.category?.trim();
  if (!title || !slug || !category) throw new Error('Title, slug, and category are required.');
  return {
    title,
    slug,
    shortDescription: input.shortDescription?.trim() || '',
    description: input.description?.trim() || '',
    category,
    classLevel: normalizeSchoolClass(input.classLevel),
    level: input.level === 'Intermediate' || input.level === 'Advanced' ? input.level : 'Beginner',
    estimatedTime: input.estimatedTime?.trim() || 'Self-paced',
    thumbnailUrl: input.thumbnailUrl?.trim() || '',
    videoUrl: input.videoUrl?.trim() || '',
    circuitDiagramUrl: input.circuitDiagramUrl?.trim() || '',
    sourceCode: input.sourceCode?.trim() || '',
    steps: input.steps || [],
    troubleshooting: input.troubleshooting || [],
    products: normalizeProducts(input.products),
    isPublished: Boolean(input.isPublished),
  };
}

function toLmsProject(project: Omit<TeacherProject, 'id'>): LmsProject {
  return {
    ...project,
    components: project.products,
  };
}

function toProjectRow(project: Omit<TeacherProject, 'id'>) {
  return {
    title: project.title,
    slug: project.slug,
    short_description: project.shortDescription,
    description: project.description,
    category: project.category,
    class_level: project.classLevel,
    level: project.level,
    estimated_time: project.estimatedTime,
    thumbnail_url: project.thumbnailUrl || null,
    video_url: project.videoUrl || null,
    circuit_diagram_url: project.circuitDiagramUrl || null,
    source_code: project.sourceCode || null,
    steps: project.steps.join('\n'),
    troubleshooting: project.troubleshooting.join('\n'),
    is_published: project.isPublished,
  };
}

function mapProjectRow(row: ProjectRow, components: ProjectComponentRow[] = []): TeacherProject {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    shortDescription: row.short_description || '',
    description: row.description || '',
    category: row.category || 'Robotics Projects',
    classLevel: normalizeSchoolClass(row.class_level),
    level: row.level === 'Intermediate' || row.level === 'Advanced' ? row.level : 'Beginner',
    estimatedTime: row.estimated_time || 'Self-paced',
    thumbnailUrl: row.thumbnail_url || '',
    videoUrl: row.video_url || '',
    circuitDiagramUrl: row.circuit_diagram_url || '',
    sourceCode: row.source_code || '',
    steps: splitLines(row.steps),
    troubleshooting: splitLines(row.troubleshooting),
    products: components.map((component) => ({
      id: component.id,
      name: component.component_name,
      quantity: Math.max(1, Number(component.quantity) || 1),
      productUrl: component.product_url || '',
    })),
    isPublished: Boolean(row.is_published),
  };
}

function mapLocalProject(project: LmsProject): TeacherProject {
  return {
    id: project.id || project.slug,
    title: project.title,
    slug: project.slug,
    shortDescription: project.shortDescription,
    description: project.description,
    category: project.category,
    classLevel: project.classLevel,
    level: project.level,
    estimatedTime: project.estimatedTime,
    thumbnailUrl: project.thumbnailUrl,
    videoUrl: project.videoUrl || '',
    circuitDiagramUrl: project.circuitDiagramUrl || '',
    sourceCode: project.sourceCode,
    steps: project.steps,
    troubleshooting: project.troubleshooting,
    products: project.components,
    isPublished: isLocalProjectPublished(project),
  };
}

async function replaceProjectProducts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  products: LmsComponent[],
) {
  const { error: deleteError } = await supabase
    .from('project_components')
    .delete()
    .eq('project_id', projectId);

  if (deleteError) return deleteError.message;
  if (!products.length) return null;

  const { error: insertError } = await supabase
    .from('project_components')
    .insert(
      products.map((product) => ({
        project_id: projectId,
        component_name: product.name,
        quantity: product.quantity,
        product_url: product.productUrl,
      })),
    );

  return insertError?.message || null;
}

function toProjectComponentRows(projectId: string, products: LmsComponent[]): ProjectComponentRow[] {
  return products.map((product, index) => ({
    id: product.id || `${projectId}-${index}`,
    project_id: projectId,
    component_name: product.name,
    quantity: product.quantity,
    product_url: product.productUrl,
  }));
}

function normalizeProducts(products?: LmsComponent[]) {
  const normalized = (products || []).map((product, index) => {
    const name = product.name?.trim();
    const productUrl = product.productUrl?.trim();
    const quantity = Math.min(999, Math.max(1, Math.round(Number(product.quantity) || 1)));

    if (!name) throw new Error(`Product ${index + 1} needs a display name.`);
    if (name.length > 120) throw new Error(`Product ${index + 1} name is too long.`);
    if (!isHttpsUrl(productUrl)) {
      throw new Error(`Product ${index + 1} needs a valid https:// purchase link.`);
    }

    return { name, quantity, productUrl };
  });

  const uniqueNames = new Set(normalized.map((product) => product.name.toLowerCase()));
  if (uniqueNames.size !== normalized.length) {
    throw new Error('Each product needs a unique display name.');
  }

  return normalized;
}

function isHttpsUrl(value?: string) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
}

function splitLines(value?: string | null) {
  return value ? value.split(/\n+/).map((line) => line.trim()).filter(Boolean) : [];
}

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function revalidateProject(slug?: string) {
  revalidatePath('/admin/projects');
  revalidatePath('/projects');
  revalidatePath('/');
  if (slug) revalidatePath(`/projects/${slug}`);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unable to manage project content.';
}
