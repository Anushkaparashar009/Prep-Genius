export const Logo = ({ size = 'md' }) => {
  const config = {
    sm: { box: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-sm' },
    md: { box: 'w-10 h-10', icon: 'w-5 h-5', text: 'text-base' },
    lg: { box: 'w-12 h-12', icon: 'w-6 h-6', text: 'text-lg' },
  }[size] || { box: 'w-10 h-10', icon: 'w-5 h-5', text: 'text-base' };

  return (
    <div
      className="flex items-center gap-3 select-none"
      role="img"
      aria-label="PrepGenius Technical Interview Preparation Platform Logo"
    >
      {/* Glow Badge Container */}
      <div
        className={`relative ${config.box} rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-[1.5px] shadow-lg shadow-indigo-500/25 shrink-0`}
      >
        <div className="w-full h-full bg-[#0b101e] rounded-[10px] flex items-center justify-center">
          <svg
            aria-hidden="true"
            className={`${config.icon} text-indigo-400`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="4 17 10 12 4 7" className="stroke-indigo-400" />
            <line x1="12" y1="19" x2="20" y2="19" className="stroke-purple-400" strokeDasharray="3 3" />
            <circle cx="17" cy="8" r="2" className="fill-pink-400 stroke-pink-400" />
          </svg>
        </div>
      </div>

      {/* Brand Typography */}
      <div className="flex items-center leading-none">
        <span className={`font-mono font-black tracking-tight text-white ${config.text}`}>
          PREP
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            GENIUS
          </span>
        </span>
      </div>
    </div>
  );
};