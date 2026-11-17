import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { resendOtpRequest } from '../../api/authApi';
import { Logo } from '../../components/common/Logo';
import { MailCheck, ArrowRight, RotateCw } from 'lucide-react';

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp } = useAuth();

  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      await verifyOtp(email.trim().toLowerCase(), otp.trim());
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Check your code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setError('Please enter your email address first.');
      return;
    }
    setError('');
    setInfo('');
    setResending(true);
    try {
      const res = await resendOtpRequest(email.trim().toLowerCase());
      setInfo(res.message || 'A new 6-digit code has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend verification code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-[#0E131F] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex justify-center">
          <Logo size="md" />
        </div>

        <div className="text-center space-y-1.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-indigo-300 mx-auto mb-2">
            <MailCheck className="w-5 h-5" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Verify Your Email</h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Enter the 6-digit code sent to your Gmail inbox. The code expires in 10 minutes.
          </p>
        </div>

        {error && (
          <div role="alert" className="bg-rose-500/15 border border-rose-400/40 text-rose-200 text-xs px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {info && (
          <div role="status" className="bg-emerald-500/15 border border-emerald-400/40 text-emerald-200 text-xs px-4 py-3 rounded-xl">
            {info}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label htmlFor="otp-email" className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Email Address
            </label>
            <input
              id="otp-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmail.com"
              className="w-full bg-slate-900 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            />
          </div>

          <div>
            <label htmlFor="otp-code" className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              6-Digit Verification Code
            </label>
            <input
              id="otp-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full bg-slate-900 border border-white/15 rounded-xl px-4 py-3 text-center text-xl font-mono font-bold tracking-[0.4em] text-white placeholder-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          >
            <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </form>

        <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="inline-flex items-center gap-1.5 text-indigo-300 hover:text-white font-semibold cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
          >
            <RotateCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>{resending ? 'Sending...' : 'Resend Code'}</span>
          </button>

          <Link
            to="/login"
            className="text-slate-300 hover:text-white underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}