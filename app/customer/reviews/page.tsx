'use client';
import React from 'react';

export default function ReviewsPage() {
    return (
        <div className="bg-white rounded shadow-sm h-screen flex justify-center items-center">
            <h1 className="text-xl font-bold mb-4">Pending Reviews</h1>
            <p className="text-gray-600">You have no products waiting for review.</p>
        </div>
    );
}
