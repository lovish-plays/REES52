'use server';

import { Review } from '@/lib/db';
import { getCurrentUser } from '@/app/actions/auth';
import { ReviewRepository } from '@/lib/repositories/reviewRepository';

/**
 * Fetches all platform reviews from the database.
 * Sorts them by creation date descending so newest appear first.
 */
export async function getReviewsAction(): Promise<Review[]> {
  return await ReviewRepository.getReviews();
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
    // Attempt to resolve active user for profile properties
    const currentUser = await getCurrentUser();
    
    return await ReviewRepository.addReview(
      name,
      rating,
      comment,
      currentUser?.avatar_url || undefined
    );
  } catch (err: any) {
    console.error('submitReviewAction error:', err);
    return { success: false, error: err.message || 'An error occurred while saving the review.' };
  }
}
