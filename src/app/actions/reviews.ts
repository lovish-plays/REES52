'use server';

import { Review } from '@/lib/db';
import { getCurrentUser } from '@/app/actions/auth';
import { ReviewRepository } from '@/lib/repositories/reviewRepository';
import { checkRateLimit } from '@/lib/rateLimit';

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
  review: string
): Promise<{ success: boolean; review?: Review; error?: string }> {
  try {
    const rateCheck = await checkRateLimit({
      limit: 5,
      windowSeconds: 600, // 5 reviews per 10 minutes
      action: 'submit-review',
    });
    if (!rateCheck.success) {
      return { success: false, error: rateCheck.error };
    }

    const cleanName = (name || '').trim();
    const cleanReview = (review || '').trim();
    const cleanRating = Math.round(Number(rating));

    if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
      return { success: false, error: 'Name must be between 2 and 100 characters.' };
    }

    if (isNaN(cleanRating) || cleanRating < 1 || cleanRating > 5) {
      return { success: false, error: 'Rating must be between 1 and 5 stars.' };
    }

    if (!cleanReview || cleanReview.length < 10 || cleanReview.length > 1000) {
      return { success: false, error: 'Review text must be between 10 and 1000 characters.' };
    }

    // Attempt to resolve active user for profile properties
    const currentUser = await getCurrentUser();
    const email = currentUser?.email || 'anonymous@rees52.tech';
    
    return await ReviewRepository.addReview(
      cleanName,
      email,
      cleanRating,
      cleanReview
    );
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'An error occurred while saving the review.';
    console.error('submitReviewAction error:', err);
    return { success: false, error: errMsg };
  }
}

