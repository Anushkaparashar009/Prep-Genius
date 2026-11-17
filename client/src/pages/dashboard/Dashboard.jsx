import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { fetchUserSubmissions } from '../../api/code.js';
import Footer from '../../components/common/Footer.jsx';
import { 
  Code2, 
  FileText, 
  Bot, 
  Flame, 
  Target, 
  TrendingUp, 
  LogOut, 
  Terminal, 
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Code,
  Trash2,
  AlertTriangle
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout, deleteAccount } = useAuth() || {};
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalSubmissions: 0,
    acceptedSubmissions: 0,
    problemsSolvedCount: 0,
    submissions: [],
  });
  const [loading, setLoading] = useState(true);

  // Account Deletion Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadStats = async () => {
      try {
        const data = await fetchUserSubmissions();
        if (isMounted && data) {
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    if (logout) logout();
    navigate('/login');
  };

  const handleConfirmDeleteAccount = async (e) => {
    e.preventDefault();
    if (deleteConfirmText !== 'DELETE') return;

    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteAccount();
      localStorage.removeItem('pg_cookie_consent_v1');
      navigate('/register', { replace: true });
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  const username = user?.name || user?.email?.split('@')[0] || 'coder';

  const accuracyRate = stats.totalSubmissions > 0
    ? Math.round((stats.acceptedSubmissions / stats.totalSubmissions) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#080B11] text-zinc-100 font-sans selection:bg-purple-600/30 flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 border-b border-zinc-800 px-4 sm:px-6 md:px-10 flex items-center justify-between bg-[#080B11]/90 backdrop-blur-md sticky top-0 z-40">
        <div
          className="flex items-center gap-2.5"
          role="img"
          aria-label="PrepGenius Dashboard"
        >
          <div className="bg-purple-600 p-1.5 rounded-lg flex items-center justify-center shadow-lg shadow-purple-600/20">
            <Terminal className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
          <div className="flex items-center text-sm font-extrabold tracking-wider">
            <span className="text-white">PREP</span>
            <span className="text-purple-400">GENIUS</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 text-xs text-zinc-200 bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 rounded-full max-w-[180px] sm:max-w-none">
            <div className="w-5 h-5 rounded-full bg-purple-600/25 text-purple-300 flex items-center justify-center text-[10px] font-bold shrink-0">
              {username.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-zinc-200 truncate">{user?.email || 'candidate'}</span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sign out of PrepGenius"
            title="Log out"
            className="p-2 text-zinc-300 hover:text-rose-300 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-b from-[#101423] to-[#0B0F19] border border-zinc-800 rounded-2xl p-6 sm:p-8 md:p-10 shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-[11px] text-zinc-300 mb-4 sm:mb-6 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true"></span>
              Verified Candidate Workspace
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug">
              Welcome back, <span className="text-purple-300">{username}</span>!
            </h1>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xl">
              Track your algorithmic practice, review your resume against target roles, and rehearse technical Q&amp;A.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8 pt-6 border-t border-zinc-800">
              <div className="flex items-center gap-3 bg-zinc-900/50 sm:bg-transparent p-2.5 sm:p-0 rounded-lg border border-zinc-800 sm:border-0">
                <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                  <Flame className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-[10px] text-zinc-300 uppercase tracking-wider font-semibold">Submissions</div>
                  <div className="text-sm font-bold text-zinc-100">
                    {loading ? '...' : `${stats.totalSubmissions} Runs`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-zinc-900/50 sm:bg-transparent p-2.5 sm:p-0 rounded-lg border border-zinc-800 sm:border-0">
                <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
                  <Target className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-[10px] text-zinc-300 uppercase tracking-wider font-semibold">Solved</div>
                  <div className="text-sm font-bold text-zinc-100">
                    {loading ? '...' : `${stats.problemsSolvedCount} Unique`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-zinc-900/50 sm:bg-transparent p-2.5 sm:p-0 rounded-lg border border-zinc-800 sm:border-0">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                  <TrendingUp className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-[10px] text-zinc-300 uppercase tracking-wider font-semibold">Pass Rate</div>
                  <div className="text-sm font-bold text-emerald-300">
                    {loading ? '...' : `${accuracyRate}%`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modules Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" aria-hidden="true" />
              Preparation Modules
            </h2>
            <p className="text-xs text-zinc-300 mt-0.5">
              Core tools for technical interview preparation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {/* Module 1: CodePilot AI Workspace */}
            <button
              type="button"
              onClick={() => navigate('/problems')}
              className="text-left group relative flex flex-col justify-between p-5 sm:p-6 bg-[#0E131F] hover:bg-[#121929] border border-purple-500/35 hover:border-purple-400 rounded-xl cursor-pointer transition-all duration-200 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-600/15 border border-purple-400/30 flex items-center justify-center text-purple-300 group-hover:bg-purple-600/25 transition-colors">
                    <Code2 className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                    Active
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
                  CodePilot AI
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-purple-300" aria-hidden="true" />
                </h3>
                <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                  Interactive problem workspace. Practice curated DSA challenges and test your logic in real time.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between w-full">
                <span className="text-[11px] font-semibold text-purple-300 font-mono">
                  DSA Sandbox
                </span>
                <span className="text-xs font-medium text-purple-300 flex items-center gap-1 group-hover:underline">
                  Browse Problems &rarr;
                </span>
              </div>
            </button>

            {/* Module 2: ATS Resume Audit */}
            <button
              type="button"
              onClick={() => navigate('/resume')}
              className="text-left group relative flex flex-col justify-between p-5 sm:p-6 bg-[#0E131F] hover:bg-[#121929] border border-purple-500/35 hover:border-purple-400 rounded-xl cursor-pointer transition-all duration-200 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-600/15 border border-purple-400/30 flex items-center justify-center text-purple-300 group-hover:bg-purple-600/25 transition-colors">
                    <FileText className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                    Active
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
                  ATS Resume Audit
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-purple-300" aria-hidden="true" />
                </h3>
                <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                  Review your PDF resume against target roles to spot missing keywords and improve bullet points.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between w-full">
                <span className="text-[11px] font-semibold text-purple-300 font-mono">
                  PDF Analysis
                </span>
                <span className="text-xs font-medium text-purple-300 flex items-center gap-1 group-hover:underline">
                  Audit Resume &rarr;
                </span>
              </div>
            </button>

            {/* Module 3: Adaptive AI Mock */}
            <button
              type="button"
              onClick={() => navigate('/interview')}
              className="text-left group relative flex flex-col justify-between p-5 sm:p-6 bg-[#0E131F] hover:bg-[#121929] border border-purple-500/35 hover:border-purple-400 rounded-xl cursor-pointer transition-all duration-200 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-600/15 border border-purple-400/30 flex items-center justify-center text-purple-300 group-hover:bg-purple-600/25 transition-colors">
                    <Bot className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                    Active
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
                  Adaptive AI Mock
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-purple-300" aria-hidden="true" />
                </h3>
                <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                  Practice technical Q&amp;A rounds with follow-up questions and structured post-session feedback.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between w-full">
                <span className="text-[11px] font-semibold text-purple-300 font-mono">
                  Mock Sessions
                </span>
                <span className="text-xs font-medium text-purple-300 flex items-center gap-1 group-hover:underline">
                  Enter Mock &rarr;
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Executions Section */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <Code className="w-4 h-4 text-purple-400" aria-hidden="true" />
                Recent Code Executions
              </h2>
              <p className="text-xs text-zinc-300 mt-0.5">
                History of your recent test evaluations and submissions
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/problems')}
              className="text-xs text-purple-300 hover:text-white font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded px-2 py-1"
            >
              Solve More &rarr;
            </button>
          </div>

          <div className="bg-[#0B0F19] border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
            {loading ? (
              <div className="p-8 text-center text-xs text-zinc-300">
                Fetching execution history...
              </div>
            ) : stats.submissions.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-300">
                No submissions recorded yet. Head over to CodePilot and run your first solution!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0E1321] text-zinc-300 uppercase tracking-wider font-semibold border-b border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Problem</th>
                      <th className="py-3 px-4">Language</th>
                      <th className="py-3 px-4">Verdict</th>
                      <th className="py-3 px-4">Test Cases</th>
                      <th className="py-3 px-4">Runtime</th>
                      <th className="py-3 px-4">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/70 text-zinc-200">
                    {stats.submissions.map((sub) => {
                      const isPassed = sub.passed;
                      return (
                        <tr key={sub._id} className="hover:bg-zinc-900/50 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-white">
                            {sub.problemId?.title || sub.problemSlug}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] uppercase text-zinc-300">
                            {sub.language}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${
                                isPassed
                                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                                  : 'bg-rose-500/15 text-rose-300 border-rose-400/30'
                              }`}
                            >
                              {isPassed ? (
                                <CheckCircle2 className="w-3 h-3 shrink-0" aria-hidden="true" />
                              ) : (
                                <XCircle className="w-3 h-3 shrink-0" aria-hidden="true" />
                              )}
                              {sub.verdict}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-zinc-300">
                            {sub.passedTestCases} / {sub.totalTestCases}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-zinc-300">
                            {sub.runtime || '0.000s'}
                          </td>
                          <td className="py-3.5 px-4 text-zinc-300">
                            {new Date(sub.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Account & Data Privacy Section */}
        <section
          aria-labelledby="account-privacy-heading"
          className="bg-[#0B0F19] border border-zinc-800 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <h2 id="account-privacy-heading" className="text-sm font-bold text-white">
              Account &amp; Data Controls
            </h2>
            <p className="text-xs text-zinc-300 max-w-xl leading-relaxed">
              You own your practice data. Permanently delete your account, code submissions, tutor chats, interview transcripts, and resume audits at any time.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setDeleteConfirmText('');
              setDeleteError('');
              setShowDeleteModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/40 text-rose-200 text-xs font-semibold transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Delete My Account</span>
          </button>
        </section>
      </main>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md bg-[#0E131F] border border-zinc-700 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-400/30 flex items-center justify-center text-rose-300 shrink-0">
                <AlertTriangle className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h3 id="delete-modal-title" className="text-base font-bold text-white">
                  Permanently Delete Account?
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  This action cannot be undone. All of your submissions, tutor chat sessions, mock interview reports, and resume audits will be erased permanently.
                </p>
              </div>
            </div>

            {deleteError && (
              <div role="alert" className="text-xs text-rose-200 bg-rose-950/50 border border-rose-500/40 rounded-lg p-3">
                {deleteError}
              </div>
            )}

            <form onSubmit={handleConfirmDeleteAccount} className="space-y-4">
              <div>
                <label
                  htmlFor="confirm-delete-input"
                  className="block text-xs text-zinc-200 mb-1.5"
                >
                  Type <strong className="font-mono text-rose-300">DELETE</strong> to confirm:
                </label>
                <input
                  id="confirm-delete-input"
                  type="text"
                  required
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2 text-sm font-mono text-white placeholder-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeleting || deleteConfirmText !== 'DELETE'}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                >
                  {isDeleting ? 'Deleting Data...' : 'Permanently Delete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}