import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, Cookie } from 'lucide-react';
import Footer from '../../components/common/Footer';

export default function LegalPages() {
  const { pathname } = useLocation();

  const activeTab =
    pathname === '/terms' ? 'terms' : pathname === '/cookies' ? 'cookies' : 'privacy';

  return (
    <div className="min-h-screen bg-[#080B11] text-zinc-100 flex flex-col font-sans">
      <header className="h-16 border-b border-zinc-800 px-4 sm:px-8 flex items-center justify-between bg-[#080B11]/90 backdrop-blur-md sticky top-0 z-40">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-200 hover:text-white px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Back to App</span>
        </Link>

        <nav aria-label="Legal sections" className="flex items-center gap-2 text-xs">
          <Link
            to="/privacy"
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
              activeTab === 'privacy'
                ? 'bg-purple-600 text-white'
                : 'text-zinc-300 hover:bg-zinc-900'
            }`}
          >
            Privacy
          </Link>
          <Link
            to="/terms"
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
              activeTab === 'terms'
                ? 'bg-purple-600 text-white'
                : 'text-zinc-300 hover:bg-zinc-900'
            }`}
          >
            Terms
          </Link>
          <Link
            to="/cookies"
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
              activeTab === 'cookies'
                ? 'bg-purple-600 text-white'
                : 'text-zinc-300 hover:bg-zinc-900'
            }`}
          >
            Cookies
          </Link>
        </nav>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 space-y-6 text-sm leading-relaxed text-zinc-200">
        {activeTab === 'privacy' && (
          <article className="space-y-5 bg-[#0E131F] border border-zinc-800 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-2.5 text-purple-400 text-xs font-mono uppercase">
              <Shield className="w-4 h-4" aria-hidden="true" />
              <span>Effective Date: November 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Privacy Policy</h1>
            <p className="text-zinc-300">
              PrepGenius collects only the minimum personal information required to provide technical interview practice: your name, verified email address, encrypted password hash, code submissions, mock interview transcripts, and uploaded PDF resumes.
            </p>
            <h2 className="text-lg font-bold text-white pt-2">1. How Your Data Is Processed</h2>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-300">
              <li>Code snippets are sent to our sandboxed execution provider solely to evaluate test cases.</li>
              <li>Resume text, tutor prompts, and interview answers are processed via Google Gemini APIs to generate feedback.</li>
              <li>Uploaded PDF resumes are stored securely in Supabase Storage so you can review past audits.</li>
            </ul>
            <h2 className="text-lg font-bold text-white pt-2">2. Age Requirement (13+)</h2>
            <p className="text-zinc-300">
              PrepGenius is intended strictly for individuals aged 13 and older. We do not knowingly collect data from children under 13.
            </p>
            <h2 className="text-lg font-bold text-white pt-2">3. Account & Data Deletion</h2>
            <p className="text-zinc-300">
              You may permanently delete your account and all associated submissions, chats, interview sessions, and resume audits at any time from your Dashboard using the <strong>Delete My Account</strong> button, or by emailing <a href="mailto:support@prepgenius.app" className="text-purple-300 underline">support@prepgenius.app</a>.
            </p>
          </article>
        )}

        {activeTab === 'terms' && (
          <article className="space-y-5 bg-[#0E131F] border border-zinc-800 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-2.5 text-purple-400 text-xs font-mono uppercase">
              <FileText className="w-4 h-4" aria-hidden="true" />
              <span>Effective Date: November 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Terms of Service</h1>
            <p className="text-zinc-300">
              By creating a PrepGenius account, you confirm that you are at least 13 years old and agree to use the platform for lawful educational and interview-preparation purposes.
            </p>
            <h2 className="text-lg font-bold text-white pt-2">1. Transparent Pricing (No Hidden Fees)</h2>
            <p className="text-zinc-300">
              PrepGenius provides free access to its core DSA practice workspace, ATS resume analyzer, and mock interviewer subject to fair-use rate limits. We do not charge hidden fees or enroll users in automatic recurring billing.
            </p>
            <h2 className="text-lg font-bold text-white pt-2">2. Acceptable Use of Code Sandbox</h2>
            <p className="text-zinc-300">
              You agree not to submit malicious code, network scanners, cryptocurrency miners, or denial-of-service payloads to the code execution environment.
            </p>
            <h2 className="text-lg font-bold text-white pt-2">3. AI-Generated Feedback Disclaimer</h2>
            <p className="text-zinc-300">
              AI tutor hints, ATS scores, and mock interview evaluations are educational aids and do not guarantee employment or hiring outcomes.
            </p>
          </article>
        )}

        {activeTab === 'cookies' && (
          <article className="space-y-5 bg-[#0E131F] border border-zinc-800 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-2.5 text-purple-400 text-xs font-mono uppercase">
              <Cookie className="w-4 h-4" aria-hidden="true" />
              <span>Effective Date: November 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Cookie & Local Storage Policy</h1>
            <p className="text-zinc-300">
              PrepGenius minimizes tracking and does not sell user data to third-party ad networks.
            </p>
            <h2 className="text-lg font-bold text-white pt-2">1. Essential Storage</h2>
            <ul className="list-disc list-inside space-y-1.5 text-zinc-300">
              <li><strong>Authentication Token (`token`):</strong> Keeps your session signed in across page reloads.</li>
              <li><strong>Code Drafts (`pg_code_*`):</strong> Preserves your editor code locally in your browser so work is not lost.</li>
              <li><strong>Consent Choice (`pg_cookie_consent_v1`):</strong> Remembers your cookie banner selection.</li>
            </ul>
            <h2 className="text-lg font-bold text-white pt-2">2. Optional Performance Telemetry</h2>
            <p className="text-zinc-300">
              If you choose &ldquo;Accept All&rdquo;, anonymous page-load metrics (Vercel Speed Insights) are used solely to diagnose latency.
            </p>
          </article>
        )}
      </main>

      <Footer />
    </div>
  );
}