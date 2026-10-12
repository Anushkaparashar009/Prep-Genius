import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResumeAuditor } from '../../hooks/useResumeAuditor';
import { ArrowLeft, Sparkles, Terminal, ExternalLink, RotateCcw, Clock, FileText } from 'lucide-react';

const ResumeReview = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState('Full Stack Developer / SDE-1');
  const [loadingStep, setLoadingStep] = useState(0);
  const [fileError, setFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [localPdfBlobUrl, setLocalPdfBlobUrl] = useState('');

  const {
    loading,
    error: apiError,
    auditResult: result,
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
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setFileError('Please select a valid PDF file.');
        setFile(null);
        return;
      }
      setFileError('');
      clearError();
      setFile(selectedFile);
      setLocalPdfBlobUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type !== 'application/pdf') {
        setFileError('Please upload a valid PDF file.');
        return;
      }
      setFileError('');
      clearError();
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
    setFile(null);
    setAuditResult(null);
    setFileError('');
    setLocalPdfBlobUrl('');
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setFileError('Please choose a PDF resume first.');
      return;
    }

    setFileError('');
    try {
      await runAudit(file, targetRole);
      fetchHistory();
    } catch (_) {
      // Error handled via hook
    }
  };

  const activeError = fileError || apiError;
  const activePdfUrl = result?.resumeUrl || result?.pdfUrl || localPdfBlobUrl;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500';
    if (score >= 60) return 'text-amber-400 border-amber-500';
    return 'text-rose-400 border-rose-500';
  };

  return (
    <div className="min-h-screen bg-[#080B11] text-zinc-100 font-sans selection:bg-purple-600/30 flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 border-b border-zinc-800/80 px-4 sm:px-6 md:px-10 flex items-center justify-between bg-[#080B11]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            title="Back to Dashboard"
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4"/>
          </button>

          <div 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="bg-purple-600 p-1.5 rounded-lg flex items-center justify-center shadow-lg shadow-purple-600/20">
              <Terminal className="w-4 h-4 text-white"/>
            </div>
            <div className="flex items-center text-sm font-extrabold tracking-wider">
              <span className="text-white">PREP</span>
              <span className="text-purple-400">GENIUS</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs font-semibold shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-purple-400"/>
          <span>ATS Auditor Ready</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            AI Resume & ATS Reviewer
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-zinc-400">
            Upload your resume to get instant ATS scoring, keyword gap analysis, and bullet point rewrites tailored to your placement goals.
          </p>
        </div>

        {/* Upload Form */}
        {!result ? (
          <div className="bg-[#0E131F] border border-zinc-800/80 rounded-xl p-6 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Target Role
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. SDE-1, MERN Stack Developer, Data Analyst"
                  className="w-full px-4 py-2.5 rounded-lg bg-[#080B11] border border-zinc-800 text-zinc-200 focus:outline-none focus:border-purple-500 text-sm transition"
                />
              </div>

              {/* Drag & Drop Box */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer flex flex-col items-center justify-center ${
                  isDragging
                    ? 'border-purple-500 bg-purple-950/20'
                    : 'border-zinc-800 hover:border-zinc-700 bg-[#080B11]/50'
                }`}
              >
                <input
                  type="file"
                  id="resumeUpload"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="resumeUpload" className="cursor-pointer space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-purple-400">
                    <FileText className="w-6 h-6"/>
                  </div>
                  <div className="text-sm text-zinc-300">
                    {file ? (
                      <span className="font-semibold text-purple-400">{file.name}</span>
                    ) : (
                      <span>
                        <span className="font-semibold text-purple-400 hover:underline">Click to upload</span> or drag and drop your PDF resume
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500">PDF files up to 5MB</p>
                </label>
              </div>

              {activeError && (
                <div className="text-sm text-rose-400 bg-rose-950/30 border border-rose-900 rounded-lg p-3">
                  {activeError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !file}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-medium rounded-lg transition duration-150 flex items-center justify-center space-x-2 cursor-pointer disabled:cursor-not-allowed shadow-lg shadow-purple-600/20"
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
            <div className="flex items-center justify-between">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-lg border border-zinc-800 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5"/>
                <span>Audit Another Resume</span>
              </button>

              {activePdfUrl && (
                <a
                  href={activePdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 text-xs font-semibold rounded-lg border border-purple-800/60 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5"/>
                  <span>View Uploaded PDF</span>
                </a>
              )}
            </div>

            {/* Top Score Banner */}
            <div className="bg-[#0E131F] border border-zinc-800/80 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800">
                  Verdict: {result.verdict}
                </div>
                <h2 className="text-xl font-bold text-white">Overall ATS Alignment</h2>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">{result.summary}</p>
              </div>

              <div
                className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center shrink-0 ${getScoreColor(
                  result.atsScore
                )}`}
              >
                <span className="text-3xl font-extrabold">{result.atsScore}</span>
                <span className="text-[10px] tracking-wider uppercase text-zinc-400">Score / 100</span>
              </div>
            </div>

            {/* Strengths & Weaknesses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0E131F] border border-zinc-800/80 rounded-xl p-6 space-y-3">
                <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                  Identified Strengths
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-zinc-300">
                  {(result.strengths || []).map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#0E131F] border border-zinc-800/80 rounded-xl p-6 space-y-3">
                <h3 className="text-sm font-semibold text-rose-400 flex items-center gap-2">
                  Areas for Improvement
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-zinc-300">
                  {(result.improvements || result.weaknesses || []).map((weak, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{weak}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Missing Keywords */}
            {result.missingKeywords?.length > 0 && (
              <div className="bg-[#0E131F] border border-zinc-800/80 rounded-xl p-6 space-y-3">
                <h3 className="text-sm font-semibold text-amber-400">
                  Missing High-Value Keywords for {targetRole}
                </h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {result.missingKeywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-md text-xs font-medium bg-amber-950/40 text-amber-300 border border-amber-800/60"
                    >
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bullet Point Improvements */}
            {result.bulletPointImprovements?.length > 0 && (
              <div className="bg-[#0E131F] border border-zinc-800/80 rounded-xl p-6 space-y-4">
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
                        <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Original:</span>
                        <p className="text-zinc-400 italic mt-0.5">{item.original}</p>
                      </div>
                      <div className="text-xs text-amber-300/90 bg-amber-950/20 p-2.5 rounded border border-amber-900/40">
                        <span className="font-semibold">Critique: </span>
                        {item.critique}
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Suggested Rewrite:</span>
                        <p className="text-zinc-200 font-medium mt-0.5">{item.improved}</p>
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
          <div className="bg-[#0E131F] border border-zinc-800/80 rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Clock className="w-4 h-4 text-purple-400"/>
              <span>Past Resume Audits</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-[#080B11] text-zinc-500 uppercase tracking-wider text-[11px] border-b border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-3">Target Role</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">Verdict</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-right">Resume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {history.map((audit, idx) => (
                    <tr key={audit._id || idx} className="hover:bg-zinc-900/40">
                      <td className="py-3 px-3 text-zinc-200 font-medium">{audit.targetRole}</td>
                      <td className="py-3 px-3 font-bold text-purple-400">{audit.atsScore}/100</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300">
                          {audit.verdict}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-zinc-500">
                        {new Date(audit.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {(audit.resumeUrl || audit.pdfUrl) ? (
                          <a
                            href={audit.resumeUrl || audit.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300 underline font-medium"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-zinc-600">—</span>
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