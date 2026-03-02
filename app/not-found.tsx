'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface MousePosition {
  x: number;
  y: number;
}

const NotFound: React.FC = () => {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [countdown, setCountdown] = useState<number>(15);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => router.push('/'), 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);


  const handleGoBack = (): void => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-linear-to-t from-orange-300 to-blue-300 flex items-center justify-center relative overflow-hidden">
      {/* Floating circles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border-2 border-gray-200 opacity-30"
            style={{
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`,
              left: `${20 + i * 10}%`,
              top: `${10 + i * 8}%`,
              animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      {/* Mouse follower effect */}
      <div
        className="fixed w-4 h-4 rounded-full border border-black pointer-events-none transition-all duration-200 ease-out"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          transform: 'translate(-50%, -50%)',
          opacity: 0.3,
        }}
      />

      {/* Main content */}
      <div className="relative z-10 text-center px-6">
        {/* Animated 404 */}
        <div className="mb-8">
          <h1
            className="text-6xl md:text-8xl font-bold text-black mb-4 inline-block"
            style={{
              animation: 'bounce 2s ease-in-out infinite',
            }}
          >
            4
            <span
              className="inline-block"
              style={{
                animation: 'spin 3s linear infinite',
              }}
            >
              0
            </span>
            4
          </h1>
        </div>

        {/* Error message with fade in animation */}
        <div
          style={{
            animation: 'fadeInUp 1s ease-out 0.3s both',
          }}
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-black mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-base md:text-lg text-gray-600 mb-8 max-w-md mx-auto">
            The page you're looking for seems to have wandered off into the digital void.
          </p>
        </div>

        {/* Buttons with slide in animation */}
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          style={{
            animation: 'fadeInUp 1s ease-out 0.6s both',
          }}
        >
          <Link href="/">
            <button
              className="px-8 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              Go Home
            </button>
          </Link>
          <button
            onClick={handleGoBack}
            className="px-8 py-3 border-2 border-orange-600 text-orange-600 rounded-lg font-medium hover:bg-orange-600 hover:text-white transition-all duration-300 transform hover:scale-105"
          >
            Go Back
          </button>
        </div>

        {/* Auto redirect countdown */}
        <div
          className="mt-12"
          style={{
            animation: 'fadeIn 1s ease-out 1s both',
          }}
        >
          <p className="text-gray-500 text-sm">
            Redirecting to home in{' '}
            <span className="font-bold text-black text-lg">{countdown}</span>{' '}
            seconds...
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default NotFound;