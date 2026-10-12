import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Terminal, Code2, FileCheck2, LayoutDashboard, Bot, User } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Problem Hub', path: '/problems', icon: Code2 },
    { label: 'ATS Resume Audit', path: '/resume', icon: FileCheck2 },
    { label: 'Adaptive Mock', path: '/interview', icon: Bot },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#08090c]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Brand */}
        <Link to="/dashboard" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-500/30 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <Terminal className="h-4 w-4" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold tracking-tight text-white">PrepGenius</span>
            <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-indigo-400 border border-indigo-500/20">
              v2.0
            </span>
          </div>
        </Link>

        {/* Center Nav items */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(`${item.path}/`)) ||
              (item.path === '/problems' && location.pathname.startsWith('/tutor'));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'border border-white/10 bg-white/[0.05] text-white shadow-inner'
                    : 'text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-indigo-400' : 'text-zinc-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Status pill */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-mono text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Sandbox Active
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-zinc-300">
            <User className="h-4 w-4" />
          </div>
        </div>

      </div>
    </header>
  );
};

export default Navbar;