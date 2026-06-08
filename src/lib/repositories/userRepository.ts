import { supabasePublic } from '@/lib/supabasePublic';
import { createClient as createSupabaseServerClient } from '@/lib/supabaseServer';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { User, UserProgress, UserCertificate, UserBadge, UserStreak } from '@/lib/db';

// Helper to get Supabase Admin client for sensitive queries
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
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

export class UserRepository {
  /**
   * Helper to resolve the active database client (Admin, Server-Side, or Public)
   */
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

  /**
   * Fetches a user profile by ID.
   */
  static async getUserById(userId: string): Promise<User | null> {
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

  /**
   * Fetches a user profile by email (used during authentication).
   */
  static async getUserByEmail(email: string, forceAdmin = false): Promise<User | null> {
    try {
      const client = await this.getClient(forceAdmin);
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (error || !data) return null;
      return this.mapProfileToUser(data);
    } catch (err) {
      console.error('[UserRepository.getUserByEmail] error:', err);
      return null;
    }
  }

  /**
   * Creates a new user profile record.
   */
  static async createUser(user: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const client = await this.getClient();
      const payload = {
        id: user.id,
        name: user.name,
        email: user.email?.trim().toLowerCase(),
        password_hash: user.password_hash || null,
        role: user.role || 'Student',
        enrolled_videos: user.enrolled_videos || [],
        purchased_ebooks: user.purchased_ebooks || [],
        avatar_url: user.avatar_url || null,
        provider: user.provider || 'email',
        progress: user.progress || {},
        badges: user.badges || [],
        streak: user.streak || { current: 0, longest: 0, lastActivityDate: '' },
        certificates: user.certificates || [],
        recently_viewed: user.recently_viewed || []
      };

      const { data, error } = await client
        .from('profiles')
        .insert(payload)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, user: this.mapProfileToUser(data) };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to create database user.' };
    }
  }

  /**
   * Updates general fields of a user profile.
   */
  static async updateUser(userId: string, updates: Partial<User>, forceAdmin = false): Promise<boolean> {
    try {
      const client = await this.getClient(forceAdmin);
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.password_hash !== undefined) payload.password_hash = updates.password_hash;
      if (updates.role !== undefined) payload.role = updates.role;
      if (updates.avatar_url !== undefined) payload.avatar_url = updates.avatar_url;
      if (updates.provider !== undefined) payload.provider = updates.provider;
      if (updates.enrolled_videos !== undefined) payload.enrolled_videos = updates.enrolled_videos;
      if (updates.purchased_ebooks !== undefined) payload.purchased_ebooks = updates.purchased_ebooks;
      if (updates.progress !== undefined) payload.progress = updates.progress;
      if (updates.badges !== undefined) payload.badges = updates.badges;
      if (updates.streak !== undefined) payload.streak = updates.streak;
      if (updates.certificates !== undefined) payload.certificates = updates.certificates;
      if (updates.recently_viewed !== undefined) payload.recently_viewed = updates.recently_viewed;

      const { error } = await client
        .from('profiles')
        .update(payload)
        .eq('id', userId);

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

  /**
   * Maps database raw fields to User interface typings.
   */
  private static mapProfileToUser(raw: any): User {
    return {
      id: raw.id,
      name: raw.name || 'Maker',
      email: raw.email || '',
      password_hash: raw.password_hash || undefined,
      role: (raw.role as 'Student' | 'Admin') || 'Student',
      enrolled_videos: raw.enrolled_videos || [],
      purchased_ebooks: raw.purchased_ebooks || [],
      avatar_url: raw.avatar_url || undefined,
      provider: raw.provider || 'email',
      progress: typeof raw.progress === 'string' ? JSON.parse(raw.progress) : (raw.progress || {}),
      badges: typeof raw.badges === 'string' ? JSON.parse(raw.badges) : (raw.badges || []),
      streak: typeof raw.streak === 'string' ? JSON.parse(raw.streak) : (raw.streak || { current: 0, longest: 0, lastActivityDate: '' }),
      certificates: typeof raw.certificates === 'string' ? JSON.parse(raw.certificates) : (raw.certificates || []),
      recently_viewed: raw.recently_viewed || []
    };
  }
}
