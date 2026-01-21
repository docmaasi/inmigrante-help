import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowRight } from 'lucide-react';
import ShareQRCode from '../components/shared/ShareQRCode';
import { useAuth } from '@/lib/auth-context';
import OnboardingFlow from '../components/onboarding/OnboardingFlow';

const QUOTES = [
  // Care for People With Disabilities
  "Care is access, dignity, and inclusion.",
  "Disability care begins with understanding.",
  "Support empowers independence.",
  "Care removes barriers, not identity.",
  "Everyone deserves coordinated care.",
  // Senior Care
  "Those who cared for us deserve our care.",
  "Aging with dignity starts with family.",
  "Senior care is respect in motion.",
  "Family care honors a lifetime of love.",
  "Growing older should never mean growing alone."
];

const IMAGES = [
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696548f62d7edb19ae83cd93/db06d98f4_654e6a5e-e575-4f8b-a8e9-a8d441185904.png",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696548f62d7edb19ae83cd93/4e042656e_313d9baf-471a-43e7-8371-56f25bd5fdbd.png",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696548f62d7edb19ae83cd93/1855c12bc_f4960c89-97ef-42ab-a7bc-b732c18eca74.png",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696548f62d7edb19ae83cd93/0fb6a7d10_eaaba8a0-75b0-4645-bc71-fe4bb9457ac8.png",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696548f62d7edb19ae83cd93/f31f440e3_38059b21-9019-49c9-a815-4248f853af8f.png",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696548f62d7edb19ae83cd93/ea2eeb23c_1503eda1-d290-4f17-9e36-03a0cac224a6.png"
];

export default function Dashboard() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [shuffledImages, setShuffledImages] = useState([]);
  const { user, profile } = useAuth();

  useEffect(() => {
    // Shuffle images on mount
    const shuffled = [...IMAGES].sort(() => Math.random() - 0.5);
    setShuffledImages(shuffled);
    setCurrentQuoteIndex(Math.floor(Math.random() * QUOTES.length));
  }, []);

  useEffect(() => {
    if (shuffledImages.length === 0) return;

    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % shuffledImages.length);
      setCurrentQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [shuffledImages]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696548f62d7edb19ae83cd93/f2943789d_Screenshot_20260110_164756_ChatGPT.jpg"
                alt="FamilyCare.Help Logo"
                className="w-10 h-10 object-contain flex-shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-lg md:text-xl font-bold text-slate-800 truncate">FamilyCare<span className="text-orange-500">.Help</span></h1>
                <p className="text-xs text-slate-500 hidden sm:block">Coordinating care together</p>
              </div>
            </div>
            <Link
              to={createPageUrl('Today')}
              className="flex items-center gap-2 px-4 md:px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium text-sm md:text-base flex-shrink-0"
            >
              <span className="hidden sm:inline">Enter App</span>
              <span className="sm:hidden">Enter</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 md:px-8 py-16">
        {user && <OnboardingFlow user={{ ...user, ...profile }} />}
        {/* Hero Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-4 leading-tight">
                Care Coordinated.
                <span className="block text-teal-600">
                  Families Connected.
                </span>
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed">
                Bring clarity, coordination, and peace of mind to family caregiving. Manage medications, appointments, tasks, and communication all in one place.
              </p>
            </div>

            <div className="space-y-3 flex flex-col">
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6 text-red-500 flex-shrink-0" fill="currentColor" />
                <span className="text-slate-700">Centralized care management</span>
              </div>
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6 text-red-500 flex-shrink-0" fill="currentColor" />
                <span className="text-slate-700">Real-time team communication</span>
              </div>
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6 text-red-500 flex-shrink-0" fill="currentColor" />
                <span className="text-slate-700">Secure health records & documents</span>
              </div>
            </div>

            <Link
              to={createPageUrl('Today')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-semibold text-lg w-fit"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          {/* Promotional Video */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="rounded-2xl overflow-hidden shadow-2xl aspect-video"
          >
            <iframe
              src="https://www.veed.io/embed/9e64fd3d-7b6a-4b5d-9467-0c050a22480a?watermark=0&color=default&sharing=1&title=1"
              width="100%"
              height="100%"
              frameBorder="0"
              title="Simplifying Senior and Disability Care Management, www.FamilyCare.Help"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </motion.div>
        </div>

        {/* Quote Section */}
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-12 text-center mb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuoteIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-2xl md:text-3xl font-semibold leading-relaxed text-teal-900">
                "{QUOTES[currentQuoteIndex]}"
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Rotating Image Carousel */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-slate-900 text-center">
            Family Care in Action
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <AnimatePresence mode="wait">
              {shuffledImages.map((img, idx) => (
                <motion.div
                  key={`${idx}-${img}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{
                    opacity: idx === currentImageIndex ? 1 : 0.5,
                    scale: idx === currentImageIndex ? 1 : 0.95
                  }}
                  transition={{ duration: 0.4 }}
                  className={`rounded-xl overflow-hidden shadow-md cursor-pointer transition-all ${
                    idx === currentImageIndex ? 'ring-2 ring-teal-500' : ''
                  }`}
                >
                  <img
                    src={img}
                    alt={`Care moment ${idx + 1}`}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {shuffledImages.map((_, idx) => (
              <motion.div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === currentImageIndex ? 'bg-teal-600 w-8' : 'bg-slate-300 w-2'
                }`}
                animate={{ width: idx === currentImageIndex ? 32 : 8 }}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer CTA */}
      <footer className="relative bg-slate-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex justify-center mb-8">
            <ShareQRCode />
          </div>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-bold mb-2">Ready to Transform Care?</h4>
              <p className="text-slate-300">Join families and care teams who are simplifying caregiving coordination.</p>
            </div>
            <div className="flex items-center justify-start md:justify-end">
              <Link
                to={createPageUrl('Today')}
                className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold inline-flex items-center gap-2"
              >
                Start Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8 text-center text-slate-400 text-sm">
            <p>FamilyCare.Help — Giving caregivers clarity, accountability, and peace of mind</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
