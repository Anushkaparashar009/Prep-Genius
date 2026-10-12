import { useState, useCallback } from 'react';
import {
  sendTutorMessageApi,
  getTutorHistoryApi,
  resetTutorSessionApi,
} from '../api/tutorApi';

export const useTutorChat = (problemId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    if (!problemId) return;
    try {
      setError(null);
      const data = await getTutorHistoryApi(problemId);
      setMessages(data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load tutor history.');
    }
  }, [problemId]);

  const sendMessage = useCallback(
    async (messageText, userCode = '', language = 'cpp') => {
      if (!messageText.trim()) return;

      // Optimistic user bubble
      const optimisticMsg = { role: 'user', content: messageText };
      setMessages((prev) => [...prev, optimisticMsg]);

      try {
        setLoading(true);
        setError(null);
        const data = await sendTutorMessageApi({
          problemId,
          message: messageText,
          userCode,
          language,
        });
        setMessages(data.messages || []);
      } catch (err) {
        const msg = err?.response?.data?.message || 'Tutor failed to respond.';
        setError(msg);
        // Roll back optimistic message on failure
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setLoading(false);
      }
    },
    [problemId]
  );

  const clearChat = useCallback(async () => {
    if (!problemId) return;
    try {
      await resetTutorSessionApi(problemId);
      setMessages([]);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to reset tutor session.');
    }
  }, [problemId]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    fetchHistory,
    clearChat,
    clearError: () => setError(null),
  };
};