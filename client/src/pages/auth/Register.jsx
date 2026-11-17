import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/common/Logo';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Terminal,
  CheckCircle2,
  Code2,
} from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    acceptedTerms: false,
    isOver13: false,
    marketingOptIn: false,
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.isOver13) {
      setError('You must confirm that you are 13 years of age or older.');
      return;
    }

    if (!formData.acceptedTerms) {
      setError('Please accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register(formData);
      if (res?.requiresVerification) {
        navigate('/verify-otp', { state: { email: formData.email.trim().toLowerCase() } });
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070b14] text-slate-100 flex overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Left Informational Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 border-r border-white/10 bg-gradient-to-br from-[#0c1222] via-[#070b14] to-[#04070e] overflow-hidden">
        <div className="relative z-10">
          <Logo size="lg" />
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-400/30 text-purple-300 text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Structured Interview Readiness</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            Practice problem-solving for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300">
              technical engineering interviews
            </span>
            .
          </h1>

          <div className="space-y-3.5 pt-2">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
                <Code2 className="w-3.5 h-3.5" aria-hidden="true" />
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                <strong className="text-white">Socratic Code Workspace:</strong> Work through DSA problems with step-by-step hints rather than full spoiler solutions.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                <strong className="text-white">Transparent &amp; Private:</strong> We collect only essential account details, verify your email via OTP, and let you delete your data anytime.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-xs text-slate-300 font-mono">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            Gmail OTP Verified
          </span>
          <span className="flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-purple-400" aria-hidden="true" />
            No Hidden Fees
          </span>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <div className="w-full max-w-md relative z-10 space-y-6 my-auto py-4">
          <div className="lg:hidden flex justify-center mb-4">
            <Logo size="lg" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Create Your Account
            </h2>
            <p className="text-slate-300 text-sm">
              Enter your basic details below. We&apos;ll send a 6-digit verification code to your email.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="bg-rose-500/15 border border-rose-400/40 text-rose-200 text-xs px-4 py-3 rounded-xl flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="reg-name"
                className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" aria-hidden="true" />
                <input
                  id="reg-name"
                  type="text"
                  required
                  autoComplete="name"
                  className="w-full bg-slate-900 border border-white/15 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus:border-indigo-400"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-email"
                className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" aria-hidden="true" />
                <input
                  id="reg-email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full bg-slate-900 border border-white/15 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus:border-indigo-400"
                  placeholder="you@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-password"
                className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" aria-hidden="true" />
                <input
                  id="reg-password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full bg-slate-900 border border-white/15 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus:border-indigo-400"
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {/* Explicit Compliance & Age Guardrail Checkboxes */}
            <div className="space-y-2.5 pt-1 text-xs text-slate-200">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={formData.isOver13}
                  onChange={(e) => setFormData({ ...formData, isOver13: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-900 text-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                />
                <span>
                  I confirm that I am <strong>13 years of age or older</strong>. <span className="text-rose-300">*</span>
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={formData.acceptedTerms}
                  onChange={(e) => setFormData({ ...formData, acceptedTerms: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-900 text-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                />
                <span>
                  I agree to the{' '}
                  <Link
                    to="/terms"
                    className="text-indigo-300 underline hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    to="/privacy"
                    className="text-indigo-300 underline hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
                  >
                    Privacy Policy
                  </Link>
                  . <span className="text-rose-300">*</span>
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer select-none text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.marketingOptIn}
                  onChange={(e) => setFormData({ ...formData, marketingOptIn: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-900 text-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                />
                <span>
                  (Optional) Send occasional study tips and platform updates. You can unsubscribe anytime.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-colors disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
            >
              <span>{isSubmitting ? 'Sending Verification Code...' : 'Create Account & Verify Email'}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>

          <div className="text-center pt-3 border-t border-white/10 space-y-2">
            <p className="text-xs text-slate-300">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-indigo-300 hover:text-white font-semibold underline ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
              >
                Sign In
              </Link>
            </p>
            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-300">
              <Link to="/privacy" className="hover:text-white underline">Privacy</Link>
              <Link to="/terms" className="hover:text-white underline">Terms</Link>
              <Link to="/cookies" className="hover:text-white underline">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;