import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, User, Eye, EyeOff, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';

const MARKETING_URL = import.meta.env.VITE_MARKETING_URL || 'http://localhost:3000';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const { signUp, signInWithOAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      await signUp(email, password, fullName);
      setSignupSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthSignIn = async (provider) => {
    try {
      await signInWithOAuth(provider);
    } catch (err) {
      setError(err.message || `Failed to sign up with ${provider}`);
    }
  };

  // Success state
  if (signupSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
        `}</style>

        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100">
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-teal-50">
              <CheckCircle className="w-10 h-10 text-teal-600" />
            </div>
            <h2
              className="text-2xl font-bold mb-3 text-gray-900"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Check Your Email
            </h2>
            <p
              className="text-gray-600 mb-8"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              We sent a confirmation link to <strong className="text-teal-600">{email}</strong>.
              Please check your inbox and click the link to verify your account.
            </p>
            <Button
              onClick={() => navigate('/login')}
              className="w-full h-12 rounded-xl font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-colors duration-200"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Back to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
      `}</style>

      <div className="max-w-md w-full space-y-8">
        {/* Back to home link */}
        <a
          href={MARKETING_URL}
          className="inline-flex items-center gap-2 text-sm transition-colors duration-200 text-gray-500 hover:text-teal-600"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </a>

        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/696548f62d7edb19ae83cd93/f2943789d_Screenshot_20260110_164756_ChatGPT.jpg"
              alt="FamilyCare.Help Logo"
              className="w-14 h-14 object-contain rounded-lg shadow-sm"
            />
          </div>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            <span className="text-gray-900">FamilyCare</span>
            <span className="text-teal-600">.Help</span>
          </h1>
          <p
            className="mt-3 text-base text-gray-500"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Create your account to start coordinating care
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div
                className="p-4 rounded-xl text-sm bg-red-50 border border-red-200 text-red-600"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="fullName"
                className="text-gray-700 font-medium"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-11 h-12 rounded-xl border border-gray-200 transition-all duration-200 focus:border-teal-500 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-gray-700 font-medium"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 rounded-xl border border-gray-200 transition-all duration-200 focus:border-teal-500 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-gray-700 font-medium"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 h-12 rounded-xl border border-gray-200 transition-all duration-200 focus:border-teal-500 focus:ring-teal-500"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-gray-700 font-medium"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-11 h-12 rounded-xl border border-gray-200 transition-all duration-200 focus:border-teal-500 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            {/* Terms Notice */}
            <p
              className="text-xs text-gray-500 text-center"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              By creating an account, you agree to our{' '}
              <a
                href={`${MARKETING_URL}/terms`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 hover:text-teal-700 underline"
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href={`${MARKETING_URL}/privacy`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 hover:text-teal-700 underline"
              >
                Privacy Policy
              </a>.
            </p>

            {/* HIPAA Notice */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p
                className="text-xs text-amber-800 text-center"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                <strong>Note:</strong> This platform is for care coordination only and is{' '}
                <strong>not HIPAA compliant</strong>. Do not use it to store protected health information.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-colors duration-200"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span
                className="px-4 bg-white text-gray-500"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Or continue with
              </span>
            </div>
          </div>

          {/* OAuth buttons */}
          <div className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuthSignIn('google')}
              className="w-full h-12 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>
          </div>
        </div>

        {/* Sign in link */}
        <p
          className="text-center text-sm text-gray-500"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-teal-600 hover:text-teal-700 transition-colors duration-200"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
