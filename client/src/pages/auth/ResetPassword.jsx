import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPasswordRequest } from '../../api/authApi';
import { Logo } from '../../components/common/Logo';
import { Lock, CheckCircle2 } from 'lucide-react';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordRequest(token, password);
      setSuccess(res.message || 'Password reset successful!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset link is invalid or expired.');
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
          <h1 className="text-2xl font-extrabold text-white">Choose a New Password</h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Enter a strong password of at least 8 characters.
          </p>
        </div>

        {error && (
          <div role="alert" className="bg-rose-500/15 border border-rose-400/40 text-rose-200 text-xs px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {success && (
          <div role="status" className="bg-emerald-500/15 border border-emerald-400/40 text-emerald-200 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{success} Redirecting to login...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="rp-pass" className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" aria-hidden="true" />
              <input
                id="rp-pass"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full bg-slate-900 border border-white/15 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              />
            </div>
          </div>

          <div>
            <label htmlFor="rp-confirm" className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" aria-hidden="true" />
              <input
                id="rp-confirm"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full bg-slate-900 border border-white/15 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || Boolean(success)}
            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          >
            {loading ? 'Updating Password...' : 'Save New Password'}
          </button>
        </form>

        <div className="text-center pt-3 border-t border-zinc-800">
          <Link to="/login" className="text-xs text-slate-300 hover:text-white underline">
            Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}