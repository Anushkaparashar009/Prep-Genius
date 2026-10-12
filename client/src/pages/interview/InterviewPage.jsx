import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  startInterviewApi,
  sendInterviewReplyApi,
  finishInterviewApi,
  getInterviewHistoryApi,
} from '../../api/interviewApi';
import MarkdownRenderer from '../../components/common/MarkdownRenderer';
import {
  ArrowLeft,
  Bot,
  Send,
  Sparkles,
  Terminal,
  Award,
  TrendingUp,
  CheckCircle2,
  Clock,
  RotateCcw,
  Loader2,
  AlertCircle,
  Mic,
  MicOff,
} from 'lucide-react';

const PRESET_ROLES = [
  'Full Stack Engineer (SDE-1)',
  'Frontend Developer (React)',
  'Backend Developer (Node.js/Express)',
  'Data Structures & Algorithms Focus',
  'System Design & Architecture',
];

export default function InterviewPage() {
  const navigate = useNavigate();

  // Setup state
  const [roleTitle, setRoleTitle] = useState('Full Stack Engineer (SDE-1)');
  const [difficulty, setDifficulty] = useState('Entry');
  const [isStarted, setIsStarted] = useState(false);
  const [session, setSession] = useState(null);

  // Chat & turn state
  const [messages, setMessages] = useState([]);
  const [inputAnswer, setInputAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [isConcluding, setIsConcluding] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState('');

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);

  // History state
  const [history, setHistory] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const loadHistory = async () => {
    try {
      const res = await getInterviewHistoryApi();
      if (res.success && Array.isArray(res.sessions)) {
        setHistory(res.sessions);
      }
    } catch (_) {
      // Ignore background history fetch issues
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        }
      }

      if (finalTranscript) {
        setInputAnswer((prev) =>
          prev ? `${prev.trim()} ${finalTranscript.trim()}` : finalTranscript.trim()
        );
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Speech recognition start failed:', err);
      }
    }
  }, [isListening]);

  const handleStartInterview = async (e) => {
    e.preventDefault();
    if (!roleTitle.trim()) return;

    setLoading(true);
    setError('');
    setFeedback(null);

    try {
      const res = await startInterviewApi({ roleTitle: roleTitle.trim(), difficulty });
      if (res.success && res.session) {
        setSession(res.session);
        setMessages(res.session.messages || []);
        setIsStarted(true);
      }
    } catch (err) {
      console.error('Failed to start interview:', err);
      setError(err.response?.data?.message || 'Could not start interview. Check server connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendAnswer = async (e) => {
    e.preventDefault();
    if (!inputAnswer.trim() || loading || !session) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const answerText = inputAnswer.trim();
    setInputAnswer('');
    const updatedMessages = [...messages, { role: 'user', content: answerText }];
    setMessages(updatedMessages);
    setLoading(true);
    setError('');

    try {
      const res = await sendInterviewReplyApi({
        sessionId: session._id,
        answer: answerText,
      });

      if (res.success && res.messages) {
        setMessages(res.messages);
      }
    } catch (err) {
      console.error('Failed to send answer:', err);
      setError(err.response?.data?.message || 'Error communicating with the interviewer.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishInterview = async () => {
    if (!session || isConcluding) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const candidateReplies = messages.filter((m) => m.role === 'user');
    if (candidateReplies.length === 0) {
      setError('Please answer at least one question before ending the interview.');
      return;
    }

    setIsConcluding(true);
    setError('');

    try {
      const res = await finishInterviewApi({ sessionId: session._id });
      if (res.success && res.feedback) {
        setFeedback(res.feedback);
        loadHistory();
      }
    } catch (err) {
      console.error('Failed to finish interview:', err);
      setError(err.response?.data?.message || 'Failed to synthesize scorecard. Please retry.');
    } finally {
      setIsConcluding(false);
    }
  };

  const handleResetSession = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    setIsStarted(false);
    setSession(null);
    setMessages([]);
    setFeedback(null);
    setInputAnswer('');
    setError('');
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20';
    if (score >= 60) return 'text-amber-400 border-amber-500/40 bg-amber-950/20';
    return 'text-rose-400 border-rose-500/40 bg-rose-950/20';
  };

  return (
    <div className="min-h-screen bg-[#080B11] text-zinc-100 font-sans selection:bg-purple-600/30 flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 border-b border-zinc-800/80 px-4 sm:px-6 md:px-10 flex items-center justify-between bg-[#080B11]/80 backdrop-blur-md sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            title="Back to Dashboard"
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="bg-purple-600 p-1.5 rounded-lg flex items-center justify-center shadow-lg shadow-purple-600/20">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center text-sm font-extrabold tracking-wider">
              <span className="text-white">PREP</span>
              <span className="text-purple-400">GENIUS</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs font-semibold shadow-sm">
          <Bot className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">Adaptive AI Mock</span>
          <span className="sm:hidden">Mock AI</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col min-h-0">
        {/* Error Alert */}
        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 text-xs sm:text-sm text-rose-300 bg-rose-950/30 border border-rose-900 rounded-xl">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. SETUP STATE */}
        {!isStarted && !feedback && (
          <div className="space-y-8 my-auto">
            <div className="text-center max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto mb-3 shadow-lg shadow-purple-950/40">
                <Bot className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Adaptive AI Mock Interviewer
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Experience realistic technical interview rounds. Receive follow-up questions tailored to your answers, followed by a comprehensive scorecard.
              </p>
            </div>

            <div className="max-w-xl mx-auto bg-[#0E131F] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl">
              <form onSubmit={handleStartInterview} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                    Target Role or Domain
                  </label>
                  <input
                    type="text"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="e.g. SDE-1, React Frontend, Node.js Backend"
                    required
                    className="w-full px-4 py-2.5 rounded-lg bg-[#080B11] border border-zinc-800 text-zinc-200 text-xs sm:text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {PRESET_ROLES.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setRoleTitle(role)}
                        className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                          roleTitle === role
                            ? 'bg-purple-950/40 border-purple-500/40 text-purple-300'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Entry', 'Intermediate', 'Advanced'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setDifficulty(lvl)}
                        className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                          difficulty === lvl
                            ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/30'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !roleTitle.trim()}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Initializing Interviewer...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Start Mock Session</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Past Interview History */}
            {history.length > 0 && (
              <div className="max-w-xl mx-auto bg-[#0B0F19] border border-zinc-800/80 rounded-xl p-5 shadow-lg space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Recent Mock Sessions</span>
                </div>
                <div className="divide-y divide-zinc-800/60 text-xs">
                  {history.slice(0, 5).map((item) => (
                    <div key={item._id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-zinc-200">{item.roleTitle}</div>
                        <div className="text-[10px] text-zinc-500">
                          {item.difficulty} • {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        {item.status === 'completed' && item.feedback?.overallScore ? (
                          <span className="font-bold text-emerald-400">
                            {item.feedback.overallScore}/100
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-500">Incomplete</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. LIVE INTERVIEW SESSION STATE */}
        {isStarted && !feedback && (
          <div className="flex-1 flex flex-col bg-[#0B0F19] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl min-h-0">
            {/* Top Session Bar */}
            <div className="p-3.5 sm:px-5 border-b border-zinc-800/80 bg-[#0E131F] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                <span className="text-xs sm:text-sm font-bold text-zinc-200 truncate">
                  {roleTitle}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60 font-mono shrink-0">
                  {difficulty}
                </span>
              </div>

              <button
                onClick={handleFinishInterview}
                disabled={isConcluding}
                className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isConcluding ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Scoring...</span>
                  </>
                ) : (
                  <>
                    <Award className="w-3.5 h-3.5 text-rose-400" />
                    <span>Conclude & Score</span>
                  </>
                )}
              </button>
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((msg, idx) => {
                const isAssistant = msg.role === 'assistant';
                return (
                  <div
                    key={idx}
                    className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[92%] sm:max-w-[82%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-md ${
                        isAssistant
                          ? 'bg-[#0E131F] border border-zinc-800 text-zinc-200'
                          : 'bg-purple-600 text-white font-medium'
                      }`}
                    >
                      {isAssistant && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-2">
                          <Bot className="w-3.5 h-3.5" /> Interviewer
                        </div>
                      )}
                      {isAssistant ? (
                        <MarkdownRenderer content={msg.content} />
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#0E131F] border border-zinc-800 rounded-2xl p-4 text-xs text-zinc-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse delay-75"></span>
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse delay-150"></span>
                    <span className="text-xs ml-1">Interviewer is reflecting on your answer...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Candidate Answer Input */}
            <div className="p-3 sm:p-4 border-t border-zinc-800/80 bg-[#080B11]/95 shrink-0">
              <form onSubmit={handleSendAnswer} className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputAnswer}
                  onChange={(e) => setInputAnswer(e.target.value)}
                  placeholder={
                    isListening
                      ? 'Listening... speak your answer now...'
                      : 'Type or speak your answer...'
                  }
                  disabled={loading || isConcluding}
                  className={`flex-1 bg-zinc-900 border rounded-xl px-4 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors disabled:opacity-50 ${
                    isListening
                      ? 'border-rose-500/80 bg-rose-950/10 placeholder-rose-300/70'
                      : 'border-zinc-800 focus:border-purple-500'
                  }`}
                />

                {/* Microphone Toggle Button */}
                {speechSupported && (
                  <button
                    type="button"
                    onClick={toggleListening}
                    disabled={loading || isConcluding}
                    title={isListening ? 'Stop recording' : 'Speak your answer'}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 shrink-0 ${
                      isListening
                        ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30 animate-pulse'
                        : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    {isListening ? (
                      <MicOff className="w-4 h-4 text-white" />
                    ) : (
                      <Mic className="w-4 h-4 text-purple-400" />
                    )}
                  </button>
                )}

                <button
                  type="submit"
                  disabled={loading || isConcluding || !inputAnswer.trim()}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-purple-600/20 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Submit</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 3. SCORECARD & FEEDBACK REPORT STATE */}
        {feedback && (
          <div className="space-y-6 my-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-white">Interview Scorecard</h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Target Role: <span className="text-purple-300 font-semibold">{roleTitle}</span>
                </p>
              </div>

              <button
                onClick={handleResetSession}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Practice Again</span>
              </button>
            </div>

            {/* Score Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                className={`p-5 rounded-xl border flex flex-col items-center justify-center text-center ${getScoreBadge(
                  feedback.overallScore
                )}`}
              >
                <span className="text-3xl font-black">{feedback.overallScore}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider mt-1">
                  Overall Score / 100
                </span>
                <span className="text-xs font-semibold mt-2 px-2.5 py-0.5 rounded-full bg-zinc-900/80 text-zinc-300 border border-zinc-700/60">
                  {feedback.verdict}
                </span>
              </div>

              <div
                className={`p-5 rounded-xl border flex flex-col items-center justify-center text-center ${getScoreBadge(
                  feedback.technicalScore
                )}`}
              >
                <span className="text-3xl font-black">{feedback.technicalScore}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider mt-1">
                  Technical Depth
                </span>
              </div>

              <div
                className={`p-5 rounded-xl border flex flex-col items-center justify-center text-center ${getScoreBadge(
                  feedback.communicationScore
                )}`}
              >
                <span className="text-3xl font-black">{feedback.communicationScore}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider mt-1">
                  Communication
                </span>
              </div>
            </div>

            {/* Evaluator Summary */}
            <div className="bg-[#0E131F] border border-zinc-800/80 rounded-xl p-5 shadow-lg space-y-2">
              <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-wider">
                Committee Summary
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {feedback.summary}
              </p>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#0E131F] border border-zinc-800/80 rounded-xl p-5 space-y-3 shadow-lg">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Key Strengths</span>
                </div>
                <ul className="space-y-2 text-xs text-zinc-300">
                  {feedback.strengths?.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#0E131F] border border-zinc-800/80 rounded-xl p-5 space-y-3 shadow-lg">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
                  <TrendingUp className="w-4 h-4" />
                  <span>Growth Areas</span>
                </div>
                <ul className="space-y-2 text-xs text-zinc-300">
                  {feedback.improvements?.map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}