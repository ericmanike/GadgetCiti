'use client';
import React, { useState } from 'react';
import { MapPin, MessageSquare, Phone, Star, Package, Clock, TrendingUp, Award, Calendar, ChevronLeft, Navigation } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DriverDetailsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: ''
  });

  const router = useRouter();
  
  const driver = {
    name: "Marcus Johnson",
    status: "active",
    currentLocation: "Oak Street District",
    pickupsCompleted: 247,
    rating: 4.8,
    totalReviews: 156,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    memberSince: "January 2023",
    vehicleType: "Heavy Duty Truck",
    licensePlate: "WP-7834",
    availability: "Mon-Sat, 6:00 AM - 6:00 PM",
    specialties: ["Residential Waste", "Commercial Waste", "Recyclables", "Bulk Items"],
    distance: "10km away",
    responseTime: "15 min avg",
    completionRate: 98
  };

  const reviews = [
    { id: 1, author: "Sarah M.", rating: 5, date: "Nov 18, 2025", comment: "Very professional and efficient. Arrived on time and handled everything carefully." },
    { id: 2, author: "John D.", rating: 5, date: "Nov 15, 2025", comment: "Great service! Marcus is always friendly and thorough. Highly recommend." },
    { id: 3, author: "Emily R.", rating: 4, date: "Nov 12, 2025", comment: "Good service overall. One small delay but communicated well throughout." }
  ];

  const handleSubmitReview = () => {
    if (reviewForm.rating === 0) {
      alert('Please select a rating');
      return;
    }
    if (reviewForm.comment.trim() === '') {
      alert('Please write a comment');
      return;
    }
    console.log('Review submitted:', reviewForm);
    alert('Thank you for your review!');
    setShowReviewModal(false);
    setReviewForm({ rating: 0, comment: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 mt-30">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button className="p-2 hover:bg-green-700 rounded-lg transition-colors cursor-pointer"
            onClick={() => router.back()}
          > 
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold">Pickup drivers</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative w-full md:w-48">
              <img 
                src={driver.image} 
                alt={driver.name}
                className="w-full h-48 md:w-48 md:h-48 rounded-2xl object-cover border-4 border-gray-100 shadow-md"
              />
              <div className="absolute bottom-3 right-3 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                Online
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{driver.name}</h2>
                  <div className="flex items-center gap-2 mt-2 text-gray-600">
                    <MapPin size={16} className="text-green-600" />
                    <span className="text-sm">{driver.currentLocation} • {driver.distance}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-400 fill-yellow-400" size={20} />
                      <span className="font-semibold text-lg">{driver.rating}</span>
                      <span className="text-gray-500 text-sm">({driver.totalReviews} reviews)</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md">
                    <MessageSquare size={20} />
                    Chat
                  </button>
                  <button className="px-6 py-3 border-2 border-green-600 text-green-600 rounded-xl font-medium hover:bg-green-50 transition-colors flex items-center gap-2 shadow-sm">
                    <Phone size={20} />
                    Call
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-green-600 mb-1">
                <Package size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{driver.pickupsCompleted}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-blue-600 mb-1">
                <Clock size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{driver.responseTime}</div>
              <div className="text-sm text-gray-600">Response Time</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-purple-600 mb-1">
                <TrendingUp size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{driver.completionRate}%</div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-orange-600 mb-1">
                <Calendar size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-900">2+ years</div>
              <div className="text-sm text-gray-600">Experience</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${
                activeTab === 'overview' 
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${
                activeTab === 'reviews' 
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Reviews
            </button>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-900">About</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Experienced waste pickup driver with a strong commitment to timely and efficient service. 
                    Known for excellent customer communication and reliable performance. Specializes in both 
                    residential and commercial waste management with a focus on environmental responsibility.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-900">Service Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Clock className="text-green-600 mt-1" size={20} />
                      <div>
                        <div className="font-medium text-gray-900">Availability</div>
                        <div className="text-gray-600">{driver.availability}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Package className="text-green-600 mt-1" size={20} />
                      <div>
                        <div className="font-medium text-gray-900">Vehicle</div>
                        <div className="text-gray-600">{driver.vehicleType} • {driver.licensePlate}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="text-green-600 mt-1" size={20} />
                      <div>
                        <div className="font-medium text-gray-900">Member Since</div>
                        <div className="text-gray-600">{driver.memberSince}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-900">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {driver.specialties.map((specialty, index) => (
                      <span 
                        key={index}
                        className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <button 
                  onClick={() => setShowReviewModal(true)}
                  className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 mb-4"
                >
                  <Star size={20} />
                  Write a Review
                </button>
                
                {reviews.map((review) => (
                  <div key={review.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-gray-900">{review.author}</div>
                        <div className="text-sm text-gray-600">{review.date}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            size={16}
                            className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button className="w-full py-4 bg-green-600 text-white rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors shadow-lg flex items-center justify-center gap-2">
          <Navigation size={20} />
          Request Pickup
        </button>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Write a Review</h2>
                <button 
                  onClick={() => {
                    setShowReviewModal(false);
                    setReviewForm({ rating: 0, comment: '' });
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Driver Info */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                <img 
                  src={driver.image} 
                  alt={driver.name}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-gray-100"
                />
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{driver.name}</h3>
                  <p className="text-sm text-gray-600">{driver.currentLocation}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star 
                        size={40}
                        className={star <= reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                </div>
                {reviewForm.rating > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    {reviewForm.rating === 5 && "Excellent!"}
                    {reviewForm.rating === 4 && "Very Good"}
                    {reviewForm.rating === 3 && "Good"}
                    {reviewForm.rating === 2 && "Fair"}
                    {reviewForm.rating === 1 && "Poor"}
                  </p>
                )}
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Your Review
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Share your experience with this driver..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
                <p className="mt-2 text-sm text-gray-500">
                  {reviewForm.comment.length} characters
                </p>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitReview}
                className="w-full py-4 bg-green-600 text-white rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors shadow-lg"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}