'use client';

import React from 'react';
import { Star, CheckCircle2, MessageSquareQuote, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const FEATURED_REVIEWS = [
  {
    id: 1,
    name: 'Kofi Mensah',
    location: 'KNUST, Kumasi',
    role: 'Student & Developer',
    rating: 5,
    tag: 'Smartphones',
    comment: 'Got my iPhone 14 Pro Max delivered in less than 3 hours on campus. 100% original battery health and seamless checkout via Paystack!'
  },
  {
    id: 2,
    name: 'Abena Osei',
    location: 'East Legon, Accra',
    role: 'Business Owner',
    rating: 5,
    tag: 'Pay Small Small',
    comment: 'The Pay Small Small installment option is a game changer. I bought a M2 MacBook Air for my design work without choking my cash flow.'
  },
  {
    id: 3,
    name: 'Emmanuel Kwame',
    location: 'Kumasi',
    role: 'IT Specialist',
    rating: 5,
    tag: 'IT Repairs',
    comment: 'Brought in a dead laptop for motherboard diagnostics. Tech team fixed it in 24 hrs. Outstanding professionalism and fair pricing.'
  }
];

export default function TestimonialsSection() {
  return (
    <section className="w-full py-10 bg-slate-900 text-white rounded-3xl p-6 md:p-10 my-8 shadow-xl relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#3d5a80]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative space-y-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-bold uppercase tracking-wider">
              <MessageSquareQuote className="w-4 h-4" />
              Customer Feedback
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight uppercase font-outfit">
              What Our Clients Say About Gadget CITi
            </h2>
            <p className="text-slate-400 text-xs md:text-sm font-medium">
              Over 1,200+ satisfied customers across Ghana trust our electronics, trade-ins, and IT services.
            </p>
          </div>

          <Link
            href="/reviews"
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 w-fit shrink-0 shadow-md hover:scale-102 cursor-pointer"
          >
            View All Reviews & Form
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURED_REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-2xl space-y-4 flex flex-col justify-between hover:border-orange-500/50 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex text-amber-400 gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] uppercase font-bold bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded">
                    {rev.tag}
                  </span>
                </div>
                <p className="text-slate-300 text-xs md:text-sm leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="border-t border-slate-700/60 pt-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-500 text-white font-bold text-xs flex items-center justify-center">
                  {rev.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1">
                    {rev.name}
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </h4>
                  <p className="text-[11px] text-slate-400">{rev.role} • {rev.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
