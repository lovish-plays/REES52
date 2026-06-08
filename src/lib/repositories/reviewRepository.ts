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
        .select('id, name, rating, review, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[ReviewRepository.getReviews] failed, returning empty list:', error.message);
        return [];
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        rating: item.rating,
        review: item.review,
        created_at: item.created_at
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
    review: string
  ): Promise<{ success: boolean; review?: Review; error?: string }> {
    try {
      const cleanName = (name || 'Anonymous Learner').trim();
      const cleanReview = (review || '').trim();
      const ratingVal = Math.min(5, Math.max(1, rating));

      if (!cleanReview) {
        return { success: false, error: 'Review text cannot be empty.' };
      }

      const newReview = {
        name: cleanName,
        rating: ratingVal,
        review: cleanReview,
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
          review: data.review,
          created_at: data.created_at
        }
      };
    } catch (err: any) {
      console.error('[ReviewRepository.addReview] exception:', err.message || err);
      return { success: false, error: err.message || 'Failed to submit review to database.' };
    }
  }
}
