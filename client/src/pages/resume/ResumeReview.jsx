import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResumeAuditor } from '../../hooks/useResumeAuditor';
import Footer from '../../components/common/Footer.jsx';
import {
  ArrowLeft,
  Sparkles,
  Terminal,
  ExternalLink,
  RotateCcw,
  Clock,
  FileText,
} from 'lucide-react';

const ResumeReview = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState('Full Stack Developer / SDE-1');
  const [loadingStep, setLoadingStep] = useState(0);
  const [fileError, setFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [localPdfBlobUrl, setLocalPdfBlobUrl] = useState('');
  const [displayedResult, setDisplayedResult] = useState(null);

  const {
    loading,
    error: apiError,
    auditResult,
    history,
    runAudit,
    fetchHistory,
    setAuditResult,
    clearError,
  } = useResumeAuditor(true);

  const loadingMessages = [
    'Parsing PDF text stream...',
    'Uploading safely to cloud storage...',
    'Matching skills against ATS parameters...',
    'Synthesizing STAR bullet improvements...',
  ];

  // Sync hook result into local displayedResult whenever a new audit completes
  useEffect(() => {
    if (auditResult) {
      setDisplayedResult(auditResult);
    }
  }, [auditResult]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setFileError('Please select a valid PDF file.');
        setFile(null);
        return;
      }
      if (localPdfBlobUrl) {
        URL.revokeObjectURL(localPdfBlobUrl);
      }
      setFileError('');
      if (clearError) clearError();
      setFile(selectedFile);
      setLocalPdfBlobUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (droppedFile.type !== 'application/pdf') {
        setFileError('Please upload a valid PDF file.');
        return;
      }
      if (localPdfBlobUrl) {
        URL.revokeObjectURL(localPdfBlobUrl);
      }
      setFileError('');
      if (clearError) clearError();
      setFile(droppedFile);
      setLocalPdfBlobUrl(URL.createObjectURL(droppedFile));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    if (localPdfBlobUrl) {
      URL.revokeObjectURL(localPdfBlobUrl);
    }
    setFile(null);
    setDisplayedResult(null);
    if (typeof setAuditResult === 'function') {
      setAuditResult(null);
    }
    setFileError('');
    setLocalPdfBlobUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (clearError) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setFileError('Please choose a PDF resume first.');
      return;
    }

    setFileError('');
    try {
      const response = await runAudit(file, targetRole);
      if (response) {
        setDisplayedResult(response);
      }
      fetchHistory();
    } catch (_) {
      // Error handled via hook
    }
  };

  const result = displayedResult;
  const activeError = fileError || apiError;
  const activePdfUrl = result?.resumeUrl || result?.pdfUrl || localPdfBlobUrl;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-300 border-emerald-400';
    if (score >= 60) return 'text-amber-300 border-amber-400';
    return 'text-rose-300 border-rose-400';
  };

  return (
    <div className="min-h-screen bg-[#080B11] text-zinc-100 font-sans selection:bg-purple-600/30 flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 border-b border-zinc-800 px-4 sm:px-6 md:px-10 flex items-center justify-between bg-[#080B11]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            aria-label="Back to Dashboard"
            title="Back to Dashboard"
            className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-lg px-1"
          >
            <div className="bg-purple-600 p-1.5 rounded-lg flex items-center justify-center shadow-lg shadow-purple-600/20">
              <Terminal className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <div className="flex items-center text-sm font-extrabold tracking-wider">
              <span className="text-white">PREP</span>
              <span className="text-purple-400">GENIUS</span>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-950/50 border border-purple-400/30 text-purple-200 text-xs font-semibold shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-purple-300" aria-hidden="true" />
          <span>ATS Auditor Ready</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            AI Resume &amp; ATS Reviewer
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-zinc-300">
            Upload your resume to get instant ATS scoring, keyword gap analysis, and bullet point rewrites tailored to your placement goals.
          </p>
        </div>

        {/* Upload Form vs. Results */}
        {!result ? (
          <div className="bg-[#0E131F] border border-zinc-800 rounded-xl p-6 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="target-role-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2"
                >
                  Target Role
                </label>
                <input
                  id="target-role-input"
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. SDE-1, MERN Stack Developer, Data Analyst"
                  className="w-full px-4 py-2.5 rounded-lg bg-[#080B11] border border-zinc-700 text-zinc-100 placeholder-zinc-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus:border-purple-400 text-sm transition"
                />
              </div>

              {/* Drag & Drop Box */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                aria-label="Upload PDF resume"
                className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer flex flex-col items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
                  isDragging
                    ? 'border-purple-400 bg-purple-950/25'
                    : 'border-zinc-700 hover:border-zinc-500 bg-[#080B11]/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  id="resumeUpload"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="space-y-2 pointer-events-none">
                  <div className="mx-auto w-12 h-12 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-purple-300">
                    <FileText className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div className="text-sm text-zinc-200">
                    {file ? (
                      <span className="font-semibold text-purple-300">{file.name}</span>
                    ) : (
                      <span>
                        <span className="font-semibold text-purple-300 underline">Click to upload</span> or drag and drop your PDF resume
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400">PDF files up to 5MB</p>
                </div>
              </div>

              {activeError && (
                <div
                  role="alert"
                  className="text-sm text-rose-200 bg-rose-950/40 border border-rose-500/40 rounded-lg p-3"
                >
                  {activeError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !file}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-semibold rounded-lg transition duration-150 flex items-center justify-center space-x-2 cursor-pointer disabled:cursor-not-allowed shadow-lg shadow-purple-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                    <span className="text-xs sm:text-sm font-medium">{loadingMessages[loadingStep]}</span>
                  </>
                ) : (
                  <span>Analyze Resume</span>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Results Section */
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 text-xs font-semibold rounded-lg border border-zinc-700 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Audit Another Resume</span>
              </button>

              {activePdfUrl && (
                <a
                  href={activePdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 text-xs font-semibold rounded-lg border border-purple-500/40 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                >
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>View Uploaded PDF</span>
                </a>
              )}
            </div>

            {/* Top Score Banner */}
            <div className="bg-[#0E131F] border border-zinc-800 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-zinc-900 text-zinc-200 border border-zinc-700">
                  Verdict: {result.verdict}
                </div>
                <h2 className="text-xl font-bold text-white">Overall ATS Alignment</h2>
                <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed">
                  {result.summary}
                </p>
              </div>

              <div
                className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center shrink-0 ${getScoreColor(
                  result.atsScore
                )}`}
              >
                <span className="text-3xl font-extrabold">{result.atsScore}</span>
                <span className="text-[10px] tracking-wider uppercase text-zinc-300">Score / 100</span>
              </div>
            </div>

            {/* Strengths & Weaknesses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0E131F] border border-zinc-800 rounded-xl p-6 space-y-3">
                <h3 className="text-sm font-semibold text-emerald-300 flex items-center gap-2">
                  Identified Strengths
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-zinc-200">
                  {(result.strengths || []).map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#0E131F] border border-zinc-800 rounded-xl p-6 space-y-3">
                <h3 className="text-sm font-semibold text-rose-300 flex items-center gap-2">
                  Areas for Improvement
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-zinc-200">
                  {(result.improvements || result.weaknesses || []).map((weak, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{weak}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Missing Keywords */}
            {result.missingKeywords?.length > 0 && (
              <div className="bg-[#0E131F] border border-zinc-800 rounded-xl p-6 space-y-3">
                <h3 className="text-sm font-semibold text-amber-300">
                  Missing High-Value Keywords for {result.targetRole || targetRole}
                </h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {result.missingKeywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-md text-xs font-medium bg-amber-950/50 text-amber-200 border border-amber-500/40"
                    >
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bullet Point Improvements */}
            {result.bulletPointImprovements?.length > 0 && (
              <div className="bg-[#0E131F] border border-zinc-800 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-white">
                  Bullet Point Optimization (STAR Method)
                </h3>
                <div className="space-y-4">
                  {result.bulletPointImprovements.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg bg-[#080B11] border border-zinc-800 space-y-2 text-xs sm:text-sm"
                    >
                      <div>
                        <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">
                          Original:
                        </span>
                        <p className="text-zinc-300 italic mt-0.5">{item.original}</p>
                      </div>
                      <div className="text-xs text-amber-200 bg-amber-950/30 p-2.5 rounded border border-amber-500/30">
                        <span className="font-semibold">Critique: </span>
                        {item.critique}
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                          Suggested Rewrite:
                        </span>
                        <p className="text-zinc-100 font-medium mt-0.5">{item.improved}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Audit History Section */}
        {history && history.length > 0 && (
          <div className="bg-[#0E131F] border border-zinc-800 rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Clock className="w-4 h-4 text-purple-300" aria-hidden="true" />
              <span>Past Resume Audits</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-200">
                <thead className="bg-[#080B11] text-zinc-300 uppercase tracking-wider text-[11px] border-b border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-3">Target Role</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">Verdict</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70">
                  {history.map((audit, idx) => (
                    <tr key={audit._id || idx} className="hover:bg-zinc-900/50">
                      <td className="py-3 px-3 text-zinc-100 font-medium">{audit.targetRole}</td>
                      <td className="py-3 px-3 font-bold text-purple-300">{audit.atsScore}/100</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-[11px] text-zinc-200">
                          {audit.verdict}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-zinc-300">
                        {new Date(audit.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-right space-x-3">
                        <button
                          type="button"
                          onClick={() => {
                            setDisplayedResult(audit);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="text-zinc-200 hover:text-white underline font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded"
                        >
                          Report
                        </button>
                        {(audit.resumeUrl || audit.pdfUrl) && (
                          <a
                            href={audit.resumeUrl || audit.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-300 hover:text-white underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded"
                          >
                            PDF
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

    </div>
  );
};

export default ResumeReview;