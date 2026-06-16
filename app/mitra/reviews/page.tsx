'use client';
import { useState, useEffect } from 'react';
import { Star, MessageSquare, Reply } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import { Review } from '@/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { replyToReviewAdmin } from '@/app/actions/reviews';

export default function MitraReviewsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchReviews() {
      if (!user) return;
      // Get partner
      const { data: partnerData } = await supabase.from('partners').select('id').eq('user_id', user.id).single();
      if (!partnerData) return;

      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*, customer:profiles(*)')
        .eq('partner_id', partnerData.id)
        .order('created_at', { ascending: false });

      if (reviewsData) setReviews(reviewsData as any[]);
      setIsLoading(false);
    }
    fetchReviews();
  }, [user]);

  const handleReplySubmit = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    const result = await replyToReviewAdmin(reviewId, replyText);
    if (result.success) {
      addToast('success', 'Balasan berhasil dikirim!');
      setReviews(reviews.map(r => r.id === reviewId ? { ...r, partner_reply: replyText } : r));
      setReplyingTo(null);
      setReplyText('');
    } else {
      addToast('error', 'Gagal mengirim balasan: ' + result.error);
    }
    setIsSubmitting(false);
  };

  if (isLoading) return <div className="text-center py-20">Memuat ulasan...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-text-primary flex items-center gap-2">
          <MessageSquare size={28} className="text-primary" /> Ulasan Pelanggan
        </h1>
        <p className="text-text-secondary mt-1">Tanggapi ulasan dari pahlawan penyelamat makananmu.</p>
      </div>

      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map(review => (
            <div key={review.id} className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center font-bold text-primary text-lg">
                    {review.customer?.full_name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div>
                    <p className="font-bold">{review.customer?.full_name || 'Anonim'}</p>
                    <p className="text-xs text-text-muted">{new Date(review.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg font-bold">
                  <Star size={16} className="fill-amber-500" /> {review.rating}
                </div>
              </div>

              {review.comment ? (
                <p className="text-text-primary mb-4 bg-background p-4 rounded-xl">"{review.comment}"</p>
              ) : (
                <p className="text-text-muted italic mb-4">Pelanggan tidak meninggalkan komentar teks.</p>
              )}

              {/* Partner Reply Section */}
              {review.partner_reply ? (
                <div className="bg-primary-light/30 border border-primary-light rounded-xl p-4 ml-6 relative">
                  <div className="absolute -left-3 top-4 text-primary">
                    <Reply size={20} className="transform rotate-180" />
                  </div>
                  <p className="text-xs font-bold text-primary mb-1">Balasan Anda</p>
                  <p className="text-sm text-text-secondary">{review.partner_reply}</p>
                </div>
              ) : (
                <div className="ml-6">
                  {replyingTo === review.id ? (
                    <div className="mt-2 space-y-3">
                      <textarea
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors min-h-[80px]"
                        placeholder="Tulis balasanmu di sini..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button size="sm" isLoading={isSubmitting} onClick={() => handleReplySubmit(review.id)}>Kirim Balasan</Button>
                        <Button size="sm" variant="ghost" onClick={() => { setReplyingTo(null); setReplyText(''); }}>Batal</Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" className="text-primary border-primary/30 hover:bg-primary-light" onClick={() => setReplyingTo(review.id)}>
                      <Reply size={16} className="mr-1" /> Balas Ulasan
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-surface rounded-2xl border border-border p-12 text-center">
            <MessageSquare size={48} className="text-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Belum Ada Ulasan</h3>
            <p className="text-text-secondary">Ulasan dari pelanggan akan muncul di sini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
