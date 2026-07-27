import { supabasePublic } from '@/lib/supabasePublic';
import { getDB, saveDB, Review } from '@/lib/db';
import { hasSupabaseEnv } from '@/lib/supabaseConfig';

export class ReviewRepository {
  static async getReviews(): Promise<Review[]> {
    if (!hasSupabaseEnv) {
      return [...(getDB().reviews || [])].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    try {
      const { data, error } = await supabasePublic
        .from('reviews')
        .select('id, name, email, rating, review, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[ReviewRepository.getReviews] failed, returning empty list:', error.message);
        return [];
      }

      return ((data || []) as Review[]).map((item) => ({
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

  static async addReview(
    name: string,
    email: string,
    rating: number,
    review: string
  ): Promise<{ success: boolean; review?: Review; error?: string }> {
    const cleanName = (name || 'Anonymous Learner').trim();
    const cleanEmail = (email || 'anonymous@rees52.tech').trim().toLowerCase();
    const cleanReview = (review || '').trim();
    const ratingVal = Math.min(5, Math.max(1, rating));

    if (!cleanReview) {
      return { success: false, error: 'Review text cannot be empty.' };
    }

    const newReview: Review = {
      id: crypto.randomUUID(),
      name: cleanName,
      email: cleanEmail,
      rating: ratingVal,
      review: cleanReview,
      created_at: new Date().toISOString()
    };

    if (!hasSupabaseEnv) {
      const db = getDB();
      db.reviews = [newReview, ...(db.reviews || [])];
      saveDB(db);
      return { success: true, review: newReview };
    }

    try {
      const { data, error } = await supabasePublic
        .from('reviews')
        .insert({
          name: newReview.name,
          email: newReview.email,
          rating: newReview.rating,
          review: newReview.review,
          created_at: newReview.created_at
        })
        .select()
        .single();

      if (error) {
        console.error('[ReviewRepository.addReview] DB insert failed:', error.message);
        return { success: false, error: error.message };
      }

      const inserted = data as Review;

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
