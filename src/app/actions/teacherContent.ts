'use server';

import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/app/actions/auth';
import { isTeacherRole } from '@/lib/auth/roles';
import { deleteLocalCourse, getLocalCourses, isLocalCoursePublished, upsertLocalCourse } from '@/lib/lms/local-content-store';
import type { LmsComponent, LmsCourse, LmsLevel, PricingType } from '@/lib/lms/types';
import { normalizeSchoolClass, type SchoolClass } from '@/lib/lms/class-categories';
import { hasSupabaseEnv } from '@/lib/supabaseConfig';
import { createClient } from '@/lib/supabaseServer';

export type TeacherCourse = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  classLevel: SchoolClass;
  level: LmsLevel;
  duration: string;
  thumbnailUrl: string;
  pricing: PricingType;
  price: number;
  products: LmsComponent[];
  isPublished: boolean;
};

export type TeacherCourseInput = Omit<TeacherCourse, 'id'> & { id?: string };

type CourseRow = {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  category: string | null;
  class_level: string | null;
  level: string | null;
  duration: string | null;
  thumbnail_url: string | null;
  is_free: boolean | null;
  price: number | string | null;
  is_published: boolean | null;
};

type CourseComponentRow = {
  id: string;
  course_id: string;
  component_name: string;
  quantity: number | null;
  product_url: string | null;
  position: number | null;
};

async function requireTeacher() {
  const user = await getCurrentUser();
  if (!user || !isTeacherRole(user.role)) {
    throw new Error('Teacher access is required to manage content.');
  }
  return user;
}

