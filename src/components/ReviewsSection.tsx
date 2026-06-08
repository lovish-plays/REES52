"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getReviewsAction, submitReviewAction } from "@/app/actions/reviews";
import { Review } from "@/lib/db";
import { 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare, 
  X, 
  User,
  Sparkles
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ReviewsSection() {
  const { user } = useAuth();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Modal & Form States
  const [modalOpen, setModalOpen] = useState(false);
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch reviews on mount
  async function loadReviews() {
    try {
      setLoading(true);
      const list = await getReviewsAction();
      setReviews(list);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, []);

  // Pre-fill name if user changes
  useEffect(() => {
    if (user) {
      setReviewerName(user.name);
    } else {
      setReviewerName("");
    }
  }, [user]);

  const handlePrev = () => {
    if (reviews.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (reviews.length === 0) return;
    setCurrentIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  const openModal = () => {
    setModalOpen(true);
    setSubmitSuccess(false);
    setSubmitError("");
    setComment("");
    setRating(5);
    if (user) {
      setReviewerName(user.name);
    } else {
      setReviewerName("");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);

    const nameToSubmit = reviewerName.trim() || (user?.name ?? "Anonymous Learner");
    const commentToSubmit = comment.trim();

    if (!commentToSubmit) {
      setSubmitError("Please write your feedback comment.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await submitReviewAction(nameToSubmit, rating, commentToSubmit);
      if (res.success && res.review) {
        setSubmitSuccess(true);
        // Refresh reviews list
        const updatedList = await getReviewsAction();
        setReviews(updatedList);
        setCurrentIndex(0); // slide to the newly added review
        setTimeout(() => {
          setModalOpen(false);
        }, 1500);
      } else {
        setSubmitError(res.error || "Failed to submit review.");
      }
    } catch (err) {
      setSubmitError("An error occurred during submission.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Star Rating SVG renderer
  const renderStars = (count: number, size = 16, onClick?: (rating: number) => void, onHover?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((starVal) => {
          const isActive = onClick ? (hoverRating || rating) >= starVal : count >= starVal;
          return (
            <Star
              key={starVal}
              onClick={() => onClick && onClick(starVal)}
              onMouseEnter={() => onHover && onHover(starVal)}
              onMouseLeave={() => onHover && onHover(0)}
              style={{ width: size, height: size }}
              className={`transition-all duration-150 ${onClick ? "cursor-pointer" : ""} ${
                isActive 
                  ? "fill-amber-400 text-amber-400 scale-105 filter drop-shadow-[0_0_2px_rgba(251,191,36,0.3)]" 
                  : "text-slate-300 fill-transparent"
              }`}
            />
          );
        })}
      </div>
    );
  };

  // Fallback avatar generator
  const getRandomAvatar = (seed: string) => {
    const avatars = [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120",
      "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=120",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=120",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120"
    ];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % avatars.length;
    return avatars[index];
  };

  if (loading && reviews.length === 0) {
    return (
      <section className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-10 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-14 border-t border-slate-200/50 text-slate-800 flex flex-col gap-8">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/50 pb-5">
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200 w-fit">
            Community Voices
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-600 animate-pulse" /> What Our Inventors Say
          </h2>
          <p className="text-xs md:text-sm text-slate-650 font-medium">
            Read certified project reviews and learning experiences from students, educators, and makers worldwide.
          </p>
        </div>

        <button
          onClick={openModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-cyan-600/10 cursor-pointer active:scale-95 hover:shadow-cyan-600/20"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Reviews Content Area: Carousel */}
      {reviews.length > 0 ? (
        <div className="relative w-full max-w-3xl mx-auto px-10 md:px-16 py-4">
          
          {/* Active Review Card */}
          <div className="glassmorphism p-6 md:p-10 rounded-3xl border border-slate-200/50 bg-white/70 shadow-lg relative flex flex-col md:flex-row items-center md:items-start gap-6 transition-all duration-500 animate-fade-in">
            
            {/* User profile image or badge */}
            <div className="flex-shrink-0">
              <img
                src={reviews[currentIndex].avatar_url || getRandomAvatar(reviews[currentIndex].id || reviews[currentIndex].name)}
                alt={reviews[currentIndex].name}
                className="w-16 h-16 rounded-full object-cover border-2 border-cyan-500 shadow-md"
              />
            </div>

            {/* Review content details */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                    {reviews[currentIndex].name}
                  </h4>
                  <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">
                    {new Date(reviews[currentIndex].created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                
                {/* Rating stars */}
                <div className="flex justify-center md:justify-end">
                  {renderStars(reviews[currentIndex].rating, 15)}
                </div>
              </div>

              {/* Feedback comment text */}
              <p className="text-xs md:text-sm leading-relaxed text-slate-655 font-medium italic relative">
                “ {reviews[currentIndex].comment} ”
              </p>
            </div>
          </div>

          {/* Carousel Buttons: Left & Right */}
          <button
            onClick={handlePrev}
            aria-label="Previous Review"
            className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-800 p-2.5 shadow-md transition-all active:scale-95 cursor-pointer hover:border-cyan-400 hover:text-cyan-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNext}
            aria-label="Next Review"
            className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-800 p-2.5 shadow-md transition-all active:scale-95 cursor-pointer hover:border-cyan-400 hover:text-cyan-600"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-1.5 mt-5">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? "w-6 bg-cyan-600" : "w-2 bg-slate-350"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>
      ) : (
        <div className="glassmorphism p-10 text-center rounded-2xl border border-slate-200/50 bg-white/60 max-w-md mx-auto">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">No reviews posted yet. Be the first to write one!</p>
        </div>
      )}

      {/* Write a Review Modal */}
      <Dialog open={modalOpen} onOpenChange={(open) => (!open ? setModalOpen(false) : null)}>
        <DialogContent className="max-w-md bg-[#F7F4EB] text-slate-800 border border-slate-200 shadow-2xl rounded-2xl overflow-hidden">
          
          {/* Modal Header */}
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-black tracking-wider uppercase flex items-center gap-1.5 mt-2">
              <MessageSquare className="w-5 h-5 text-cyan-600" /> Share Your Experience
            </DialogTitle>
            <DialogDescription className="text-slate-650 font-semibold text-xs text-left">
              Let other innovators know what you think of the REES52 learning platform.
            </DialogDescription>
          </DialogHeader>

          {submitSuccess ? (
            <div className="py-8 text-center text-emerald-800 space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600 font-extrabold text-xl animate-bounce">✓</div>
              <h4 className="text-xs font-black uppercase tracking-widest">Feedback Saved!</h4>
              <p className="text-[10px] text-slate-505 font-medium">Thank you for helping us upgrade the community experience.</p>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4 mt-2">
              
              {/* Name Field */}
              <div className="space-y-1">
                <label htmlFor="rev-name" className="text-[9px] font-black uppercase tracking-widest text-slate-600 block">
                  Your Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="rev-name"
                    type="text"
                    placeholder="e.g. John Doe"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 focus:bg-white rounded-xl text-xs font-bold uppercase tracking-wider text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Star Picker */}
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-605 block">
                  Rating (Click to Select)
                </span>
                <div className="flex items-center gap-2 bg-white border border-slate-200 p-2.5 rounded-xl justify-center shadow-sm">
                  {renderStars(rating, 24, setRating, setHoverRating)}
                  <span className="text-xs font-black text-amber-500 uppercase tracking-widest min-w-[30px] text-center">
                    {hoverRating || rating} / 5
                  </span>
                </div>
              </div>

              {/* Comment Field */}
              <div className="space-y-1">
                <label htmlFor="rev-comment" className="text-[9px] font-black uppercase tracking-widest text-slate-600 block">
                  Feedback Comment
                </label>
                <textarea
                  id="rev-comment"
                  rows={4}
                  placeholder="Describe your learning experience, what you built, or kit quality..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white border border-slate-200 focus:bg-white rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition-all resize-none leading-relaxed shadow-sm"
                />
              </div>

              {/* Error Alert */}
              {submitError && (
                <p className="text-[10px] font-bold uppercase text-rose-600 text-center bg-rose-50 border border-rose-200 p-2 rounded-xl">
                  ⚠️ {submitError}
                </p>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-cyan-600/10 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Publishing...</span>
                  </>
                ) : (
                  <span>Publish Review</span>
                )}
              </button>
            </form>
          )}

        </DialogContent>
      </Dialog>

    </section>
  );
}
