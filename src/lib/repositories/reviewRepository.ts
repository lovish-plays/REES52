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
        .select('id, name, email, rating, review, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[ReviewRepository.getReviews] failed, returning empty list:', error.message);
        return [];
      }

      interface ReviewRow {
        id: string;
        name: string;
        email: string | null;
        rating: number;
        review: string;
        created_at: string;
      }

      return ((data || []) as ReviewRow[]).map((item) => ({
        id: item.id,
        name: item.name,
        email: item.email || '',
        rating: item.rating,
        review: item.review,
        created_at: item.created_at
      }));
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error('[ReviewRepository.getReviews] exception:', errMsg);
      return [];
    }
  }

  /**
   * Inserts a new review into the Supabase reviews table.
   */
  static async addReview(
    name: string,
    email: string,
    rating: number,
    review: string
  ): Promise<{ success: boolean; review?: Review; error?: string }> {
    try {
      const cleanName = (name || 'Anonymous Learner').trim();
      const cleanEmail = (email || 'anonymous@rees52.tech').trim().toLowerCase();
      const cleanReview = (review || '').trim();
      const ratingVal = Math.min(5, Math.max(1, rating));

      if (!cleanReview) {
        return { success: false, error: 'Review text cannot be empty.' };
      }

      const newReview = {
        name: cleanName,
        email: cleanEmail,
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

      interface ReviewRow {
        id: string;
        name: string;
        email: string | null;
        rating: number;
        review: string;
        created_at: string;
      }

      const inserted = data as ReviewRow;

      return {
        success: true,
        review: {
          id: inserted.id,
          name: inserted.name,
          email: inserted.email || '',
          rating: inserted.rating,
          review: inserted.review,
          created_at: inserted.created_at
        }
      };
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to submit review to database.';
      console.error('[ReviewRepository.addReview] exception:', errMsg);
      return { success: false, error: errMsg };
    }
  }
}
