'use server';

import { getDB, saveDB, Review, generateUUID } from '@/lib/db';
import { getCurrentUser } from '@/app/actions/auth';

/**
 * Fetches all platform reviews from the database.
 * Sorts them by creation date descending so newest appear first.
 */
export async function getReviewsAction(): Promise<Review[]> {
  try {
    const db = getDB();
    const reviews = db.reviews || [];
    return [...reviews].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (err) {
    console.error('getReviewsAction error:', err);
    return [];
  }
}

/**
 * Submits a new platform review.
 * Captures user session details (avatar, name) if authenticated.
 */
export async function submitReviewAction(
  name: string,
  rating: number,
  comment: string
): Promise<{ success: boolean; review?: Review; error?: string }> {
  try {
    const db = getDB();
    if (!db.reviews) {
      db.reviews = [];
    }

    // Attempt to resolve active user for profile properties
    const currentUser = await getCurrentUser();
    
    const ratingVal = Math.min(5, Math.max(1, rating));
    const cleanName = (name || currentUser?.name || 'Anonymous Learner').trim();
    const cleanComment = (comment || '').trim();

    if (!cleanComment) {
      return { success: false, error: 'Review comment cannot be empty.' };
    }

    const newReview: Review = {
      id: 'rev-' + generateUUID(),
      name: cleanName,
      rating: ratingVal,
      comment: cleanComment,
      created_at: new Date().toISOString(),
      avatar_url: currentUser?.avatar_url || undefined
    };

    db.reviews.push(newReview);
    saveDB(db);

    return { success: true, review: newReview };
  } catch (err: any) {
    console.error('submitReviewAction error:', err);
    return { success: false, error: err.message || 'An error occurred while saving the review.' };
  }
}
