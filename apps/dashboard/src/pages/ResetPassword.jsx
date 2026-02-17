import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

const MARKETING_URL = import.meta.env.VITE_MARKETING_URL || 'http://localhost:3000';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) throw updateError;
      setIsSuccess(true);
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('Authorization') || msg.includes('invalid') || msg.includes('token') || msg.includes('fetch')) {
        setError('Your reset link has expired or is invalid. Please request a new one.');
      } else {
        setError(msg || 'Failed to reset password. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start sm:items-center justify-center px-4 py-6 sm:py-12 bg-slate-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
      `}</style>

      <div className="max-w-md w-full space-y-8">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm transition-colors duration-200 text-gray-500 hover:text-teal-600"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

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
            <span className="text-gray-900">New </span>
            <span className="text-teal-600">Password</span>
          </h1>
          <p
            className="mt-3 text-base text-gray-500"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Choose a new password for your account
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          {isSuccess ? (
            <SuccessView onGoToLogin={() => navigate('/login')} />
          ) : (
            <PasswordForm
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              error={error}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
          )}
        </div>

        <p
          className="text-center text-xs text-gray-400"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <a
            href={`${MARKETING_URL}/privacy`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-teal-600 transition-colors"
          >
            Privacy Policy
          </a>
          {' · '}
          <a
            href={`${MARKETING_URL}/terms`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-teal-600 transition-colors"
          >
            Terms of Service
          </a>
        </p>
      </div>
    </div>
  );
}

function SuccessView({ onGoToLogin }) {
  return (
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <CheckCircle className="w-12 h-12 text-teal-600" />
      </div>
      <h2
        className="text-lg font-semibold text-gray-900"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Password updated!
      </h2>
      <p
        className="text-sm text-gray-500"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Your password has been reset successfully. You can now sign in with your new password.
      </p>
      <Button
        onClick={onGoToLogin}
        className="w-full h-12 rounded-xl font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-colors duration-200 mt-4"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Go to Login
      </Button>
    </div>
  );
}

function PasswordForm({
  password, setPassword,
  confirmPassword, setConfirmPassword,
  showPassword, setShowPassword,
  error, isSubmitting, onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
          htmlFor="password"
          className="text-gray-700 font-medium"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          New Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter new password"
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
          Confirm New Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-11 h-12 rounded-xl border border-gray-200 transition-all duration-200 focus:border-teal-500 focus:ring-teal-500"
            required
            minLength={6}
          />
        </div>
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
            Resetting password...
          </>
        ) : (
          'Reset Password'
        )}
      </Button>
    </form>
  );
}
