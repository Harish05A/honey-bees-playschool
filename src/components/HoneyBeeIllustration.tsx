import React from 'react';

// Friendly, sophisticated Bee Logo Icon
export const BeeLogoIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <ellipse cx="38" cy="32" rx="14" ry="22" transform="rotate(-30 38 32)" fill="#BAE6FD" opacity="0.85" />
    <ellipse cx="62" cy="32" rx="14" ry="22" transform="rotate(30 62 32)" fill="#BAE6FD" opacity="0.85" />
    <ellipse cx="50" cy="58" rx="26" ry="28" fill="#F59E0B" />
    <path d="M26 52C32 50 68 50 74 52C73 57 70 61 66 64C56 63 44 63 34 64C30 61 27 57 26 52Z" fill="#1E293B" />
    <path d="M29 68C34 67 66 67 71 68C68 73 63 78 57 81C52 82 48 82 43 81C37 78 32 73 29 68Z" fill="#1E293B" />
    <circle cx="50" cy="34" r="16" fill="#F59E0B" />
    <circle cx="44" cy="32" r="2.5" fill="#1E293B" />
    <circle cx="56" cy="32" r="2.5" fill="#1E293B" />
    <path d="M46 38C48 40 52 40 54 38" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
    <path d="M44 19C42 14 38 12 36 14" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M56 19C58 14 62 12 64 14" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="36" cy="14" r="2" fill="#1E293B" />
    <circle cx="64" cy="14" r="2" fill="#1E293B" />
  </svg>
);

// Storybook Wavy Flight Path SVG
export const StorybookFlightPath: React.FC<{ className?: string }> = ({ className = "w-full h-16" }) => (
  <svg viewBox="0 0 500 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M10 60 C 120 10, 220 75, 340 20 C 400 -5, 470 45, 490 25"
      stroke="#D97706"
      strokeWidth="2.5"
      strokeDasharray="6 6"
      strokeLinecap="round"
      className="animate-dash"
      opacity="0.45"
    />
  </svg>
);

// Hand-drawn Honeycomb Tile Stamp
export const HoneycombStamp: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <polygon points="30,5 52,17 52,42 30,55 8,42 8,17" stroke="#F59E0B" strokeWidth="2" fill="#FEF9C3" opacity="0.6" />
    <circle cx="30" cy="30" r="4" fill="#D97706" opacity="0.8" />
  </svg>
);
