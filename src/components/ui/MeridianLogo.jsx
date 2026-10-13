import React from 'react';

export const MeridianLogo = ({ className = "h-10 w-auto", iconOnly = false, variant = "light" }) => {
  const isLight = variant === "light"; // light text for dark backgrounds
  const textColor = isLight ? "text-amber-100" : "text-emerald-950";
  const subTextColor = isLight ? "text-amber-400/80" : "text-emerald-700";

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <svg className="h-10 w-10 flex-shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="goldGradLogo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f7e7b4" />
            <stop offset="50%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#996515" />
          </linearGradient>
          <linearGradient id="greenGradLogo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#123d29" />
            <stop offset="100%" stopColor="#06180e" />
          </linearGradient>
        </defs>
        {/* Shield background */}
        <rect x="4" y="4" width="92" height="92" rx="14" fill="url(#greenGradLogo)" stroke="url(#goldGradLogo)" strokeWidth="3.5" />
        <rect x="9" y="9" width="82" height="82" rx="10" fill="none" stroke="url(#goldGradLogo)" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />

        {/* Pillar Temple Roof */}
        <path d="M 24 32 L 50 17 L 76 32 Z" fill="url(#goldGradLogo)" />
        <rect x="22" y="32" width="56" height="4" rx="1" fill="url(#goldGradLogo)" />

        {/* Pillars */}
        <rect x="27" y="38" width="6" height="27" rx="1" fill="url(#goldGradLogo)" />
        <rect x="40" y="38" width="6" height="27" rx="1" fill="url(#goldGradLogo)" />
        <rect x="54" y="38" width="6" height="27" rx="1" fill="url(#goldGradLogo)" />
        <rect x="67" y="38" width="6" height="27" rx="1" fill="url(#goldGradLogo)" />

        {/* Base */}
        <rect x="22" y="65" width="56" height="4" rx="1" fill="url(#goldGradLogo)" />
        <rect x="17" y="69" width="66" height="5" rx="1.5" fill="url(#goldGradLogo)" />
      </svg>
      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <span className={`font-serif text-xl font-bold tracking-wider ${textColor}`}>
            CITIGATE
          </span>
          <span className={`font-serif text-[10px] uppercase tracking-[0.25em] font-medium ${subTextColor}`}>
            CitiGate Bank • Est. 1898
          </span>
        </div>
      )}
    </div>
  );
};

export default MeridianLogo;
