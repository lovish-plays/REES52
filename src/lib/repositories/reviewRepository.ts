import { supabasePublic } from '@/lib/supabasePublic';
import { Review } from '@/lib/db';

export class ReviewRepository {
  /**
   * Fetches all reviews from Supabase PostgreSQL database.
   * Fallback: Returns empty list if table or DB query fails.
   */
  static async getReviews(): Promise<Review[]> {
    try {
      const { data, error } = await supabasePublic
        .from('reviews')
        .select('id, name, rating, comment, avatar_url, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[ReviewRepository.getReviews] failed, returning empty list:', error.message);
        return [];
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        rating: item.rating,
        comment: item.comment,
        created_at: item.created_at,
        avatar_url: item.avatar_url || undefined
      }));
    } catch (err: any) {
      console.error('[ReviewRepository.getReviews] exception:', err.message || err);
      return [];
    }
  }

  /**
   * Inserts a new review into the Supabase reviews table.
   */
  static async addReview(
    name: string,
    rating: number,
    comment: string,
    avatarUrl?: string
  ): Promise<{ success: boolean; review?: Review; error?: string }> {
    try {
      const cleanName = (name || 'Anonymous Learner').trim();
      const cleanComment = (comment || '').trim();
      const ratingVal = Math.min(5, Math.max(1, rating));

      if (!cleanComment) {
        return { success: false, error: 'Review comment cannot be empty.' };
      }

      const newReview = {
        name: cleanName,
        rating: ratingVal,
        comment: cleanComment,
        avatar_url: avatarUrl || null,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabasePublic
        .from('reviews')
        .insert(newReview)
        .select()
        .single();

      if (error) {
        console.error('[ReviewRepository.addReview] DB insert failed:', error.message);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        review: {
          id: data.id,
          name: data.name,
          rating: data.rating,
          comment: data.comment,
          created_at: data.created_at,
          avatar_url: data.avatar_url || undefined
        }
      };
    } catch (err: any) {
      console.error('[ReviewRepository.addReview] exception:', err.message || err);
      return { success: false, error: err.message || 'Failed to submit review to database.' };
    }
  }
}
