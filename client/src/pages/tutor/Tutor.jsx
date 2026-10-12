import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTutorChat } from '../../hooks/useTutorChat';
import { 
  fetchUserSessions, 
  fetchSessionById, 
  deleteUserSession 
} from '../../api/tutorApi';
import { fetchAllProblems, fetchProblemBySlug } from '../../api/problems';
import { runCodeSnippet, submitCodeSolution } from '../../api/code';
import MarkdownRenderer from '../../components/common/MarkdownRenderer';
import CodeEditor from './CodeEditor';
import TutorActions from './TutorActions';
import ProblemDescription from './ProblemDescription';
import { 
  Terminal, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Send, 
  Sparkles, 
  PanelLeftClose, 
  PanelLeft,
  Code,
  BookOpen,
  MessageSquare,
  X,
  ChevronDown,
  Check
} from 'lucide-react';

export default function Tutor() {
  const navigate = useNavigate();
  const { slug: routeSlug } = useParams();

  // Sessions & History State
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const [fetchingHistory, setFetchingHistory] = useState(false);

  // Problem State
  const [problems, setProblems] = useState([]);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [loadingProblem, setLoadingProblem] = useState(false);
  const [problemDropdownOpen, setProblemDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Hook-driven Chat Engine
  const {
    messages,
    loading,
    error: tutorError,
    sendMessage,
    fetchHistory,
    clearChat,
  } = useTutorChat(currentProblem?._id);

  // Responsive Layout & Panes
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [showProblemDesktop, setShowProblemDesktop] = useState(true);
  const [showEditorDesktop, setShowEditorDesktop] = useState(true);
  const [mobileActiveTab, setMobileActiveTab] = useState('code');

  // Percentage widths for desktop
  const [problemWidth, setProblemWidth] = useState(28);
  const [editorWidth, setEditorWidth] = useState(38);
  const isDraggingRef = useRef(null);
  const workspaceContainerRef = useRef(null);

  // Code & Sandbox Execution State
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProblemDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    loadSessions();
    loadProblems();
  }, [routeSlug]);

  useEffect(() => {
    if (currentProblem?._id) {
      fetchHistory();
    }
  }, [currentProblem?._id, fetchHistory]);

  useEffect(() => {
    if (mobileActiveTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, loading, mobileActiveTab]);

  const getStorageKey = (slug, lang) => `pg_code_${slug}_${lang}`;

  const loadSavedOrStarterCode = (problem, lang) => {
    if (!problem) return '';
    const key = getStorageKey(problem.slug, lang);
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      return saved;
    }
    return problem.starterCode?.[lang] || '';
  };

  const handleMouseDown = (dividerId) => (e) => {
    e.preventDefault();
    isDraggingRef.current = dividerId;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingRef.current || !workspaceContainerRef.current) return;

    const rect = workspaceContainerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const totalWidth = rect.width;
    const mousePercent = (mouseX / totalWidth) * 100;

    if (isDraggingRef.current === 'divider1') {
      const newProblemWidth = Math.min(Math.max(mousePercent, 18), 45);
      setProblemWidth(newProblemWidth);
    } else if (isDraggingRef.current === 'divider2') {
      const baseProblem = showProblemDesktop ? problemWidth : 0;
      const calculatedEditor = mousePercent - baseProblem;
      const newEditorWidth = Math.min(Math.max(calculatedEditor, 25), 82 - baseProblem);
      setEditorWidth(newEditorWidth);
    }
  }, [problemWidth, showProblemDesktop]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = null;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const loadSessions = async () => {
    try {
      const data = await fetchUserSessions();
      setSessions(Array.isArray(data) ? data : data?.sessions || []);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
  };

  const loadProblems = async () => {
    setLoadingProblem(true);
    try {
      const problemList = await fetchAllProblems();
      setProblems(problemList || []);
      if (problemList && problemList.length > 0) {
        const targetSlug = routeSlug || problemList[0].slug;
        await handleSelectProblem(targetSlug, false);
      }
    } catch (err) {
      console.error('Failed to load problem listing:', err);
    } finally {
      setLoadingProblem(false);
    }
  };

  const handleSelectProblem = async (slug, updateRoute = true) => {
    setLoadingProblem(true);
    setProblemDropdownOpen(false);
    try {
      const problemData = await fetchProblemBySlug(slug);
      setCurrentProblem(problemData);
      
      const initialCode = loadSavedOrStarterCode(problemData, language);
      setCode(initialCode);
      setExecutionResult(null);
      setSubmissionResult(null);

      if (updateRoute && slug !== routeSlug) {
        navigate(`/tutor/${slug}`, { replace: true });
      }
    } catch (err) {
      console.error('Failed to retrieve problem details:', err);
    } finally {
      setLoadingProblem(false);
    }
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (currentProblem) {
      localStorage.setItem(getStorageKey(currentProblem.slug, language), newCode);
    }
  };

  const handleLanguageChangeWithProblem = (newLang) => {
    setLanguage(newLang);
    if (currentProblem) {
      const updatedCode = loadSavedOrStarterCode(currentProblem, newLang);
      setCode(updatedCode);
    }
  };

  const handleResetCode = () => {
    if (!currentProblem) return;
    const starter = currentProblem.starterCode?.[language] || '';
    localStorage.removeItem(getStorageKey(currentProblem.slug, language));
    setCode(starter);
  };

  const handleSelectSession = async (sessionId) => {
    if (sessionId === currentSessionId) return;
    setFetchingHistory(true);
    try {
      const sessionData = await fetchSessionById(sessionId);
      setCurrentSessionId(sessionData._id);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    } catch (err) {
      console.error('Failed to retrieve session:', err);
    } finally {
      setFetchingHistory(false);
    }
  };

  const handleNewChat = async () => {
    setCurrentSessionId(null);
    setInputMessage('');
    await clearChat();
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    try {
      await deleteUserSession(sessionId);
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
      if (currentSessionId === sessionId) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const handleRunCode = async () => {
    if (!code.trim() || isExecuting || isSubmitting) return;

    setIsExecuting(true);
    try {
      const res = await runCodeSnippet(language, code, {
        problemId: currentProblem?._id,
        slug: currentProblem?.slug,
      });
      setExecutionResult(res);
    } catch (err) {
      console.error('Code execution failed:', err);
      setExecutionResult({
        success: false,
        exitCode: 1,
        stdout: '',
        stderr: err.response?.data?.message || err.message || 'Execution error encountered.',
        isCompileError: false,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!code.trim() || !currentProblem || isExecuting || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await submitCodeSolution({
        problemId: currentProblem._id,
        slug: currentProblem.slug,
        language,
        code,
      });
      setSubmissionResult(res);
    } catch (err) {
      console.error('Submission failed:', err);
      setSubmissionResult({
        verdict: 'Submission Failed',
        passed: false,
        totalTestCases: 0,
        passedTestCases: 0,
        compileError: err.response?.data?.message || err.message || 'Failed to submit code.',
        results: [],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeSend = async (userText, includeCodeContext = false) => {
    if (!userText.trim() || loading) return;
    await sendMessage(
      userText.trim(),
      includeCodeContext ? code : '',
      includeCodeContext ? language : 'cpp'
    );
    loadSessions();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    const text = inputMessage.trim();
    setInputMessage('');
    executeSend(text, Boolean(code && code.trim()));
  };

  const handleAnalyzeCode = () => {
    if (window.innerWidth < 768) {
      setMobileActiveTab('chat');
    }
    const prompt = currentProblem
      ? `I am working on "${currentProblem.title}". Review my approach against the constraints and test cases, and guide me on edge cases or potential bottlenecks.`
      : 'Please analyze my current code implementation and guide me on best practices.';
    
    executeSend(prompt, true);
  };

  const handleTriggerAction = (promptText) => {
    executeSend(promptText, Boolean(code && code.trim()));
  };

  const handleClearConsole = () => {
    setExecutionResult(null);
    setSubmissionResult(null);
  };

  return (
    <div className="relative flex h-screen bg-[#080B11] text-zinc-100 font-sans selection:bg-purple-600/30 overflow-hidden">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar: Past Sessions Drawer */}
      <aside
        className={`fixed md:relative top-0 bottom-0 left-0 z-50 transition-all duration-300 ease-in-out border-zinc-800/80 bg-[#0B0F19] flex flex-col overflow-hidden shrink-0 ${
          sidebarOpen 
            ? 'w-72 border-r translate-x-0' 
            : 'w-0 border-r-0 -translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-3.5 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-purple-600 p-1 rounded-md">
              <Terminal className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-bold tracking-wider text-zinc-300 uppercase">Prep History</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleNewChat}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 text-zinc-400 hover:text-zinc-200 md:hidden cursor-pointer"
              title="Close Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.length === 0 ? (
            <p className="text-xs text-zinc-500 p-4 text-center">No past prep sessions yet.</p>
          ) : (
            sessions.map((session) => (
              <div
                key={session._id}
                onClick={() => handleSelectSession(session._id)}
                className={`flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-colors group ${
                  currentSessionId === session._id
                    ? 'bg-zinc-800/90 text-purple-300 font-medium border border-zinc-700/60'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
              >
                <span className="truncate pr-2">{session.title || 'Untitled Session'}</span>
                <button
                  onClick={(e) => handleDeleteSession(e, session._id)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-400 p-1 rounded transition-opacity cursor-pointer"
                  title="Delete Session"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col h-full bg-[#080B11] min-w-0 w-full overflow-hidden">
        {/* Workspace Top Header */}
        <header className="h-12 sm:h-14 border-b border-zinc-800/80 px-2 sm:px-4 flex items-center justify-between bg-[#080B11]/90 backdrop-blur-md sticky top-0 z-30 shrink-0 gap-1.5">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <button
              onClick={() => navigate('/problems')}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg transition-colors shrink-0 cursor-pointer"
              title="Back to Problems"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg transition-colors shrink-0 cursor-pointer"
              title={sidebarOpen ? 'Hide History' : 'Show History'}
            >
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            </button>
            
            {/* Problem Switcher Dropdown */}
            <div className="relative min-w-0" ref={dropdownRef}>
              <button
                onClick={() => setProblemDropdownOpen(!problemDropdownOpen)}
                className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] sm:text-xs font-semibold text-zinc-200 transition-colors cursor-pointer max-w-[110px] xs:max-w-[140px] sm:max-w-xs"
              >
                <span className="truncate">{currentProblem ? currentProblem.title : 'Problem'}</span>
                <ChevronDown className="w-3 h-3 text-zinc-400 shrink-0" />
              </button>

              {problemDropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-60 sm:w-64 bg-[#0E131F] border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-zinc-500 border-b border-zinc-800/60">
                    Switch Problem
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {problems.map((p) => {
                      const isSelected = currentProblem?.slug === p.slug;
                      return (
                        <button
                          key={p.slug}
                          onClick={() => handleSelectProblem(p.slug, true)}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-zinc-800/60 transition-colors cursor-pointer ${
                            isSelected ? 'bg-purple-950/30 text-purple-300 font-medium' : 'text-zinc-300'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <div className="truncate">{p.title}</div>
                            <div className="text-[10px] text-zinc-500">{p.category}</div>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            p.difficulty === 'Easy' 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : p.difficulty === 'Medium' 
                              ? 'bg-amber-500/10 text-amber-400' 
                              : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {p.difficulty}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-600/10 border border-purple-500/20 text-[10px] font-mono text-purple-400 shrink-0">
              <Sparkles className="w-3 h-3" /> CodePilot Active
            </span>
          </div>

          <div className="flex items-center shrink-0">
            {/* Desktop Panel Toggles */}
            <div className="hidden md:flex items-center gap-1.5">
              <button
                onClick={() => setShowProblemDesktop(!showProblemDesktop)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  showProblemDesktop 
                    ? 'bg-purple-600/15 border-purple-500/30 text-purple-300' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Problem</span>
              </button>

              <button
                onClick={() => setShowEditorDesktop(!showEditorDesktop)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  showEditorDesktop 
                    ? 'bg-purple-600/15 border-purple-500/30 text-purple-300' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Editor</span>
              </button>
            </div>

            {/* Mobile Viewport Tabs */}
            <div className="flex md:hidden items-center bg-zinc-900 border border-zinc-800/90 rounded-lg p-0.5">
              <button
                onClick={() => setMobileActiveTab('problem')}
                className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors cursor-pointer ${
                  mobileActiveTab === 'problem'
                    ? 'bg-purple-600 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Problem
              </button>
              <button
                onClick={() => setMobileActiveTab('code')}
                className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors cursor-pointer ${
                  mobileActiveTab === 'code'
                    ? 'bg-purple-600 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Code
              </button>
              <button
                onClick={() => setMobileActiveTab('chat')}
                className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors cursor-pointer ${
                  mobileActiveTab === 'chat'
                    ? 'bg-purple-600 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Chat
              </button>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div 
          ref={workspaceContainerRef} 
          className="flex-1 flex overflow-hidden min-h-0 relative select-text"
        >
          {/* PROBLEM PANEL */}
          <div
            style={{ width: window.innerWidth >= 768 ? `${problemWidth}%` : '100%' }}
            className={`h-full overflow-hidden shrink-0 ${
              mobileActiveTab === 'problem' ? 'flex flex-col w-full' : 'hidden'
            } ${showProblemDesktop ? 'md:flex md:flex-col' : 'md:hidden'}`}
          >
            <ProblemDescription
              problems={problems}
              currentProblem={currentProblem}
              onSelectProblem={(s) => handleSelectProblem(s, true)}
              loading={loadingProblem}
            />
          </div>

          {/* DIVIDER 1: Desktop only */}
          {showProblemDesktop && showEditorDesktop && (
            <div
              onMouseDown={handleMouseDown('divider1')}
              className="hidden md:flex w-1 hover:w-1.5 bg-zinc-800/80 hover:bg-purple-500/80 transition-all cursor-col-resize items-center justify-center group z-30 shrink-0"
              title="Drag to resize Problem panel"
            >
              <div className="w-0.5 h-6 bg-zinc-600 group-hover:bg-white rounded-full"></div>
            </div>
          )}

          {/* CODE EDITOR PANEL */}
          <div
            style={{
              width: window.innerWidth >= 768
                ? showProblemDesktop ? `${editorWidth}%` : `${editorWidth + problemWidth * 0.5}%`
                : '100%'
            }}
            className={`h-full overflow-hidden shrink-0 ${
              mobileActiveTab === 'code' ? 'flex flex-col w-full' : 'hidden'
            } ${showEditorDesktop ? 'md:flex md:flex-col' : 'md:hidden'}`}
          >
            <CodeEditor
              language={language}
              setLanguage={handleLanguageChangeWithProblem}
              code={code}
              setCode={handleCodeChange}
              onResetCode={handleResetCode}
              onAskAboutCode={handleAnalyzeCode}
              onRunCode={handleRunCode}
              onSubmitCode={handleSubmitCode}
              isAiAnalyzing={loading}
              isExecuting={isExecuting}
              isSubmitting={isSubmitting}
              executionResult={executionResult}
              submissionResult={submissionResult}
              onClearConsole={handleClearConsole}
            />
          </div>

          {/* DIVIDER 2: Desktop only */}
          {showEditorDesktop && (
            <div
              onMouseDown={handleMouseDown('divider2')}
              className="hidden md:flex w-1 hover:w-1.5 bg-zinc-800/80 hover:bg-purple-500/80 transition-all cursor-col-resize items-center justify-center group z-30 shrink-0"
              title="Drag to resize Editor panel"
            >
              <div className="w-0.5 h-6 bg-zinc-600 group-hover:bg-white rounded-full"></div>
            </div>
          )}

          {/* CODEPILOT CHAT PANEL */}
          <div
            className={`flex-1 flex flex-col h-full bg-[#080B11] min-w-0 overflow-hidden ${
              mobileActiveTab === 'chat' ? 'flex w-full' : 'hidden'
            } md:flex`}
          >
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3.5">
              {fetchingHistory ? (
                <div className="flex justify-center items-center h-full text-zinc-500 text-xs">
                  Loading session thread...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto px-4 text-zinc-400">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-2.5 shadow-lg shadow-purple-950/30">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-zinc-200 mb-1">
                    {currentProblem ? `Ready for ${currentProblem.title}?` : 'CodePilot Deliberate Practice'}
                  </h3>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Test with <span className="text-emerald-400 font-semibold">Run</span>, validate with <span className="text-emerald-400 font-semibold">Submit</span>, or consult <span className="text-purple-400 font-semibold">CodePilot</span> for logic guidance.
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isAssistant = msg.role === 'assistant';
                  return (
                    <div
                      key={index}
                      className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[94%] sm:max-w-[85%] rounded-xl p-3 sm:p-4 text-xs sm:text-sm leading-relaxed shadow-md ${
                          isAssistant
                            ? 'bg-[#0E131F] border border-zinc-800 text-zinc-200'
                            : 'bg-purple-600 text-white font-medium'
                        }`}
                      >
                        {isAssistant ? (
                          <>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-2">
                              <Sparkles className="w-3 h-3" /> CodePilot AI
                            </div>
                            <MarkdownRenderer content={msg.content} />
                          </>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#0E131F] border border-zinc-800 rounded-xl p-3 text-xs text-zinc-400 flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse delay-75"></span>
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse delay-150"></span>
                    <span className="text-xs ml-2 text-zinc-400">CodePilot is thinking...</span>
                  </div>
                </div>
              )}

              {tutorError && (
                <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900 text-xs text-rose-300">
                  {tutorError}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input & Action Pills Area */}
            <div className="p-2.5 sm:p-3 border-t border-zinc-800/80 bg-[#080B11]/95 backdrop-blur-md shrink-0 space-y-2">
              <div className="max-w-4xl mx-auto overflow-x-auto pb-1 no-scrollbar">
                <TutorActions 
                  onTriggerAction={handleTriggerAction} 
                  disabled={loading} 
                />
              </div>

              <form onSubmit={handleFormSubmit} className="flex items-center gap-1.5 sm:gap-2 max-w-4xl mx-auto">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask CodePilot a question or explain your approach..."
                  disabled={loading}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim()}
                  className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-md shadow-purple-600/20 shrink-0 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}