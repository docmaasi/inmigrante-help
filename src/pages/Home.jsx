import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Heart, Users, Calendar, Pill, FileText, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const images = [
  {
    url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696548f62d7edb19ae83cd93/61a393ee7_a21d4e92-c2fb-4504-a459-d0ff00aa21fa.png',
    quote: '"Family is not an important thing. It\'s everything." - Michael J. Fox',
    caption: 'Quality Time Together'
  },
  {
    url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696548f62d7edb19ae83cd93/80dae3232_c85efd42-1342-4c26-8517-f3758879db0f.png',
    quote: '"Caring for others is what makes us human." - Unknown',
    caption: 'Compassionate Care Support'
  },
  {
    url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696548f62d7edb19ae83cd93/25c5ce329_313d9baf-471a-43e7-8371-56f25bd5fdbd.png',
    quote: '"In family life, love is the oil that eases friction, the cement that binds closer together, and the music that brings harmony." - Friedrich Nietzsche',
    caption: 'Multi-Generational Connection'
  }
];

const features = [
  {
    icon: Users,
    title: 'Care Team Coordination',
    description: 'Manage your entire care team in one place with clear roles and responsibilities'
  },
  {
    icon: Pill,
    title: 'Medication Management',
    description: 'Track medications, dosages, refills, and adherence for peace of mind'
  },
  {
    icon: Calendar,
    title: 'Appointment Scheduling',
    description: 'Never miss an appointment with integrated calendars and reminders'
  },
  {
    icon: MessageSquare,
    title: 'Secure Communication',
    description: 'Share updates and messages with your care team instantly'
  },
  {
    icon: FileText,
    title: 'Care Plans & Documents',
    description: 'Create comprehensive care plans and store important medical documents'
  },
  {
    icon: Heart,
    title: 'Emergency Alerts',
    description: 'Send urgent notifications to your entire care team when needed'
  }
];

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay]);

  const handleNextImage = () => {
    setAutoPlay(false);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setAutoPlay(false);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696548f62d7edb19ae83cd93/f2943789d_Screenshot_20260110_164756_ChatGPT.jpg" 
              alt="FamilyCare.Help" 
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-slate-800">FamilyCare<span className="text-orange-500">.Help</span></h1>
              <p className="text-xs text-slate-500">Coordinating care together</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Link to={createPageUrl('Checkout')}>
              <Button className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Image Carousel */}
      <section className="relative pt-24 pb-12 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image Carousel */}
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0"
                >
                  <img
                    src={images[currentImageIndex].url}
                    alt={images[currentImageIndex].caption}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-white text-xl font-semibold mb-2"
                    >
                      {images[currentImageIndex].caption}
                    </motion.p>
                    <motion.blockquote
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-white/90 italic text-sm"
                    >
                      {images[currentImageIndex].quote}
                    </motion.blockquote>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full transition-all"
              >
                ←
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full transition-all"
              >
                →
              </button>

              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setAutoPlay(false);
                      setCurrentImageIndex(idx);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentImageIndex
                        ? 'bg-white w-8'
                        : 'bg-white/50 w-2 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-4 leading-tight">
                  Family Care,
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-500">
                    {' '}Made Simple
                  </span>
                </h2>
                <p className="text-xl text-slate-600 leading-relaxed">
                  Coordinating care for loved ones shouldn't be complicated. FamilyCare.Help brings clarity, accountability, and peace of mind to every member of your care team.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Why choose FamilyCare.Help?</p>
                <ul className="space-y-2">
                  {[
                    'Unified care coordination for the entire team',
                    'Real-time medication and appointment tracking',
                    'Secure communication and emergency alerts',
                    'Comprehensive care plans and documentation'
                  ].map((item, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      className="flex items-center gap-3 text-slate-700"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <Link to={createPageUrl('Checkout')} className="flex-1">
                  <Button className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-lg">
                    Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button variant="outline" className="w-full sm:w-auto h-12 text-lg">
                  Watch Demo
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-bold text-slate-900 mb-4">Powerful Features for Complete Care</h3>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Everything you need to manage, coordinate, and optimize care for your loved ones
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-8 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all group"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h4>
                  <p className="text-slate-600">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-pink-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-4 md:px-8 relative z-10 text-center"
        >
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Care Coordination?
          </h3>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of families already using FamilyCare.Help to provide better care with less stress
          </p>
          <Link to={createPageUrl('Checkout')}>
            <Button className="h-12 px-8 text-lg bg-white text-blue-600 hover:bg-slate-50">
              Start Your Free Trial Today
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition">Facebook</a></li>
                <li><a href="#" className="hover:text-white transition">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Heart className="w-5 h-5 text-orange-500" fill="currentColor" />
              <span className="font-semibold">FamilyCare.Help</span>
            </div>
            <p className="text-sm text-slate-400">
              © 2026 FamilyCare.Help. Giving caregivers clarity, accountability, and peace of mind.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}