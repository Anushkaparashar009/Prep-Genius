import { useState, useCallback } from 'react';
import { analyzeResumeApi, getResumeHistoryApi } from '../api/resumeApi';

export const useResumeAuditor = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [auditResult, setAuditResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const res = await getResumeHistoryApi();
      setHistory(res.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch resume audit history.');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const runAudit = useCallback(async (file, targetRole) => {
    if (!file) {
      setError('Please select a valid PDF file.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await analyzeResumeApi(file, targetRole);
      setAuditResult(res.data);
      // Automatically refresh history after new evaluation
      await fetchHistory();
      return res.data;
    } catch (err) {
      const message = err?.response?.data?.message || 'Resume audit failed. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [fetchHistory]);

  return {
    loading,
    error,
    auditResult,
    history,
    historyLoading,
    runAudit,
    fetchHistory,
    clearError: () => setError(null),
  };
};