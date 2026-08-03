import { supabasePublic } from '@/lib/supabasePublic';
import { createClient as createSupabaseServerClient } from '@/lib/supabaseServer';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getDB, saveDB, User } from '@/lib/db';
import { hasSupabaseEnv, supabaseUrl } from '@/lib/supabaseConfig';
import { normalizeRole } from '@/lib/auth/roles';

import { sanitizeErrorMessage } from '@/lib/utils';

function getAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && serviceRoleKey) {
    return createSupabaseClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return null;
}

function normalizeProfileRole(role?: string) {
  return normalizeRole(role).toLowerCase();
}

export class UserRepository {
  private static async getClient(useAdmin = false) {
    if (useAdmin) {
      const admin = getAdminClient();
      if (admin) return admin;
    }
    try {
      return await createSupabaseServerClient();
    } catch {
      return supabasePublic;
    }
  }

  static async getUserById(userId: string): Promise<User | null> {
    if (!hasSupabaseEnv) {
      const db = getDB();
      return db.users.find((user) => user.id === userId) ?? null;
    }

    try {
      const client = await this.getClient();
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) return null;
      return this.mapProfileToUser(data);
    } catch (err) {
      console.error('[UserRepository.getUserById] error:', err);
      return null;
    }
  }

  static async getUserByEmail(email: string, forceAdmin = false): Promise<User | null> {
    const cleanEmail = email.trim().toLowerCase();

    if (!hasSupabaseEnv) {
      const db = getDB();
      return db.users.find((user) => user.email.toLowerCase() === cleanEmail) ?? null;
    }

    try {
      const client = await this.getClient(forceAdmin);
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (error || !data) return null;
      return this.mapProfileToUser(data);
    } catch (err) {
      console.error('[UserRepository.getUserByEmail] error:', err);
      return null;
    }
  }

  static async createUser(user: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    const newUser: User = {
      id: user.id || crypto.randomUUID(),
      name: user.name || 'Maker',
      email: user.email?.trim().toLowerCase() || '',
      password_hash: user.password_hash,
      role: user.role || 'Student',
      classLevel: user.classLevel,
      enrolled_courses: user.enrolled_courses || [],
      enrolled_videos: user.enrolled_videos || [],
      purchased_ebooks: user.purchased_ebooks || [],
      provider: user.provider || 'email',
      progress: user.progress || {},
      badges: user.badges || [],
      streak: user.streak || { current: 0, longest: 0, lastActivityDate: '' },
      certificates: user.certificates || [],
      recently_viewed: user.recently_viewed || []
    };

    if (!hasSupabaseEnv) {
      const db = getDB();
      if (db.users.some((existing) => existing.email.toLowerCase() === newUser.email.toLowerCase())) {
        return { success: false, error: 'A user with this email already exists.' };
      }
      db.users.push(newUser);
      saveDB(db);
      return { success: true, user: newUser };
    }

    try {
      const client = await this.getClient();
      // TODO: For production Supabase Auth, create auth.users first and pass that UUID here.
      const lmsProfilePayload = {
        id: newUser.id,
        full_name: newUser.name,
        email: newUser.email,
        role: normalizeProfileRole(newUser.role),
      };

      let { data, error } = await client
        .from('profiles')
        .insert(lmsProfilePayload)
        .select()
        .single();

      if (error) {
        const legacyPayload = {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          class_level: newUser.classLevel,
          enrolled_courses: newUser.enrolled_courses,
          enrolled_videos: newUser.enrolled_videos,
          purchased_ebooks: newUser.purchased_ebooks,
          provider: newUser.provider,
          progress: newUser.progress,
          badges: newUser.badges,
          streak: newUser.streak,
          certificates: newUser.certificates,
          recently_viewed: newUser.recently_viewed
        };

        const retry = await client
          .from('profiles')
          .insert(legacyPayload)
          .select()
          .single();
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        return { success: false, error: sanitizeErrorMessage(error, "Failed to create user profile. Please try again.") };
      }

      return { success: true, user: this.mapProfileToUser(data) };
    } catch (err) {
      return { success: false, error: sanitizeErrorMessage(err, "Failed to create user profile. Please try again.") };
    }
  }

  static async updateUser(userId: string, updates: Partial<User>, forceAdmin = false): Promise<boolean> {
    if (!hasSupabaseEnv) {
      const db = getDB();
      const index = db.users.findIndex((user) => user.id === userId || user.email === updates.email);
      if (index === -1) return false;
      db.users[index] = {
        ...db.users[index],
        ...updates,
      };
      saveDB(db);
      return true;
    }

    try {
      const client = await this.getClient(forceAdmin);
      const payload: Record<string, unknown> = {};
      if (updates.name !== undefined) payload.full_name = updates.name;
      if (updates.email !== undefined) payload.email = updates.email;
      if (updates.role !== undefined) payload.role = normalizeProfileRole(updates.role);
      if (updates.classLevel !== undefined) payload.class_level = updates.classLevel;
      if (updates.enrolled_courses !== undefined) payload.enrolled_courses = updates.enrolled_courses;

      let { error } = await client
        .from('profiles')
        .update(payload)
        .eq('id', userId);

      if (error) {
        const legacyPayload: Record<string, unknown> = {};
        if (updates.name !== undefined) legacyPayload.name = updates.name;
        if (updates.email !== undefined) legacyPayload.email = updates.email;
        if (updates.role !== undefined) legacyPayload.role = updates.role;
        if (updates.classLevel !== undefined) legacyPayload.class_level = updates.classLevel;
        if (updates.enrolled_courses !== undefined) legacyPayload.enrolled_courses = updates.enrolled_courses;
        if (updates.provider !== undefined) legacyPayload.provider = updates.provider;
        if (updates.enrolled_videos !== undefined) legacyPayload.enrolled_videos = updates.enrolled_videos;
        if (updates.purchased_ebooks !== undefined) legacyPayload.purchased_ebooks = updates.purchased_ebooks;
        if (updates.progress !== undefined) legacyPayload.progress = updates.progress;
        if (updates.badges !== undefined) legacyPayload.badges = updates.badges;
        if (updates.streak !== undefined) legacyPayload.streak = updates.streak;
        if (updates.certificates !== undefined) legacyPayload.certificates = updates.certificates;
        if (updates.recently_viewed !== undefined) legacyPayload.recently_viewed = updates.recently_viewed;

        const retry = await client
          .from('profiles')
          .update(legacyPayload)
          .eq('id', userId);
        error = retry.error;
      }

      if (error) {
        console.error('[UserRepository.updateUser] DB error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('[UserRepository.updateUser] exception:', err);
      return false;
    }
  }

  private static mapProfileToUser(raw: Record<string, unknown>): User {
    return {
      id: String(raw.id),
      name: String(raw.name || raw.full_name || 'Maker'),
      email: String(raw.email || ''),
      password_hash: raw.password_hash ? String(raw.password_hash) : undefined,
      role: normalizeRole(String(raw.role || 'Student')),
      classLevel: raw.class_level ? String(raw.class_level) : undefined,
      enrolled_courses: Array.isArray(raw.enrolled_courses) ? raw.enrolled_courses as string[] : [],
      enrolled_videos: Array.isArray(raw.enrolled_videos) ? raw.enrolled_videos as string[] : [],
      purchased_ebooks: Array.isArray(raw.purchased_ebooks) ? raw.purchased_ebooks as string[] : [],
      provider: raw.provider ? String(raw.provider) : 'email',
      progress: this.parseJsonField(raw.progress, {}),
      badges: this.parseJsonField(raw.badges, []),
      streak: this.parseJsonField(raw.streak, { current: 0, longest: 0, lastActivityDate: '' }),
      certificates: this.parseJsonField(raw.certificates, []),
      recently_viewed: Array.isArray(raw.recently_viewed) ? raw.recently_viewed as string[] : []
    };
  }

  private static parseJsonField<T>(value: unknown, fallback: T): T {
    if (!value) return fallback;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as T;
      } catch {
        return fallback;
      }
    }
    return value as T;
  }
}
