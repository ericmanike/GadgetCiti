'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquareQuote, CheckCircle2, ThumbsUp, Filter, Send, ShieldCheck, User, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface Review {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  category: 'Smartphones' | 'Laptops' | 'Pay Small Small' | 'Trade-In' | 'IT Repairs';
  verified: boolean;
  comment: string;
  likes: number;
}

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    author: 'Kofi Mensah',
    location: 'Kumasi, KNUST',
    rating: 5,
    date: 'August 3, 2026',
    category: 'Smartphones',
    verified: true,
    comment: 'Bought an iPhone 14 Pro Max from Gadget CITi. Fast delivery right to campus, pristine condition, and original battery health. Paystack checkout was super smooth too!',
    likes: 18
  },
  {
    id: 'rev-2',
    author: 'Abena Osei',
    location: 'Accra, East Legon',
    rating: 5,
    date: 'July 28, 2026',
    category: 'Pay Small Small',
    verified: true,
    comment: 'The Pay Small Small installment option saved me! I got a M2 MacBook Air and set up weekly MoMo payments. Transparent terms with zero stress.',
    likes: 24
  },
  {
    id: 'rev-3',
    author: 'Emmanuel Kwame',
    location: 'Kumasi, Ayigya',
    rating: 5,
    date: 'July 20, 2026',
    category: 'IT Repairs',
    verified: true,
    comment: 'My Dell XPS laptop display died unexpectedly. Brought it into Gadget CITi hub and their tech team replaced the screen in less than 24 hours. Top tier service!',
    likes: 12
  },
  {
    id: 'rev-4',
    author: 'Sandra Appiah',
    location: 'Takoradi',
    rating: 5,
    date: 'July 15, 2026',
    category: 'Trade-In',
    verified: true,
    comment: 'Traded in my old iPhone 11 for an upgrade to iPhone 13. Fair valuation quote online and instant payment sent right to my MoMo wallet once they verified the device.',
    likes: 15
  },
  {
    id: 'rev-5',
    author: 'Dennis Baah',
    location: 'Sunyani',
    rating: 4,
    date: 'July 10, 2026',
    category: 'Laptops',
    verified: true,
    comment: 'Ordered HP Victus gaming laptop. Arrived safely packaged in 2 days with brand new accessories and full 1-year warranty card.',
    likes: 9
  }
];

const CATEGORIES = ['All', 'Smartphones', 'Laptops', 'Pay Small Small', 'Trade-In', 'IT Repairs'] as const;

export default function CustomerFeedbackPage() {
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  // Feedback form state
  const [newAuthor, setNewAuthor] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newCategory, setNewCategory] = useState<Review['category']>('Smartphones');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState(false);

  const filteredReviews = reviews.filter(
    (rev) => activeCategory === 'All' || rev.category === activeCategory
  );

  const handleLike = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, likes: r.likes + 1 } : r))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) return;

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      author: newAuthor.trim(),
      location: newLocation.trim() || 'Ghana',
      rating: newRating,
      date: 'Just now',
      category: newCategory,
      verified: true,
      comment: newComment.trim(),
      likes: 0
    };

    setReviews([newReview, ...reviews]);
    setNewAuthor('');
    setNewLocation('');
    setNewComment('');
    setSubmittedMessage(true);
    setTimeout(() => setSubmittedMessage(false), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 pt-28 pb-20 mt-20 md:mt-12">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 text-orange-600 rounded-full text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Customer Experience
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight font-outfit">
            Customer Feedback & Reviews
          </h1>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed font-medium">
            See what tech enthusiasts, students, and professionals across Ghana have to say about Gadget CITi products, trade-in valuations, and IT services.
          </p>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
          <div className="space-y-1 border-r border-slate-100 last:border-0">
            <p className="text-2xl md:text-3xl font-black text-slate-900">4.9 / 5.0</p>
            <div className="flex justify-center text-amber-400 gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-500 font-medium">Average Rating</p>
          </div>

          <div className="space-y-1 border-r border-slate-100 last:border-0">
            <p className="text-2xl md:text-3xl font-black text-slate-900">1,200+</p>
            <p className="text-xs text-slate-500 font-medium">Satisfied Clients</p>
          </div>

          <div className="space-y-1 border-r border-slate-100 last:border-0">
            <p className="text-2xl md:text-3xl font-black text-slate-900">99.4%</p>
            <p className="text-xs text-slate-500 font-medium">On-Time Delivery</p>
          </div>

          <div className="space-y-1">
            <p className="text-2xl md:text-3xl font-black text-slate-900">100%</p>
            <p className="text-xs text-slate-500 font-medium">Authentic Products</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-xs md:text-sm font-bold rounded-full transition-all cursor-pointer border ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white border-transparent shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredReviews.map((rev) => (
              <motion.div
                key={rev.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-sm">
                        {rev.author.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm md:text-base flex items-center gap-1.5">
                          {rev.author}
                          {rev.verified && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          )}
                        </h4>
                        <p className="text-xs text-slate-400 font-medium">{rev.location} • {rev.date}</p>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                      {rev.category}
                    </span>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex text-amber-400 gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rev.rating
                            ? 'fill-amber-400 stroke-amber-400'
                            : 'text-slate-200 fill-slate-200'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-slate-600 text-sm leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs font-semibold text-slate-500">
                  <span className="text-emerald-600 flex items-center gap-1 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Customer
                  </span>
                  <button
                    onClick={() => handleLike(rev.id)}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-orange-500 transition-colors cursor-pointer"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Helpful ({rev.likes})</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Leave Feedback Form */}
        <section className="bg-white p-6 md:p-10 rounded-3xl border border-slate-200 shadow-lg space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <MessageSquareQuote className="w-6 h-6 text-orange-500" />
              Share Your Experience With Us
            </h2>
            <p className="text-slate-500 text-sm">
              Have you bought a gadget, traded in a device, or repaired a laptop with Gadget CITi? We'd love your feedback!
            </p>
          </div>

          {submittedMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Thank you! Your feedback has been published successfully.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kwame Bediako"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:border-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Location / Campus</label>
                <input
                  type="text"
                  placeholder="e.g. Kumasi, KNUST"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:border-orange-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Service / Product Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:border-orange-500 outline-none bg-white"
                >
                  <option value="Smartphones">Smartphones & Tablets</option>
                  <option value="Laptops">Laptops & Computers</option>
                  <option value="Pay Small Small">Pay Small Small Financing</option>
                  <option value="Trade-In">Gadget Trade-In / Selling</option>
                  <option value="IT Repairs">IT Services & Repairs</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Rating</label>
                <div className="flex items-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300 fill-slate-100'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-600 ml-2">{newRating} / 5 Stars</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Your Review / Feedback</label>
              <textarea
                required
                rows={4}
                placeholder="Share your detailed feedback about the product quality, delivery speed, or customer service..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm focus:border-orange-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-98"
            >
              <Send className="w-4 h-4" />
              Submit Feedback
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
