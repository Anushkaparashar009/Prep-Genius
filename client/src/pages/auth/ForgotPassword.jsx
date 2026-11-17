import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPasswordRequest } from '../../api/authApi';
import { Logo } from '../../components/common/Logo';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await forgotPasswordRequest(email.trim().toLowerCase());
      setMessage(res.message || 'If an account exists for that email, a reset link has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-[#0E131F] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex justify-center">
          <Logo size="md" />
        </div>

        <div className="space-y-1.5 text-center">
          <h1 className="text-2xl font-extrabold text-white">Reset Your Password</h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Enter your registered email address and we&apos;ll send you a password reset link.
          </p>
        </div>

        {error && (
          <div role="alert" className="bg-rose-500/15 border border-rose-400/40 text-rose-200 text-xs px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {message && (
          <div role="status" className="bg-emerald-500/15 border border-emerald-400/40 text-emerald-200 text-xs px-4 py-3 rounded-xl">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fp-email" className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" aria-hidden="true" />
              <input
                id="fp-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gmail.com"
                className="w-full bg-slate-900 border border-white/15 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
            <span>{loading ? 'Sending Link...' : 'Send Reset Link'}</span>
          </button>
        </form>

        <div className="text-center pt-3 border-t border-zinc-800">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}