import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

const MARKETING_URL = import.meta.env.VITE_MARKETING_URL || 'https://familycare.help';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await resetPassword(email);
      setIsSuccess(true);
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('Authorization') || msg.includes('invalid') || msg.includes('token') || msg.includes('fetch')) {
        setError('Something went wrong. Please refresh the page and try again.');
      } else {
        setError(msg || 'Failed to send reset email. Please try again.');
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
            <span className="text-gray-900">Reset </span>
            <span className="text-teal-600">Password</span>
          </h1>
          <p
            className="mt-3 text-base text-gray-500"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          {isSuccess ? (
            <SuccessMessage email={email} />
          ) : (
            <ResetForm
              email={email}
              setEmail={setEmail}
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

function SuccessMessage({ email }) {
  return (
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <CheckCircle className="w-12 h-12 text-teal-600" />
      </div>
      <h2
        className="text-lg font-semibold text-gray-900"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Check your email
      </h2>
      <p
        className="text-sm text-gray-500"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        We sent a password reset link to{' '}
        <span className="font-medium text-gray-700">{email}</span>
      </p>
      <p
        className="text-xs text-gray-400"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Didn't get the email? Check your spam folder or try again.
      </p>
      <Link
        to="/login"
        className="inline-block mt-4 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors duration-200"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Back to login
      </Link>
    </div>
  );
}

function ResetForm({ email, setEmail, error, isSubmitting, onSubmit }) {
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

      <Button
        type="submit"
        className="w-full h-12 rounded-xl font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-colors duration-200"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Sending reset link...
          </>
        ) : (
          'Send Reset Link'
        )}
      </Button>
    </form>
  );
}
