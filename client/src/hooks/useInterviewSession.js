import { useState, useCallback } from 'react';
import {
  startInterviewApi,
  submitInterviewAnswerApi,
  finishInterviewApi,
  getInterviewDetailsApi,
} from '../api/interviewApi';

export const useInterviewSession = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState(null);

  const startSession = useCallback(async (role, interviewType) => {
    try {
      setLoading(true);
      setError(null);
      const data = await startInterviewApi({ role, interviewType });
      setSession(data);
      return data;
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to initialize interview.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendAnswer = useCallback(async (answerText) => {
    if (!session?._id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await submitInterviewAnswerApi({
        sessionId: session._id,
        answer: answerText,
      });
      setSession((prev) => ({
        ...prev,
        transcript: data.transcript,
      }));
      return data;
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to submit response.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [session]);

  const concludeInterview = useCallback(async () => {
    if (!session?._id) return;
    try {
      setEvaluating(true);
      setError(null);
      const data = await finishInterviewApi(session._id);
      setSession(data);
      return data;
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to complete interview evaluation.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setEvaluating(false);
    }
  }, [session]);

  const loadSession = useCallback(async (sessionId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInterviewDetailsApi(sessionId);
      setSession(data);
      return data;
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to load session details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    session,
    loading,
    evaluating,
    error,
    startSession,
    sendAnswer,
    concludeInterview,
    loadSession,
    clearError: () => setError(null),
  };
};