import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ArrowRight,
  Mail,
  Calendar,
  Users,
  Shield,
  MessageCircle,
  FileText,
  Bell,
  Star,
  Quote,
} from "lucide-react";
import MarketingLayout from "../components/MarketingLayout";

const DASHBOARD_URL =
  import.meta.env.VITE_DASHBOARD_URL || "http://localhost:5174";

const QUOTES = [
  "Care is access, dignity, and inclusion.",
  "Disability care begins with understanding.",
  "Support empowers independence.",
  "Care removes barriers, not identity.",
  "Everyone deserves coordinated care.",
  "Those who cared for us deserve our care.",
  "Aging with dignity starts with family.",
  "Senior care is respect in motion.",
  "Family care honors a lifetime of love.",
  "Growing older should never mean growing alone.",
];

const IMAGES = [
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696548f62d7edb19ae83cd93/db06d98f4_654e6a5e-e575-4f8b-a8e9-a8d441185904.png",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696548f62d7edb19ae83cd93/4e042656e_313d9baf-471a-43e7-8371-56f25bd5fdbd.png",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696548f62d7edb19ae83cd93/1855c12bc_f4960c89-97ef-42ab-a7bc-b732c18eca74.png",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696548f62d7edb19ae83cd93/0fb6a7d10_eaaba8a0-75b0-4645-bc71-fe4bb9457ac8.png",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696548f62d7edb19ae83cd93/f31f440e3_38059b21-9019-49c9-a815-4248f853af8f.png",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696548f62d7edb19ae83cd93/ea2eeb23c_1503eda1-d290-4f17-9e36-03a0cac224a6.png",
];

const FEATURES = [
  {
    icon: Calendar,
    title: "Appointment Tracking",
    description:
      "Never miss important medical visits with shared calendars and reminders.",
  },
  {
    icon: FileText,
    title: "Health Records",
    description:
      "Secure storage for medications, diagnoses, and care documentation.",
  },
  {
    icon: Users,
    title: "Care Team Coordination",
    description:
      "Invite family members and caregivers to collaborate seamlessly.",
  },
  {
    icon: MessageCircle,
    title: "Real-Time Updates",
    description:
      "Keep everyone informed with instant messaging and activity feeds.",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description:
      "Automated alerts for medications, tasks, and upcoming appointments.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "HIPAA-aligned security to protect sensitive health information.",
  },
];

