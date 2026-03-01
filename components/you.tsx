'use client';
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Calendar, Mail, MapPin, Award, Save, X, Edit2, User } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from './Auth_Context';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';


const ProfileSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name is too short')
    .max(50, 'Name is too long')
    .required('Name is required'),
  role: Yup.string().required('Role is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  location: Yup.string()
    .min(2, 'Location is too short')
    .required('Location is required'),
  startDate: Yup.date()
    .max(new Date(), 'Start date cannot be in the future')
    .required('Start date is required'),
  about: Yup.string()
    .min(10, 'About section should be at least 10 characters')
    .max(500, 'About section is too long')
});

export default function RecycoProfile() {
  const [profile, setProfile] = useState({
    name: 'Sarah Chen',
    role: 'Buyer/Seller',
    email: 'sarah.chen@recyco.app',
    location: 'San Francisco, CA',
    startDate: '2024-03-15',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    coverImage: '',
    about: 'Passionate about creating a sustainable future through recycling and environmental awareness. Active member of the Recyco community, committed to reducing waste and inspiring others to make eco-friendly choices.'
  });

  const [editMode, setEditMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { user, setUser } = useAuth();
  const formik = useFormik({
    initialValues: {
      name: profile.name,
      role: profile.role,
      email: profile.email,
      location: profile.location,
      startDate: profile.startDate,
      about: profile.about,
      avatar: profile.avatar,
      coverImage: profile.coverImage
    },
    validationSchema: ProfileSchema,
    onSubmit: (values) => {
      setProfile(values);
      setEditMode(false);
      console.log('Profile updated:', values);
    },
    enableReinitialize: true
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const calculateDaysActive = (startDate: string) => {
    const start = new Date(startDate);
    const today = new Date();
    const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const handleEdit = () => {
    formik.setValues(profile);
    setEditMode(true);
  };

  const handleCancel = () => {
    formik.resetForm();
    setEditMode(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        if (editMode) {
          formik.setFieldValue('avatar', imageData);
        } else {
          setProfile({ ...profile, avatar: imageData });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        if (editMode) {
          formik.setFieldValue('coverImage', imageData);
        } else {
          setProfile({ ...profile, coverImage: imageData });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const currentData = editMode ? formik.values : profile;

  return (
    <div className="min-h-screen bg-gray-300 p-4 md:p-8">
      <motion.button
        whileHover={{ x: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.replace('/')}
        className="absolute top-4 md:top-8 left-4 md:left-8 flex
         items-center gap-2 text-orange-500 hover:text-orange-600 font-bold transition-all cursor-pointer
           py-2 rounded-full shadow-lg py-2 px-4"
      >
        <ArrowLeft size={18} />
        <span>Back</span>
      </motion.button>
      <div className="max-w-5xl mx-auto">
        <form onSubmit={formik.handleSubmit}>
          {/* Main Profile Card */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6 border border-gray-200">
            {/* Cover Image */}
            <div className="h-48 bg-linear-to-r from-emerald-500 to-teal-600 relative group">
              {currentData.coverImage ? (
                <img
                  src={currentData.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : null}
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="absolute top-4 right-4 bg-white text-gray-700 px-3 py-2 rounded-md shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium border border-gray-300"
              >
                <Camera size={16} />
                Edit cover photo
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />
            </div>

            {/* Profile Content */}
            <div className="px-6 pb-6">
              {/* Avatar and Edit Button Row */}
              <div className="flex items-end justify-between -mt-16 mb-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-sm bg-white overflow-hidden">
                    <img
                      src={currentData.avatar}
                      alt={currentData.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-white text-gray-700 p-2 rounded-full shadow-sm hover:bg-gray-50 transition-colors border border-gray-300"
                  >
                    <Camera size={16} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {editMode ? (
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-md text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                    >
                      Save changes
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="mb-2 px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Edit2 size={16} />
                    Edit profile
                  </button>
                )}
              </div>

              {/* Name and Role */}
              <div className="mb-4">
                {editMode ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`text-2xl font-semibold text-gray-900 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-full ${formik.touched.name && formik.errors.name ? 'border-red-500' : 'border-gray-300'
                          }`}
                      />
                      {formik.touched.name && formik.errors.name && (
                        <p className="text-red-500 text-sm mt-1">{formik.errors.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select
                        name="role"
                        value={formik.values.role}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-full max-w-xs text-gray-900 ${formik.touched.role && formik.errors.role ? 'border-red-500' : 'border-gray-300'
                          }`}
                      >
                        <option value="Buyer/Seller">Buyer/Seller</option>
                        <option value="Pickup Driver">Pickup Driver</option>
                      </select>
                      {formik.touched.role && formik.errors.role && (
                        <p className="text-red-500 text-sm mt-1">{formik.errors.role}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-semibold text-gray-900">{user?.fullName}</h1>
                    <p className="text-gray-600 mt-1">{user?.role}</p>
                  </>
                )}
              </div>

              {/* Contact Information */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1.5">
                  <Mail size={16} className="text-gray-400" />
                  {editMode ? (
                    <div>
                      <input
                        type="email"
                        name="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`border-b focus:border-emerald-500 outline-none bg-transparent ${formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                      />
                      {formik.touched.email && formik.errors.email && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
                      )}
                    </div>
                  ) : (
                    <span>{user?.email}</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-gray-400" />
                  {editMode ? (
                    <div>
                      <input
                        type="text"
                        name="location"
                        value={formik.values.location}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`border-b focus:border-emerald-500 outline-none bg-transparent ${formik.touched.location && formik.errors.location ? 'border-red-500' : 'border-gray-300'
                          }`}
                      />
                      {formik.touched.location && formik.errors.location && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.location}</p>
                      )}
                    </div>
                  ) : (
                    <span>{user?.location || 'Ghana'}</span>
                  )}
                </div>
              </div>

              {/* Member Since */}
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md text-sm border border-gray-200">
                <Calendar size={16} className="text-gray-500" />
                <span className="text-gray-600">Member since</span>
                {editMode ? (
                  <div>
                    <input
                      type="date"
                      name="startDate"
                      value={formik.values.startDate}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`font-medium text-gray-900 border-b focus:border-emerald-500 outline-none bg-transparent ${formik.touched.startDate && formik.errors.startDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {formik.touched.startDate && formik.errors.startDate && (
                      <p className="text-red-500 text-xs mt-1">{formik.errors.startDate}</p>
                    )}
                  </div>
                ) : (
                  <span className="font-medium text-gray-900">{formatDate(currentData.startDate)}</span>
                )}
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
            {editMode ? (
              <div>
                <textarea
                  name="about"
                  value={formik.values.about}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full text-gray-700 leading-relaxed border focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent rounded-md p-3 min-h-[120px] ${formik.touched.about && formik.errors.about ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Tell us about yourself..."
                />
                {formik.touched.about && formik.errors.about && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.about}</p>
                )}
              </div>
            ) : (
              <p className="text-gray-700 leading-relaxed">
                {user?.about || 'No about information provided.'}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}