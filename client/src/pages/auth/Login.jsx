import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/common/Logo';
import {
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Terminal,
  CheckCircle2,
} from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.requiresVerification) {
        navigate('/verify-otp', {
          state: { email: err.response.data.email || formData.email.trim().toLowerCase() },
        });
        return;
      }
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070b14] text-slate-100 flex overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 border-r border-white/10 bg-gradient-to-br from-[#0c1222] via-[#070b14] to-[#04070e] overflow-hidden">
        <div className="relative z-10">
          <Logo size="lg" />
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Technical Interview Practice</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            Prepare for coding rounds with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
              guided practice
            </span>
            .
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed">
            Test solutions in a sandboxed runner, get Socratic hints when stuck, audit your resume structure, and rehearse technical Q&amp;A.
          </p>

          <div className="rounded-xl border border-white/15 bg-slate-950/90 p-4 font-mono text-xs shadow-2xl space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-slate-300">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              </div>
              <span className="text-[11px] text-slate-300">prep-genius-workspace</span>
            </div>
            <p className="text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> Judge0 code sandbox: Ready
            </p>
            <p className="text-indigo-300 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> Socratic AI tutor: Ready
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-xs text-slate-300 font-mono">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            JWT Session Auth
          </span>
          <span className="flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-indigo-400" aria-hidden="true" />
            Cloud Code Runner
          </span>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md relative z-10 space-y-7">
          <div className="lg:hidden flex justify-center mb-6">
            <Logo size="lg" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Welcome back</h2>
            <p className="text-slate-300 text-sm">Enter your credentials to access your workspace</p>
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" aria-hidden="true" />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full bg-slate-900 border border-white/15 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus:border-indigo-400"
                  placeholder="you@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-mono uppercase tracking-wider text-slate-300"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-indigo-300 hover:text-white underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" aria-hidden="true" />
                <input
                  id="login-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="w-full bg-slate-900 border border-white/15 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus:border-indigo-400"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-colors disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>

          <div className="text-center pt-4 border-t border-white/10 space-y-2">
            <p className="text-xs text-slate-300">
              New to PrepGenius?{' '}
              <Link
                to="/register"
                className="text-indigo-300 hover:text-white font-semibold underline ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded"
              >
                Create your account
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

export default Login;