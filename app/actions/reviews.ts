'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function submitReview(
  orderId: string,
  customerId: string,
  partnerId: string,
  rating: number,
  comment: string
) {
  try {
    // 1. Insert review
    const { error: insertError } = await supabaseAdmin.from('reviews').insert([
      {
        order_id: orderId,
        customer_id: customerId,
        partner_id: partnerId,
        rating,
        comment,
      }
    ]);

    if (insertError) {
      console.error('Failed to insert review:', insertError);
      return { success: false, error: insertError.message };
    }

    // 2. Fetch all reviews for this partner to recalculate avg rating
    const { data: reviews, error: fetchError } = await supabaseAdmin
      .from('reviews')
      .select('rating')
      .eq('partner_id', partnerId);

    if (fetchError) {
      console.error('Failed to fetch reviews for avg calculation:', fetchError);
      return { success: true }; // Still return success because review was inserted
    }

    // 3. Calculate new average
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 
      ? Number((reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1))
      : rating;

    // 4. Update partner stats
    const { error: updateError } = await supabaseAdmin
      .from('partners')
      .update({ avg_rating: avgRating, total_reviews: totalReviews })
      .eq('id', partnerId);

    if (updateError) {
      console.error('Failed to update partner stats:', updateError);
    }

    return { success: true };
  } catch (err: any) {
    console.error('Unexpected error in submitReview:', err);
    return { success: false, error: err.message };
  }
}

export async function replyToReviewAdmin(reviewId: string, reply: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .update({ partner_reply: reply })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) {
      console.error('Error adding reply:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('Unexpected error:', err);
    return { success: false, error: err.message };
  }
}

