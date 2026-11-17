import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-[#070A10] text-zinc-300 text-xs mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Brand & Transparent Pricing */}
          <div className="space-y-2">
            <div className="font-mono font-extrabold tracking-wider text-white text-sm">
              PREP<span className="text-purple-400">GENIUS</span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              Structured technical interview practice for students and early-career engineers. Free core access with no hidden fees or surprise charges.
            </p>
          </div>

          {/* Legal & Policies */}
          <div className="space-y-2">
            <h3 className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Legal & Privacy
            </h3>
            <ul className="space-y-1.5">
              <li>
                <Link
                  to="/privacy"
                  className="text-zinc-300 hover:text-white underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-zinc-300 hover:text-white underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies"
                  className="text-zinc-300 hover:text-white underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Business & Support Contact */}
          <div className="space-y-2">
            <h3 className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Contact & Support
            </h3>
            <div className="space-y-1.5 text-zinc-300">
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" aria-hidden="true" />
                <a
                  href="mailto:support@prepgenius.app"
                  className="hover:text-white underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded"
                >
                  support@prepgenius.app
                </a>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" aria-hidden="true" />
                <span>PrepGenius EdTech, Gwalior, MP 474001, India</span>
              </p>
              <p className="flex items-center gap-2 text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                <span>Users 13+ only • Full data deletion supported</span>
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-zinc-400">
          <p>&copy; {new Date().getFullYear()} PrepGenius. All rights reserved.</p>
          <p>Built with open-source tools (MIT / Apache-2.0 / ISC licensed).</p>
        </div>
      </div>
    </footer>
  );
}