const TESTIMONIALS = [
  {
    quote: "Finally, everything is in one place.",
    text: "FamilyCare.Help took the stress out of managing my mom's care. Appointments, notes, reminders — all organized and shared with the family. I didn't realize how much mental weight I was carrying until this simplified everything.",
    name: "Angela R.",
    role: "Daughter & Caregiver",
  },
  {
    quote: "Perfect for families who live in different cities.",
    text: "My siblings and I live in three different states. FamilyCare.Help keeps us on the same page without constant phone calls or confusion. Everyone knows what's going on, and nothing slips through the cracks anymore.",
    name: "Marcus T.",
    role: "Family Care Coordinator",
  },
  {
    quote: "It brought peace of mind.",
    text: "Caring for my husband while managing work was overwhelming. FamilyCare.Help helped me stay organized and feel confident that I wasn't missing anything important. It truly reduced my stress.",
    name: "Linda S.",
    role: "Spouse & Primary Caregiver",
  },
  {
    quote: "Simple, clear, and actually helpful.",
    text: "I've tried other tools that were too complicated. FamilyCare.Help is easy to use and does exactly what families need — no clutter, no confusion, just support.",
    name: "Daniel P.",
    role: "Care Support Partner",
  },
  {
    quote: "Every family dealing with care needs this.",
    text: "Whether it's aging parents or a loved one with special needs, this platform helps keep everyone aligned. It feels like someone finally designed a tool that understands real family caregiving.",
    name: "Renee W.",
    role: "Family Advocate",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const floatVariants = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export default function Landing() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [shuffledImages, setShuffledImages] = useState([]);

  useEffect(() => {
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
    <MarketingLayout fullWidth>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-[#FAF7F2]">
        {/* Decorative Blobs */}
        <div
          className="blob w-[500px] h-[500px] -top-32 -left-32"
          style={{ background: "rgba(79, 70, 229, 0.15)" }}
        />
        <div
          className="blob w-[400px] h-[400px] top-1/2 -right-20"
          style={{
            background: "rgba(224, 122, 95, 0.12)",
            animationDelay: "-5s",
          }}
        />
        <div
          className="blob w-[300px] h-[300px] bottom-20 left-1/4"
          style={{
            background: "rgba(132, 169, 140, 0.15)",
            animationDelay: "-10s",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Text Content */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <motion.div variants={itemVariants} className="space-y-4">
                <h2
                  className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#1F2937] leading-[1.1] tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Care Coordinated.
                </h2>
                <h2
                  className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight gradient-text"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Families Connected.
                </h2>
              </motion.div>

              <motion.p
                variants={itemVariants}
                className="text-lg md:text-xl text-[#4B5563] leading-relaxed max-w-xl"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Bring clarity, coordination, and peace of mind to family
                caregiving. Manage medications, appointments, tasks, and
                communication all in one place.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                <a
                  href={`${DASHBOARD_URL}/signup`}
                  className="btn-primary text-lg px-8 py-4"
                >
                  Get Started Free <ArrowRight className="w-5 h-5" />
                </a>
                <Link
                  to="/faq"
                  className="btn-secondary text-lg px-8 py-4"
                >
                  Learn More
                </Link>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex items-center gap-6 pt-4"
              >
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#E07A5F] border-2 border-[#FAF7F2] flex items-center justify-center"
                    >
                      <Heart className="w-4 h-4 text-white" fill="white" />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-[#6B7280]">
                  <span className="font-semibold text-[#1F2937]">500+</span>{" "}
                  families already coordinating care
                </p>
              </motion.div>
            </motion.div>

            {/* Right Column - Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 60, rotate: 3 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              className="relative"
            >
              <motion.div
                variants={floatVariants}
                initial="initial"
                animate="animate"
                className="relative z-10"
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696548f62d7edb19ae83cd93/f31f440e3_38059b21-9019-49c9-a815-4248f853af8f.png"
                    alt="Family care"
                    className="w-full h-[500px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1F2937]/20 to-transparent" />
                </div>

                {/* Floating Card Accent */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="absolute -bottom-6 -left-6 card-glass p-4 rounded-2xl shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#84A98C]/20 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-[#84A98C]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#1F2937] text-sm">
                        HIPAA Aligned
                      </p>
                      <p className="text-xs text-[#6B7280]">Secure & Private</p>
                    </div>
                  </div>
                </motion.div>

                {/* Another Floating Card */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="absolute -top-4 -right-4 card-glass p-4 rounded-2xl shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#E07A5F]/20 flex items-center justify-center">
                      <Users className="w-6 h-6 text-[#E07A5F]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#1F2937] text-sm">
                        Care Teams
                      </p>
                      <p className="text-xs text-[#6B7280]">Collaborate easily</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Background Decorative Shape */}
              <div className="absolute -z-10 top-10 right-10 w-full h-full rounded-3xl bg-gradient-to-br from-[#4F46E5]/10 to-[#E07A5F]/10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-white relative">
        <div
          className="blob w-[600px] h-[600px] -bottom-32 -right-32"
          style={{ background: "rgba(132, 169, 140, 0.1)" }}
        />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span
              className="inline-block px-4 py-2 rounded-full bg-[#4F46E5]/10 text-[#4F46E5] font-medium text-sm mb-4"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Everything You Need
            </span>
            <h3
              className="text-4xl md:text-5xl font-bold text-[#1F2937] mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Caregiving Made{" "}
              <span className="underline-accent">Simple</span>
            </h3>
            <p
              className="text-lg text-[#6B7280] max-w-2xl mx-auto"
              style={{ fontFamily: "var(--font-body)" }}
            >
              All the tools your family needs to coordinate care with clarity
              and compassion.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="feature-card group"
              >
                <div
                  className="w-14 h-14 rounded-2xl mb-6 flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{
                    background:
                      index % 3 === 0
                        ? "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)"
                        : index % 3 === 1
                        ? "linear-gradient(135deg, #E07A5F 0%, #F4A261 100%)"
                        : "linear-gradient(135deg, #84A98C 0%, #A3B18A 100%)",
                  }}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h4
                  className="text-xl font-bold text-[#1F2937] mb-3"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {feature.title}
                </h4>
                <p
                  className="text-[#6B7280] leading-relaxed"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section bg-[#FAF7F2] relative overflow-hidden">
        <div
          className="blob w-[500px] h-[500px] -top-32 -right-32"
          style={{ background: "rgba(224, 122, 95, 0.1)" }}
        />
        <div
          className="blob w-[400px] h-[400px] bottom-0 left-0"
          style={{ background: "rgba(79, 70, 229, 0.08)", animationDelay: "-5s" }}
        />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span
              className="inline-block px-4 py-2 rounded-full bg-[#E07A5F]/10 text-[#E07A5F] font-medium text-sm mb-4"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Trusted by Families
            </span>
            <h3
              className="text-4xl md:text-5xl font-bold text-[#1F2937] mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              What Families Are{" "}
              <span className="underline-accent">Saying</span>
            </h3>
            <p
              className="text-lg text-[#6B7280] max-w-2xl mx-auto"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Real stories from caregivers who found clarity and peace of mind
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {TESTIMONIALS.slice(0, 3).map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                variants={itemVariants}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-5 h-5 text-[#F59E0B]"
                      fill="currentColor"
                    />
                  ))}
                </div>

                {/* Quote Icon */}
                <div
                  className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center opacity-20"
                  style={{ backgroundColor: index % 2 === 0 ? "#4F46E5" : "#E07A5F" }}
                >
                  <Quote className="w-5 h-5 text-white" />
                </div>

                {/* Quote Title */}
                <h4
                  className="text-xl font-bold text-[#1F2937] mb-3"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  "{testimonial.quote}"
                </h4>

                {/* Quote Text */}
                <p
                  className="text-[#6B7280] leading-relaxed mb-6"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {testimonial.text}
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{
                      background: index % 3 === 0
                        ? "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)"
                        : index % 3 === 1
                        ? "linear-gradient(135deg, #E07A5F 0%, #F4A261 100%)"
                        : "linear-gradient(135deg, #84A98C 0%, #A3B18A 100%)",
                    }}
                  >
                    {testimonial.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p
                      className="font-semibold text-[#1F2937]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {testimonial.name}
                    </p>
                    <p
                      className="text-sm text-[#6B7280]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Second Row - 2 testimonials centered */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6 mt-6 max-w-4xl mx-auto"
          >
            {TESTIMONIALS.slice(3, 5).map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                variants={itemVariants}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-5 h-5 text-[#F59E0B]"
                      fill="currentColor"
                    />
                  ))}
                </div>

                {/* Quote Icon */}
                <div
                  className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center opacity-20"
                  style={{ backgroundColor: index % 2 === 0 ? "#84A98C" : "#4F46E5" }}
                >
                  <Quote className="w-5 h-5 text-white" />
                </div>

                {/* Quote Title */}
                <h4
                  className="text-xl font-bold text-[#1F2937] mb-3"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  "{testimonial.quote}"
                </h4>

                {/* Quote Text */}
                <p
                  className="text-[#6B7280] leading-relaxed mb-6"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {testimonial.text}
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{
                      background: index % 2 === 0
                        ? "linear-gradient(135deg, #84A98C 0%, #A3B18A 100%)"
                        : "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)",
                    }}
                  >
                    {testimonial.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p
                      className="font-semibold text-[#1F2937]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {testimonial.name}
                    </p>
                    <p
                      className="text-sm text-[#6B7280]"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Testimonial Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 text-center max-w-3xl mx-auto"
          >
            <p
              className="text-xs leading-relaxed"
              style={{ color: "#9CA3AF", fontFamily: "var(--font-body)" }}
            >
              <Link to="/testimonial-disclaimer" className="hover:underline" style={{ color: "#6B7280" }}>
                <strong>Testimonial Disclaimer:</strong>
              </Link>{" "}
              The testimonials shown represent individual experiences and opinions of FamilyCare.Help
              users. These statements do not constitute medical advice, diagnosis, or treatment, and
              FamilyCare.Help does not provide healthcare services. Individual experiences may vary.
              Any names, images, or identifying details have been changed to protect privacy.{" "}
              <Link to="/testimonial-disclaimer" className="hover:underline" style={{ color: "#6B7280" }}>
                Read full disclaimer →
              </Link>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="section relative overflow-hidden">
        {/* Organic Shape Background */}
        <div className="absolute inset-0">
          <svg
            className="absolute w-full h-full"
            viewBox="0 0 1440 400"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M0,100 C320,200 420,0 720,100 C1020,200 1120,0 1440,100 L1440,400 L0,400 Z"
              fill="url(#gradient-organic)"
            />
            <defs>
              <linearGradient
                id="gradient-organic"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="100%" stopColor="#E07A5F" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Heart className="w-12 h-12 text-white/80 mx-auto" fill="currentColor" />
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuoteIndex}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <p
                className="text-2xl md:text-4xl lg:text-5xl font-semibold text-white leading-relaxed"
                style={{ fontFamily: "var(--font-display)" }}
              >
                &ldquo;{QUOTES[currentQuoteIndex]}&rdquo;
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Quote Navigation Dots */}
          <div className="flex justify-center gap-2 mt-10">
            {QUOTES.map((_, idx) => (
              <motion.button
                key={idx}
                onClick={() => setCurrentQuoteIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentQuoteIndex
                    ? "bg-white w-8"
                    : "bg-white/40 w-2 hover:bg-white/60"
                }`}
                animate={{ width: idx === currentQuoteIndex ? 32 : 8 }}
                aria-label={`View quote ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Image Gallery Section */}
      <section className="section bg-[#FAF7F2] relative">
        <div
          className="blob w-[400px] h-[400px] top-0 left-1/4"
          style={{ background: "rgba(79, 70, 229, 0.08)" }}
        />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h3
              className="text-4xl md:text-5xl font-bold text-[#1F2937] mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Family Care in{" "}
              <span className="gradient-text">Action</span>
            </h3>
            <p
              className="text-lg text-[#6B7280]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Real moments of connection and coordinated care
            </p>
          </motion.div>

          {/* Masonry-style Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {shuffledImages.map((img, idx) => {
              const isLarge = idx === 0 || idx === 3;
              const isMedium = idx === 2 || idx === 5;

              return (
                <motion.div
                  key={`${idx}-${img}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className={`relative rounded-2xl overflow-hidden shadow-lg cursor-pointer group ${
                    isLarge
                      ? "md:row-span-2 h-64 md:h-auto"
                      : isMedium
                      ? "h-48 md:h-64"
                      : "h-48"
                  } ${idx === currentImageIndex ? "ring-4 ring-[#4F46E5] ring-offset-4 ring-offset-[#FAF7F2]" : ""}`}
                >
                  <img
                    src={img}
                    alt={`Care moment ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1F2937]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              );
            })}
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center gap-2 mt-10">
            {shuffledImages.map((_, idx) => (
              <motion.button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentImageIndex
                    ? "bg-[#4F46E5] w-8"
                    : "bg-[#D1D5DB] w-2 hover:bg-[#9CA3AF]"
                }`}
                animate={{ width: idx === currentImageIndex ? 32 : 8 }}
                aria-label={`View image ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-white relative overflow-hidden">
        <div
          className="blob w-[500px] h-[500px] -bottom-20 -left-20"
          style={{ background: "rgba(224, 122, 95, 0.1)" }}
        />
        <div
          className="blob w-[400px] h-[400px] -top-20 -right-20"
          style={{ background: "rgba(79, 70, 229, 0.08)", animationDelay: "-7s" }}
        />

        <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="card-glass p-12 md:p-16 rounded-3xl"
          >
            <h3
              className="text-3xl md:text-5xl font-bold text-[#1F2937] mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ready to Transform{" "}
              <span className="gradient-text">Family Care?</span>
            </h3>
            <p
              className="text-lg text-[#6B7280] mb-8 max-w-2xl mx-auto"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Join families and care teams who are simplifying caregiving
              coordination. Start your journey to peace of mind today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={`${DASHBOARD_URL}/signup`} className="btn-warm text-lg px-8 py-4">
                Start Free Today <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="mailto:familycarehelp@mail.com"
                className="btn-secondary text-lg px-8 py-4"
              >
                <Mail className="w-5 h-5" /> Contact Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </MarketingLayout>
  );
}
