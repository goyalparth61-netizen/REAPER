import { useId } from "react";

export default function ReaperSymbol({ size = 32, className = "", animated = false }) {
  const reactId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const uid = `reaper-sym-${reactId}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`reaper-symbol-svg ${animated ? "animated-pulse" : ""} ${className}`}
      aria-label="REAPER Obsidian Emerald Brand Symbol"
    >
      <defs>
        {/* Emerald Primary Gradient */}
        <linearGradient id={`${uid}-emerald`} x1="12" y1="8" x2="48" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A1E9C9" />
          <stop offset="50%" stopColor="#42D6A4" />
          <stop offset="100%" stopColor="#1D8E6C" />
        </linearGradient>

        {/* Champagne Accent Gradient */}
        <linearGradient id={`${uid}-champagne`} x1="52" y1="20" x2="20" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E5D2A8" />
          <stop offset="50%" stopColor="#C9A96E" />
          <stop offset="100%" stopColor="#8F713B" />
        </linearGradient>

        {/* Crystalline Core Gradient */}
        <linearGradient id={`${uid}-core`} x1="26" y1="26" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="45%" stopColor="#A1E9C9" />
          <stop offset="85%" stopColor="#42D6A4" />
          <stop offset="100%" stopColor="#C9A96E" />
        </linearGradient>

        <filter id={`${uid}-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Wing 1: Ingestion & Static Analysis (Emerald) */}
      <path
        d="M32 6L48 15.2V27.5L38.4 22L32 18.3L25.6 22L16 16.5L32 6Z"
        fill={`url(#${uid}-emerald)`}
      />
      <path
        d="M16 16.5L25.6 22V34.5L16 40V16.5Z"
        fill={`url(#${uid}-emerald)`}
        fillOpacity="0.9"
      />

      {/* Wing 2: Patch Synthesis Matrix (Mint & Champagne) */}
      <path
        d="M48 15.2L48 40L38.4 45.5L38.4 33.2L48 27.5V15.2Z"
        fill={`url(#${uid}-emerald)`}
      />
      <path
        d="M48 40L32 49.2L38.4 53L48 47.5L54 44L48 40Z"
        fill={`url(#${uid}-champagne)`}
        fillOpacity="0.88"
      />

      {/* Wing 3: Hermetic Sandbox Validation Strut (Champagne) */}
      <path
        d="M32 49.2L16 40L21.6 36.8L32 42.8L42.4 36.8L42.4 43.2L32 49.2Z"
        fill={`url(#${uid}-champagne)`}
      />
      <path
        d="M32 58L16 48.8L21.6 45.6L32 51.6L42.4 45.6L48 48.8L32 58Z"
        fill={`url(#${uid}-emerald)`}
        fillOpacity="0.85"
      />

      {/* Synapse Beams */}
      <line x1="32" y1="18" x2="32" y2="28" stroke="#42D6A4" strokeWidth="1.75" strokeLinecap="round" />
      <line x1="25.6" y1="34" x2="32" y2="34" stroke="#A1E9C9" strokeWidth="1.75" strokeLinecap="round" />
      <line x1="38.4" y1="34" x2="44.8" y2="34" stroke="#C9A96E" strokeWidth="1.75" strokeLinecap="round" />

      {/* Autonomous Nucleus Core */}
      <polygon
        points="32,27 37,30 37,36 32,39 27,36 27,30"
        fill={`url(#${uid}-core)`}
        filter={`url(#${uid}-glow)`}
      />
      <circle cx="32" cy="33" r="2.2" fill="#E8E6DD" />
    </svg>
  );
}