export async function getTeacherCoursesAction(): Promise<{
  courses?: TeacherCourse[];
  error?: string;
}> {
  try {
    await requireTeacher();

    if (!hasSupabaseEnv) {
      return { courses: getLocalCourses(true).map(mapLocalCourse) };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('courses')
      .select('id,title,slug,short_description,description,category,class_level,level,duration,thumbnail_url,is_free,price,is_published')
      .order('updated_at', { ascending: false });

    if (error) return { error: error.message };

    const courseRows = data as CourseRow[];
    const courseIds = courseRows.map((course) => course.id);
    const { data: componentData, error: componentError } = courseIds.length
      ? await supabase
          .from('course_components')
          .select('id,course_id,component_name,quantity,product_url,position')
          .in('course_id', courseIds)
          .eq('component_role', 'required')
          .order('position', { ascending: true })
      : { data: [], error: null };

    if (componentError) return { error: componentError.message };
    const components = (componentData || []) as CourseComponentRow[];
    return {
      courses: courseRows.map((course) =>
        mapCourseRow(
          course,
          components.filter((component) => component.course_id === course.id),
        ),
      ),
    };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

export async function createCourseAction(input: TeacherCourseInput): Promise<{
  course?: TeacherCourse;
  error?: string;
}> {
  try {
    const user = await requireTeacher();
    const course = validateCourseInput(input);

    if (!hasSupabaseEnv) {
      if (getLocalCourses(true).some((item) => item.slug === course.slug)) {
        return { error: 'A course with this slug already exists.' };
      }

      const localCourse: LmsCourse = {
        id: randomUUID(),
        title: course.title,
        slug: course.slug,
        shortDescription: course.shortDescription,
        description: course.description,
        category: course.category,
        classLevel: course.classLevel,
        level: course.level,
        duration: course.duration,
        lessonsCount: 0,
        language: 'English',
        pricing: course.pricing,
        price: course.price,
        thumbnailUrl: course.thumbnailUrl,
        whatYouWillLearn: [],
        modules: [],
        requiredComponents: course.products,
        projects: [],
        downloadablePdfs: [],
        relatedProducts: [],
        faqs: [],
      };
      upsertLocalCourse(localCourse, course.isPublished);
      revalidateContent(course.slug);
      return { course: mapLocalCourse(localCourse) };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('courses')
      .insert({
        title: course.title,
        slug: course.slug,
        short_description: course.shortDescription,
        description: course.description,
        category: course.category,
        class_level: course.classLevel,
        level: course.level,
        duration: course.duration,
        thumbnail_url: course.thumbnailUrl || null,
        is_free: course.pricing === 'Free',
        price: course.pricing === 'Free' ? 0 : course.price,
        is_published: course.isPublished,
        created_by: user.id,
      })
      .select('id,title,slug,short_description,description,category,class_level,level,duration,thumbnail_url,is_free,price,is_published')
      .single();

    if (error) return { error: error.message };

    const componentError = await replaceCourseProducts(supabase, data.id, course.products);
    if (componentError) {
      await supabase.from('courses').delete().eq('id', data.id);
      return { error: componentError };
    }

    revalidateContent(course.slug);
    return { course: mapCourseRow(data as CourseRow, toCourseComponentRows(data.id, course.products)) };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

export async function updateCourseAction(input: TeacherCourseInput): Promise<{
  course?: TeacherCourse;
  error?: string;
}> {
  try {
    await requireTeacher();
    if (!input.id) return { error: 'Course ID is required.' };
    const course = validateCourseInput(input);

    if (!hasSupabaseEnv) {
      const localCourses = getLocalCourses(true);
      const index = localCourses.findIndex((item) => (item.id || item.slug) === input.id);
      if (index === -1) return { error: 'Course not found.' };
      if (localCourses.some((item, itemIndex) => itemIndex !== index && item.slug === course.slug)) {
        return { error: 'A course with this slug already exists.' };
      }

      const current = localCourses[index];
      const updatedCourse: LmsCourse = {
        ...current,
        title: course.title,
        slug: course.slug,
        shortDescription: course.shortDescription,
        description: course.description,
        category: course.category,
        classLevel: course.classLevel,
        level: course.level,
        duration: course.duration,
        pricing: course.pricing,
        price: course.price,
        thumbnailUrl: course.thumbnailUrl,
        requiredComponents: course.products,
      };
      upsertLocalCourse(updatedCourse, course.isPublished);
      revalidateContent(course.slug);
      return { course: mapLocalCourse(updatedCourse) };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('courses')
      .update({
        title: course.title,
        slug: course.slug,
        short_description: course.shortDescription,
        description: course.description,
        category: course.category,
        class_level: course.classLevel,
        level: course.level,
        duration: course.duration,
        thumbnail_url: course.thumbnailUrl || null,
        is_free: course.pricing === 'Free',
        price: course.pricing === 'Free' ? 0 : course.price,
        is_published: course.isPublished,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.id)
      .select('id,title,slug,short_description,description,category,class_level,level,duration,thumbnail_url,is_free,price,is_published')
      .single();

    if (error) return { error: error.message };

    const componentError = await replaceCourseProducts(supabase, data.id, course.products);
    if (componentError) return { error: componentError };

    revalidateContent(course.slug);
    return { course: mapCourseRow(data as CourseRow, toCourseComponentRows(data.id, course.products)) };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

export async function deleteCourseAction(id: string): Promise<{ success?: boolean; error?: string }> {
  try {
    await requireTeacher();
    if (!id) return { error: 'Course ID is required.' };

    if (!hasSupabaseEnv) {
      const removed = deleteLocalCourse(id);
      if (!removed) return { error: 'Course not found.' };
      revalidateContent(removed.slug);
      return { success: true };
    }

    const supabase = await createClient();
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) return { error: error.message };
    revalidateContent();
    return { success: true };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

function validateCourseInput(input: TeacherCourseInput): Omit<TeacherCourse, 'id'> {
  const title = input.title?.trim();
  const slug = slugify(input.slug || input.title || '');
  const category = input.category?.trim();

  if (!title || !slug || !category) {
    throw new Error('Title, slug, and category are required.');
  }

  const level: LmsLevel = ['Beginner', 'Intermediate', 'Advanced'].includes(input.level)
    ? input.level
    : 'Beginner';
  const classLevel = normalizeSchoolClass(input.classLevel);
  const pricing: PricingType = input.pricing === 'Paid' ? 'Paid' : 'Free';
  const price = pricing === 'Paid' ? Math.max(0, Number(input.price) || 0) : 0;

  return {
    title,
    slug,
    shortDescription: input.shortDescription?.trim() || '',
    description: input.description?.trim() || '',
    category,
    classLevel,
    level,
    duration: input.duration?.trim() || 'Self-paced',
    thumbnailUrl: input.thumbnailUrl?.trim() || '',
    pricing,
    price,
    products: normalizeProducts(input.products),
    isPublished: Boolean(input.isPublished),
  };
}

function mapCourseRow(row: CourseRow, components: CourseComponentRow[] = []): TeacherCourse {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    shortDescription: row.short_description || '',
    description: row.description || '',
    category: row.category || 'Robotics',
    classLevel: normalizeSchoolClass(row.class_level),
    level: normalizeLevel(row.level),
    duration: row.duration || 'Self-paced',
    thumbnailUrl: row.thumbnail_url || '',
    pricing: row.is_free === false ? 'Paid' : 'Free',
    price: Number(row.price) || 0,
    products: components.map((component) => ({
      id: component.id,
      name: component.component_name,
      quantity: Math.max(1, Number(component.quantity) || 1),
      productUrl: component.product_url || '',
    })),
    isPublished: Boolean(row.is_published),
  };
}

function mapLocalCourse(course: LmsCourse): TeacherCourse {
  return {
    id: course.id || course.slug,
    title: course.title,
    slug: course.slug,
    shortDescription: course.shortDescription,
    description: course.description,
    category: course.category,
    classLevel: course.classLevel,
    level: course.level,
    duration: course.duration,
    thumbnailUrl: course.thumbnailUrl,
    pricing: course.pricing,
    price: course.price || 0,
    products: course.requiredComponents,
    isPublished: isLocalCoursePublished(course),
  };
}

async function replaceCourseProducts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  courseId: string,
  products: LmsComponent[],
) {
  const { error: deleteError } = await supabase
    .from('course_components')
    .delete()
    .eq('course_id', courseId)
    .eq('component_role', 'required');

  if (deleteError) return deleteError.message;
  if (!products.length) return null;

  const { error: insertError } = await supabase
    .from('course_components')
    .insert(
      products.map((product, position) => ({
        course_id: courseId,
        component_name: product.name,
        quantity: product.quantity,
        product_url: product.productUrl,
        component_role: 'required',
        position,
      })),
    );

  return insertError?.message || null;
}

function toCourseComponentRows(courseId: string, products: LmsComponent[]): CourseComponentRow[] {
  return products.map((product, position) => ({
    id: product.id || `${courseId}-${position}`,
    course_id: courseId,
    component_name: product.name,
    quantity: product.quantity,
    product_url: product.productUrl,
    position,
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

function normalizeLevel(value?: string | null): LmsLevel {
  if (value === 'Intermediate' || value === 'Advanced') return value;
  return 'Beginner';
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function revalidateContent(slug?: string) {
  revalidatePath('/admin/courses');
  revalidatePath('/courses');
  revalidatePath('/');
  if (slug) revalidatePath(`/courses/${slug}`);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unable to manage course content.';
}
