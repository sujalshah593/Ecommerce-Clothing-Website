import React, { useState, useEffect } from "react";
import {
  Star,
  ThumbsUp,
  MessageCircle,
  CornerDownRight,
  Send,
  AtSign,
  CheckCircle2,
  Sparkles,
  MessageSquarePlus
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { toast } from "react-toastify";

const ProductReviews = ({ productId, productName }) => {
  const { user } = useAuth();
  const storageKey = `shreeji_reviews_${productId || "default"}`;

  // Start with empty array — ONLY real reviews submitted by users will show
  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");

  // Save reviews to localStorage per product
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(reviews));
    } catch (e) {
      console.error(e);
    }
  }, [reviews, storageKey]);

  // Handle Likes on a review
  const handleLikeReview = (reviewId) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          const liked = !r.liked;
          return {
            ...r,
            liked,
            likes: liked ? r.likes + 1 : r.likes - 1,
          };
        }
        return r;
      })
    );
  };

  // Handle Likes on a reply
  const handleLikeReply = (reviewId, replyId) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          return {
            ...r,
            replies: r.replies.map((rep) => {
              if (rep.id === replyId) {
                const liked = !rep.liked;
                return {
                  ...rep,
                  liked,
                  likes: liked ? rep.likes + 1 : rep.likes - 1,
                };
              }
              return rep;
            }),
          };
        }
        return r;
      })
    );
  };

  // Submit a new review
  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error("Please enter a review comment");
      return;
    }

    const reviewObj = {
      id: Date.now(),
      userName: user ? user.name || "Customer" : "Customer",
      avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user?.name || "Customer")}&backgroundColor=a8c7f0`,
      rating: newRating,
      date: "Just now",
      verified: true,
      comment: newComment.trim(),
      likes: 0,
      liked: false,
      replies: [],
    };

    setReviews([reviewObj, ...reviews]);
    setNewComment("");
    setNewRating(5);
    toast.success("Thank you! Your review has been posted.");
  };

  // Submit a reply
  const handleAddReply = (reviewId, targetUserName) => {
    if (!replyText.trim()) return;

    const newReply = {
      id: Date.now(),
      userName: user ? user.name || "Customer" : "Customer",
      avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user?.name || "Customer")}&backgroundColor=d8c9ff`,
      date: "Just now",
      comment: replyText.trim(),
      likes: 0,
      liked: false,
    };

    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          return {
            ...r,
            replies: [...r.replies, newReply],
          };
        }
        return r;
      })
    );

    setReplyText("");
    setActiveReplyId(null);
    toast.success("Reply posted!");
  };

  // Quick helper to insert mention
  const handleInsertMention = (name) => {
    setReplyText((prev) => (prev ? `${prev} @${name} ` : `@${name} `));
  };

  // Render star ratings
  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= rating
                ? "text-amber-400 fill-amber-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  // Highlight @mentions in text
  const formatCommentText = (text) => {
    const parts = text.split(/(@[A-Za-z0-9_]+(?:\s[A-Za-z0-9_]+)?)/g);
    return parts.map((part, i) => {
      if (part.startsWith("@")) {
        return (
          <span
            key={i}
            className="text-[#382A3A] bg-[#A8C7F0]/30 font-semibold px-1.5 py-0.5 rounded-md inline-block my-0.5"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="mt-16 pt-12 border-t border-[#A8C7F0]/30 font-sans">
      {/* Title & Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A8C7F0] mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Customer Reviews
          </div>
          <h2 className="header text-3xl md:text-4xl uppercase tracking-tight text-[#382A3A]">
            Reviews & Community Discussions
          </h2>
          <p className="text-sm text-[#382A3A]/70 mt-1">
            Real customer feedback, replies, and mentions for this product.
          </p>
        </div>

        {/* Rating Score Badge */}
        {reviews.length > 0 && (
          <div className="flex items-center gap-4 bg-white/80 border border-[#A8C7F0]/40 px-6 py-4 rounded-3xl shadow-xs self-start md:self-auto">
            <div className="text-center">
              <span className="text-3xl font-black text-[#382A3A] leading-none block">
                {avgRating}
              </span>
              <div className="flex items-center gap-1 mt-1">
                {renderStars(Math.round(Number(avgRating)))}
              </div>
              <span className="text-[11px] text-[#382A3A]/60 font-semibold uppercase tracking-wider mt-1 block">
                {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Post a Review Box */}
      <div className="bg-white/90 border border-[#A8C7F0]/40 rounded-3xl p-6 md:p-8 shadow-xs mb-12">
        <h3 className="header text-lg uppercase tracking-wider text-[#382A3A] mb-4">
          Write a Review
        </h3>
        <form onSubmit={handleSubmitReview} className="space-y-4">
          {/* Star selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-bold text-[#382A3A]/70 tracking-wider">
              Your Rating:
            </span>
            <div className="flex items-center gap-1.5 cursor-pointer">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setNewRating(star)}
                  className="hover:scale-125 transition-transform p-0.5"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= newRating
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Text input */}
          <div className="relative">
            <textarea
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your honest review here... You can use @name to mention other shoppers!"
              className="w-full bg-[#FFFAF3] rounded-2xl p-4 text-sm text-[#382A3A] placeholder-[#382A3A]/40 outline-none border border-[#A8C7F0]/40 focus:border-[#A8C7F0] focus:ring-2 focus:ring-[#A8C7F0]/20 transition resize-none"
            ></textarea>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-[11px] text-[#382A3A]/50">
              Tip: Use <strong className="text-[#382A3A]">@name</strong> to tag or reply to anyone.
            </p>
            <button
              type="submit"
              className="bg-[#A8C7F0] hover:bg-[#8FB8EC] text-[#382A3A] font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Post Review
            </button>
          </div>
        </form>
      </div>

      {/* Reviews List with scroll container */}
      {reviews.length === 0 ? (
        <div className="text-center py-16 bg-white/60 rounded-3xl border border-[#A8C7F0]/20 p-8 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-full bg-[#A8C7F0]/20 flex items-center justify-center mx-auto mb-3 text-[#382A3A]">
            <MessageSquarePlus className="w-7 h-7 text-[#382A3A]" />
          </div>
          <h4 className="header text-xl uppercase text-[#382A3A] mb-1">No Reviews Yet</h4>
          <p className="text-xs text-[#382A3A]/70">
            Be the first to review this product and share your thoughts with the community!
          </p>
        </div>
      ) : (
        <div className="max-h-[550px] overflow-y-auto pr-3 space-y-5 reviews-scroll">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white/80 border border-[#A8C7F0]/30 rounded-3xl p-6 md:p-7 shadow-xs space-y-4 transition hover:border-[#A8C7F0]/60"
            >
              {/* Top row: Avatar + Name + Rating */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={r.avatar}
                    alt={r.userName}
                    className="w-10 h-10 rounded-full bg-gray-100 border border-[#A8C7F0]/40 object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#382A3A]">
                        {r.userName}
                      </span>
                      {r.verified && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified Buyer
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5 mt-0.5">
                      {renderStars(r.rating)}
                      <span className="text-[11px] text-[#382A3A]/50 font-medium">
                        • {r.date}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comment Text with @mention highlighting */}
              <p className="text-sm text-[#382A3A]/90 leading-relaxed font-normal">
                {formatCommentText(r.comment)}
              </p>

              {/* Action Bar (Like, Reply, Mentions) */}
              <div className="flex items-center gap-5 pt-1 text-xs text-[#382A3A]/70 font-semibold border-t border-gray-100">
                {/* Like Button */}
                <button
                  onClick={() => handleLikeReview(r.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition cursor-pointer ${
                    r.liked
                      ? "bg-[#A8C7F0]/30 border-[#A8C7F0] text-[#382A3A]"
                      : "border-gray-200 hover:border-[#A8C7F0] hover:bg-[#FFFAF3]"
                  }`}
                >
                  <ThumbsUp
                    className={`w-3.5 h-3.5 ${
                      r.liked ? "fill-[#382A3A] text-[#382A3A]" : ""
                    }`}
                  />
                  <span>{r.likes > 0 ? r.likes : "Helpful"}</span>
                </button>

                {/* Reply Trigger */}
                <button
                  onClick={() => {
                    if (activeReplyId === r.id) {
                      setActiveReplyId(null);
                    } else {
                      setActiveReplyId(r.id);
                      setReplyText(`@${r.userName} `);
                    }
                  }}
                  className="flex items-center gap-1.5 hover:text-[#382A3A] transition cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Reply {r.replies?.length > 0 && `(${r.replies.length})`}</span>
                </button>

                {/* Quick Mention button */}
                <button
                  onClick={() => {
                    setActiveReplyId(r.id);
                    handleInsertMention(r.userName);
                  }}
                  className="flex items-center gap-1 hover:text-[#382A3A] transition cursor-pointer"
                  title="Mention user"
                >
                  <AtSign className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mention</span>
                </button>
              </div>

              {/* Replies Thread */}
              {r.replies?.length > 0 && (
                <div className="space-y-3 pt-2 pl-4 md:pl-8 border-l-2 border-[#D8C9FF]/50 mt-2">
                  {r.replies.map((rep) => (
                    <div
                      key={rep.id}
                      className="bg-[#FFFAF3]/80 rounded-2xl p-4 border border-[#A8C7F0]/25 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={rep.avatar}
                            alt={rep.userName}
                            className="w-7 h-7 rounded-full bg-gray-100 object-cover border border-[#A8C7F0]/30"
                          />
                          <span className="font-bold text-xs text-[#382A3A]">
                            {rep.userName}
                          </span>
                          <span className="text-[10px] text-[#382A3A]/40">
                            {rep.date}
                          </span>
                        </div>

                        {/* Like button for reply */}
                        <button
                          onClick={() => handleLikeReply(r.id, rep.id)}
                          className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border transition ${
                            rep.liked
                              ? "bg-[#A8C7F0]/30 border-[#A8C7F0] text-[#382A3A]"
                              : "border-gray-200 text-[#382A3A]/60 hover:border-[#A8C7F0]"
                          }`}
                        >
                          <ThumbsUp
                            className={`w-3 h-3 ${
                              rep.liked ? "fill-[#382A3A]" : ""
                            }`}
                          />
                          <span>{rep.likes > 0 && rep.likes}</span>
                        </button>
                      </div>

                      <p className="text-xs text-[#382A3A]/90 leading-relaxed pl-9">
                        {formatCommentText(rep.comment)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Input Box (when opened) */}
              {activeReplyId === r.id && (
                <div className="pt-3 pl-4 md:pl-8 mt-2">
                  <div className="flex items-center gap-2 bg-[#FFFAF3] rounded-2xl p-2 border border-[#A8C7F0]/40">
                    <CornerDownRight className="w-4 h-4 text-[#A8C7F0] ml-2 shrink-0" />
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${r.userName}... (Use @ to mention)`}
                      className="flex-1 bg-transparent outline-none text-xs text-[#382A3A] placeholder-[#382A3A]/40 py-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAddReply(r.id, r.userName);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleAddReply(r.id, r.userName)}
                      className="bg-[#A8C7F0] hover:bg-[#8FB8EC] text-[#382A3A] text-xs font-bold px-4 py-1.5 rounded-xl transition cursor-pointer"
                    >
                      Reply
                    </button>
                    <button
                      onClick={() => setActiveReplyId(null)}
                      className="text-xs text-[#382A3A]/50 hover:text-[#382A3A] px-2 py-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
