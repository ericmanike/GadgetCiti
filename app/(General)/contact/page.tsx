'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, MessageSquare, Clock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone: string) => {
    const re = /^[0-9+\s()-]{10,}$/;
    return re.test(phone);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      phone: '',
      message: ''
    };

    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
      isValid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
      isValid = false;
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitted(true);
      setIsSubmitting(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });

      setTimeout(() => setIsSubmitted(false), 6000);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Premium Hero Banner */}
      <div className="relative bg-blue-600 text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/30 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 text-center space-y-4 z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-200 text-xs sm:text-sm font-bold uppercase tracking-wider">
            <MessageSquare size={16} />
            <span>24/7 Customer Support</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white font-outfit">
            How Can We Help You Today?
          </h1>
          <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Have questions about a device, order status, financing, or IT repairs? Reach out to our team and we'll get back to you promptly.
          </p>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Direct Contact Info & Office Details */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Phone & Instant Support Card */}
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Call or WhatsApp Us</h3>
                  <p className="text-xs text-slate-500">Fastest response for urgent orders</p>
                </div>
              </div>
              <p className="text-xl font-extrabold text-slate-900 tracking-tight mb-4">
                054 344 2518
              </p>
              <div className="flex gap-3">
                <a
                  href="tel:0543442518"
                  className="flex-1 text-center py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-500/20 active:scale-95"
                >
                  Direct Call
                </a>
                <a
                  href="https://wa.me/233543442518"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 active:scale-95"
                >
                  WhatsApp Chat
                </a>
              </div>
            </div>

            {/* Email Support Card */}
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Email Support</h3>
                  <p className="text-xs text-slate-500">Inquiries, quotes & partnerships</p>
                </div>
              </div>
              <a href="mailto:support@gadgetciti.com" className="text-base font-bold text-blue-600 hover:underline">
                support@gadgetciti.com
              </a>
            </div>

            {/* Store Location & Hours */}
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 hover:shadow-2xl transition-all duration-300 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Physical Store Location</h3>
                  <p className="text-sm font-medium text-slate-700 mt-1">KNUST Campus, Kumasi, Ghana</p>
                  <p className="text-xs text-slate-500 mt-0.5">Visit us for in-store pickup, inspection, or repairs.</p>
                </div>
              </div>

              <hr className="border-slate-100" />

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Working Hours</h3>
                  <p className="text-sm font-semibold text-slate-800 mt-1">Monday – Saturday: 8:00 AM – 8:00 PM</p>
                  <p className="text-xs text-slate-500">Sunday: Closed (Online orders active)</p>
                </div>
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-3">
              <h4 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                Need Quick Help?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Check our Frequently Asked Questions or explore our Pay Small Small layaway financing guide.
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <Link href="/faq" className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors">
                  <span>Browse FAQ's</span>
                  <ArrowRight size={14} className="text-orange-400" />
                </Link>
                <Link href="/customer/pay-small-small" className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors">
                  <span>Pay Small Small Guide</span>
                  <ArrowRight size={14} className="text-orange-400" />
                </Link>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Message Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl shadow-xl p-6 sm:p-10 border border-slate-100">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
              Send Us a Direct Message
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Fill out the form below and our team will get back to you within a few hours.
            </p>

            {isSubmitted && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in">
                <CheckCircle className="w-6 h-6 text-blue-600 shrink-0" />
                <div>
                  <p className="font-bold text-blue-900 text-sm">Message Sent Successfully!</p>
                  <p className="text-xs text-blue-700">Thank you for reaching out. We will respond shortly.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm ${
                    errors.name
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-slate-200 focus:ring-orange-500/20 focus:border-orange-500'
                  }`}
                  placeholder="e.g. Kwame Mensah"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 font-semibold">{errors.name}</p>
                )}
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm ${
                      errors.email
                        ? 'border-red-500 focus:ring-red-200'
                        : 'border-slate-200 focus:ring-orange-500/20 focus:border-orange-500'
                    }`}
                    placeholder="kwame@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm ${
                      errors.phone
                        ? 'border-red-500 focus:ring-red-200'
                        : 'border-slate-200 focus:ring-orange-500/20 focus:border-orange-500'
                    }`}
                    placeholder="054 344 2518"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1 font-semibold">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Subject Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Inquiry Topic
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm text-slate-800"
                >
                  <option value="">Select a topic</option>
                  <option value="buy">Purchase Inquiry / Product Stock</option>
                  <option value="sell">Trade-In & Sell Your Device</option>
                  <option value="financing">Pay Small Small Installment</option>
                  <option value="repair">IT Repair & Hardware Service</option>
                  <option value="support">Existing Order Support</option>
                  <option value="other">General Inquiry</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm resize-none ${
                    errors.message
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-slate-200 focus:ring-orange-500/20 focus:border-orange-500'
                  }`}
                  placeholder="Describe your inquiry or request..."
                />
                {errors.message && (
                  <p className="text-red-500 text-xs mt-1 font-semibold">{errors.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#FF6900] hover:bg-orange-600 text-white py-3.5 px-6 rounded-xl font-extrabold uppercase tracking-wider text-sm transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed active:scale-[0.99] cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="size-5" />
                    Sending Message...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}