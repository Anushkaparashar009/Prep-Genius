import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';

const STORAGE_KEY = 'pg_cookie_consent_v1';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setVisible(true);
    }
  }, []);

  const savePreference = (level) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        level,
        updatedAt: new Date().toISOString(),
      })
    );
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie and local storage preferences"
      className="fixed bottom-4 left-4 right-4 z-50 max-w-3xl mx-auto bg-[#0E131F] border border-zinc-700 rounded-2xl p-4 sm:p-5 shadow-2xl text-zinc-200"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5 text-xs leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <Cookie className="w-4 h-4 text-purple-400 shrink-0" aria-hidden="true" />
            <span>Storage & Cookie Preferences</span>
          </div>
          <p className="text-zinc-300">
            We use essential browser storage to keep you signed in and save your in-progress code drafts locally. Optional performance diagnostics help us improve page speed. Read our{' '}
            <Link
              to="/cookies"
              className="text-purple-300 underline hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded"
            >
              Cookie Policy
            </Link>
            .
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => savePreference('essential')}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-zinc-100 text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          >
            Essential Only
          </button>
          <button
            type="button"
            onClick={() => savePreference('all')}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 border border-purple-500 text-white text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}