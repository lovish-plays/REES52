'use server';

import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';
import { getCurrentUser } from '@/app/actions/auth';
import { isTeacherRole } from '@/lib/auth/roles';
import { isSafeExternalQuizUrl } from '@/lib/lms/quiz-links';
import {
  createLocalQuizLink,
  deleteLocalQuizLink,
  getLocalQuizLinks,
  updateLocalQuizLink,
} from '@/lib/lms/local-quiz-links';
import { hasSupabaseEnv } from '@/lib/supabaseConfig';
import { createClient } from '@/lib/supabaseServer';

export type TeacherQuizLink = {
  id: string;
  topic: string;
  description: string;
  quizUrl: string;
};

export type TeacherQuizLinkInput = Omit<TeacherQuizLink, 'id'> & { id?: string };

type QuizLinkRow = {
  id: string;
  title: string;
  description: string | null;
  meeting_url: string | null;
};

async function requireTeacher() {
  const user = await getCurrentUser();
  if (!user || !isTeacherRole(user.role)) {
    throw new Error('Teacher access is required to manage quiz links.');
  }
}

export async function getTeacherQuizLinksAction(): Promise<{
  quizLinks?: TeacherQuizLink[];
  error?: string;
}> {
  try {
    await requireTeacher();
    if (!hasSupabaseEnv) return { quizLinks: getLocalQuizLinks() };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('webinars')
      .select('id,title,description,meeting_url')
      .is('schedule_date', null)
      .eq('is_live', false)
      .order('created_at', { ascending: false });

    if (error) return { error: error.message };
    return { quizLinks: (data as QuizLinkRow[]).map(mapQuizLinkRow) };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

export async function createTeacherQuizLinkAction(
  input: TeacherQuizLinkInput,
): Promise<{ quizLink?: TeacherQuizLink; error?: string }> {
  try {
    await requireTeacher();
    const quizLink = validateQuizLink(input);
    if (!hasSupabaseEnv) {
      const saved = createLocalQuizLink({ id: randomUUID(), ...quizLink });
      revalidateQuizLinks();
      return { quizLink: saved };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('webinars')
      .insert({
        title: quizLink.topic,
        description: quizLink.description,
        meeting_url: quizLink.quizUrl,
        schedule_date: null,
        is_live: false,
      })
      .select('id,title,description,meeting_url')
      .single();

    if (error) return { error: error.message };
    revalidateQuizLinks();
    return { quizLink: mapQuizLinkRow(data as QuizLinkRow) };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

export async function updateTeacherQuizLinkAction(
  input: TeacherQuizLinkInput,
): Promise<{ quizLink?: TeacherQuizLink; error?: string }> {
  try {
    await requireTeacher();
    if (!input.id) return { error: 'Quiz link ID is required.' };
    const quizLink = validateQuizLink(input);
    if (!hasSupabaseEnv) {
      const saved = updateLocalQuizLink({ id: input.id, ...quizLink });
      if (!saved) return { error: 'Quiz link not found.' };
      revalidateQuizLinks();
      return { quizLink: saved };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('webinars')
      .update({
        title: quizLink.topic,
        description: quizLink.description,
        meeting_url: quizLink.quizUrl,
      })
      .eq('id', input.id)
      .is('schedule_date', null)
      .eq('is_live', false)
      .select('id,title,description,meeting_url')
      .single();

    if (error) return { error: error.message };
    revalidateQuizLinks();
    return { quizLink: mapQuizLinkRow(data as QuizLinkRow) };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

export async function deleteTeacherQuizLinkAction(
  id: string,
): Promise<{ success?: boolean; error?: string }> {
  try {
    await requireTeacher();
    if (!id) return { error: 'Quiz link ID is required.' };
    if (!hasSupabaseEnv) {
      if (!deleteLocalQuizLink(id)) return { error: 'Quiz link not found.' };
      revalidateQuizLinks();
      return { success: true };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('webinars')
      .delete()
      .eq('id', id)
      .is('schedule_date', null)
      .eq('is_live', false);

    if (error) return { error: error.message };
    revalidateQuizLinks();
    return { success: true };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

function validateQuizLink(input: TeacherQuizLinkInput): Omit<TeacherQuizLink, 'id'> {
  const topic = input.topic?.trim();
  const description = input.description?.trim();
  const quizUrl = input.quizUrl?.trim();

  if (!topic || !description || !quizUrl) {
    throw new Error('Topic name, description and quiz link are required.');
  }
  if (topic.length > 140) throw new Error('Topic name must be 140 characters or fewer.');
  if (description.length > 800) throw new Error('Description must be 800 characters or fewer.');
  if (!isSafeExternalQuizUrl(quizUrl)) {
    throw new Error('Quiz link must be a valid secure https:// address.');
  }

  return { topic, description, quizUrl };
}

function mapQuizLinkRow(row: QuizLinkRow): TeacherQuizLink {
  return {
    id: row.id,
    topic: row.title?.trim() || 'Untitled quiz',
    description: row.description?.trim() || '',
    quizUrl: row.meeting_url?.trim() || '',
  };
}

function revalidateQuizLinks() {
  revalidatePath('/admin/quizzes');
  revalidatePath('/quizzes');
  revalidatePath('/');
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unable to manage quiz links.';
}
