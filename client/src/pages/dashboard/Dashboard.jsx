import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { fetchUserSubmissions } from '../../api/code.js';
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
  Code
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth() || {};
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalSubmissions: 0,
    acceptedSubmissions: 0,
    problemsSolvedCount: 0,
    submissions: [],
  });
  const [loading, setLoading] = useState(true);

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

  const username = user?.name || user?.email?.split('@')[0] || 'coder';

  const accuracyRate = stats.totalSubmissions > 0
    ? Math.round((stats.acceptedSubmissions / stats.totalSubmissions) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#080B11] text-zinc-100 font-sans selection:bg-purple-600/30 flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 border-b border-zinc-800/80 px-4 sm:px-6 md:px-10 flex items-center justify-between bg-[#080B11]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="bg-purple-600 p-1.5 rounded-lg flex items-center justify-center shadow-lg shadow-purple-600/20">
            <Terminal className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center text-sm font-extrabold tracking-wider">
            <span className="text-white">PREP</span>
            <span className="text-purple-400">GENIUS</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 text-xs text-zinc-300 bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 rounded-full max-w-[160px] sm:max-w-none">
            <div className="w-5 h-5 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center text-[10px] font-bold shrink-0">
              {username.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-zinc-200 truncate">{user?.email || 'user@prepgenius.io'}</span>
          </div>

          <button
            onClick={handleLogout}
            title="Log out"
            className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-b from-[#101423] to-[#0B0F19] border border-zinc-800/90 rounded-2xl p-6 sm:p-8 md:p-10 shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-400 mb-4 sm:mb-6 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              phase4_active_v2.5
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug">
              Welcome back, <span className="text-purple-400">{username}</span>!
            </h1>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xl">
              Track your algorithmic growth, audit your resume against target roles, and practice with AI mentors.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8 pt-6 border-t border-zinc-800/80">
              <div className="flex items-center gap-3 bg-zinc-900/40 sm:bg-transparent p-2.5 sm:p-0 rounded-lg border border-zinc-800/40 sm:border-0">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Submissions</div>
                  <div className="text-sm font-bold text-zinc-100">
                    {loading ? '...' : `${stats.totalSubmissions} Runs`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-zinc-900/40 sm:bg-transparent p-2.5 sm:p-0 rounded-lg border border-zinc-800/40 sm:border-0">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Solved</div>
                  <div className="text-sm font-bold text-zinc-100">
                    {loading ? '...' : `${stats.problemsSolvedCount} Unique`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-zinc-900/40 sm:bg-transparent p-2.5 sm:p-0 rounded-lg border border-zinc-800/40 sm:border-0">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Pass Rate</div>
                  <div className="text-sm font-bold text-emerald-400">
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
              <Sparkles className="w-4 h-4 text-purple-400" />
              Preparation Modules
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Core suites engineered for placement assessment rounds
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {/* Module 1: CodePilot AI Workspace */}
            <div 
              onClick={() => navigate('/problems')}
              className="group relative flex flex-col justify-between p-5 sm:p-6 bg-[#0E131F] hover:bg-[#121929] border border-purple-500/30 hover:border-purple-500/70 rounded-xl cursor-pointer transition-all duration-200 shadow-lg shadow-purple-950/20 hover:shadow-purple-900/30"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:bg-purple-600/20 transition-colors">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live Now
                  </span>
                </div>
                <h3 className="text-sm font-bold text-zinc-100 group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
                  CodePilot AI
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-purple-400" />
                </h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Interactive problem workspace. Select from curated DSA challenges and benchmark logic in real-time.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-purple-400 font-mono">
                  Phase 2 Active
                </span>
                <span className="text-xs font-medium text-purple-400 flex items-center gap-1 group-hover:underline">
                  Browse Problems &rarr;
                </span>
              </div>
            </div>

            {/* Module 2: ATS Resume Audit */}
            <div 
              onClick={() => navigate('/resume')}
              className="group relative flex flex-col justify-between p-5 sm:p-6 bg-[#0E131F] hover:bg-[#121929] border border-purple-500/30 hover:border-purple-500/70 rounded-xl cursor-pointer transition-all duration-200 shadow-lg shadow-purple-950/20 hover:shadow-purple-900/30"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:bg-purple-600/20 transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live Now
                  </span>
                </div>
                <h3 className="text-sm font-bold text-zinc-100 group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
                  ATS Resume Audit
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-purple-400" />
                </h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Parse your resume against target JDs to identify keyword gaps and formatting bottlenecks.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-purple-400 font-mono">
                  Phase 3 Active
                </span>
                <span className="text-xs font-medium text-purple-400 flex items-center gap-1 group-hover:underline">
                  Audit Resume &rarr;
                </span>
              </div>
            </div>

            {/* Module 3: Adaptive AI Mock (NOW UNLOCKED) */}
            <div 
              onClick={() => navigate('/interview')}
              className="group relative flex flex-col justify-between p-5 sm:p-6 bg-[#0E131F] hover:bg-[#121929] border border-purple-500/30 hover:border-purple-500/70 rounded-xl cursor-pointer transition-all duration-200 shadow-lg shadow-purple-950/20 hover:shadow-purple-900/30"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:bg-purple-600/20 transition-colors">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live Now
                  </span>
                </div>
                <h3 className="text-sm font-bold text-zinc-100 group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
                  Adaptive AI Mock
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-purple-400" />
                </h3>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  Realistic technical interview rounds. Interactive questions, deep follow-up probes, and full committee scorecards.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-purple-400 font-mono">
                  Phase 4 Active
                </span>
                <span className="text-xs font-medium text-purple-400 flex items-center gap-1 group-hover:underline">
                  Enter Mock &rarr;
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Executions Section */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <Code className="w-4 h-4 text-purple-400" />
                Recent Code Executions
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Audit trail of your recent test evaluations and submissions
              </p>
            </div>
            <button
              onClick={() => navigate('/problems')}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors cursor-pointer"
            >
              Solve More &rarr;
            </button>
          </div>

          <div className="bg-[#0B0F19] border border-zinc-800/80 rounded-xl overflow-hidden shadow-lg">
            {loading ? (
              <div className="p-8 text-center text-xs text-zinc-500">
                Fetching execution telemetry...
              </div>
            ) : stats.submissions.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">
                No submissions recorded yet. Head over to CodePilot and run your first solution!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0E1321] text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Problem</th>
                      <th className="py-3 px-4">Language</th>
                      <th className="py-3 px-4">Verdict</th>
                      <th className="py-3 px-4">Test Cases</th>
                      <th className="py-3 px-4">Runtime</th>
                      <th className="py-3 px-4">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                    {stats.submissions.map((sub) => {
                      const isPassed = sub.passed;
                      return (
                        <tr key={sub._id} className="hover:bg-zinc-900/40 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-zinc-100">
                            {sub.problemId?.title || sub.problemSlug}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] uppercase text-zinc-400">
                            {sub.language}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${
                                isPassed
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              }`}
                            >
                              {isPassed ? (
                                <CheckCircle2 className="w-3 h-3 shrink-0" />
                              ) : (
                                <XCircle className="w-3 h-3 shrink-0" />
                              )}
                              {sub.verdict}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-zinc-400">
                            {sub.passedTestCases} / {sub.totalTestCases}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-zinc-400">
                            {sub.runtime || '0.000s'}
                          </td>
                          <td className="py-3.5 px-4 text-zinc-500">
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
      </main>
    </div>
  );
}