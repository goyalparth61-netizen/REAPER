export default function ReaperCoreIllustration({
  size = 240,
  active = true,
  className = ""
}) {
  const uid = "reaper-core-ill";

  return (
    <div
      className={`reaper-core-illustration-wrap ${active ? "active" : ""} ${className}`}
      style={{ width: size, height: size }}
      aria-label="REAPER Autonomous Obsidian Emerald AI Core"
    >
      <svg
        viewBox="0 0 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="reaper-core-svg"
      >
        <defs>
          {/* Deep Emerald Glow Filter */}
          <filter id={`${uid}-glow`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Soft Core Blur */}
          <filter id={`${uid}-core-blur`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Emerald-Mint Radial Plasma */}
          <radialGradient id={`${uid}-plasma`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor="#A1E9C9" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#42D6A4" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#18251E" stopOpacity="0" />
          </radialGradient>

          {/* Emerald-to-Mint Linear */}
          <linearGradient id={`${uid}-emerald-mint`} x1="0" y1="0" x2="320" y2="320" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A1E9C9" />
            <stop offset="50%" stopColor="#42D6A4" />
            <stop offset="100%" stopColor="#1D8E6C" />
          </linearGradient>

          {/* Champagne Gold Linear */}
          <linearGradient id={`${uid}-champagne-grad`} x1="320" y1="0" x2="0" y2="320" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E5D2A8" />
            <stop offset="60%" stopColor="#C9A96E" />
            <stop offset="100%" stopColor="#42D6A4" />
          </linearGradient>
        </defs>

        {/* Ambient Outer Halo */}
        <circle cx="160" cy="160" r="135" fill={`url(#${uid}-plasma)`} opacity="0.1" />

        {/* Layer 1: Hexagonal Perimeter */}
        <polygon
          points="160,32 268,94 268,226 160,288 52,226 52,94"
          stroke="rgba(66, 214, 164, 0.22)"
          strokeWidth="1.2"
          strokeDasharray="4 8"
          fill="none"
        />

        {/* Layer 2: Gyroscope Orbit A (Emerald slow rotation) */}
        <g className="core-orbit-a">
          <ellipse
            cx="160"
            cy="160"
            rx="118"
            ry="48"
            stroke={`url(#${uid}-emerald-mint)`}
            strokeWidth="1.6"
            strokeDasharray="18 10 40 10"
            fill="none"
            opacity="0.75"
          />
          <circle cx="278" cy="160" r="3.5" fill="#A1E9C9" filter={`url(#${uid}-glow)`} />
          <circle cx="42" cy="160" r="3.5" fill="#42D6A4" filter={`url(#${uid}-glow)`} />
        </g>

        {/* Layer 3: Gyroscope Orbit B (Champagne Gold counter-rotation) */}
        <g className="core-orbit-b">
          <ellipse
            cx="160"
            cy="160"
            rx="118"
            ry="48"
            stroke={`url(#${uid}-champagne-grad)`}
            strokeWidth="1.5"
            strokeDasharray="30 15 10 15"
            fill="none"
            opacity="0.65"
          />
          <circle cx="160" cy="112" r="3.5" fill="#C9A96E" />
          <circle cx="160" cy="208" r="3.5" fill="#A1E9C9" />
        </g>

        {/* Layer 4: Six Radial Coordinate Axes */}
        <g stroke="rgba(201, 169, 110, 0.25)" strokeWidth="1" strokeDasharray="3 4">
          <line x1="160" y1="50" x2="160" y2="120" />
          <line x1="160" y1="200" x2="160" y2="270" />
          <line x1="65" y1="105" x2="125" y2="140" />
          <line x1="195" y1="180" x2="255" y2="215" />
          <line x1="65" y1="215" x2="125" y2="180" />
          <line x1="195" y1="140" x2="255" y2="105" />
        </g>

        {/* Outer Boundary Sensor Nodes */}
        <circle cx="160" cy="32" r="4" fill="#101713" stroke="#42D6A4" strokeWidth="2" />
        <circle cx="268" cy="94" r="4" fill="#101713" stroke="#C9A96E" strokeWidth="2" />
        <circle cx="268" cy="226" r="4" fill="#101713" stroke="#42D6A4" strokeWidth="2" />
        <circle cx="160" cy="288" r="4" fill="#101713" stroke="#C9A96E" strokeWidth="2" />
        <circle cx="52" cy="226" r="4" fill="#101713" stroke="#42D6A4" strokeWidth="2" />
        <circle cx="52" cy="94" r="4" fill="#101713" stroke="#C9A96E" strokeWidth="2" />

        {/* Layer 5: Concentric Quantum Containment Rings */}
        <circle
          cx="160"
          cy="160"
          r="68"
          stroke="rgba(66, 214, 164, 0.35)"
          strokeWidth="1.5"
          strokeDasharray="6 6"
          fill="rgba(24, 37, 30, 0.75)"
        />
        <circle
          cx="160"
          cy="160"
          r="48"
          stroke="rgba(201, 169, 110, 0.45)"
          strokeWidth="1.2"
          fill="rgba(29, 48, 38, 0.85)"
        />

        {/* Layer 6: Central Computational Nucleus */}
        <g className="core-faceted-nucleus">
          <circle cx="160" cy="160" r="34" fill={`url(#${uid}-plasma)`} opacity="0.4" filter={`url(#${uid}-glow)`} />

          {/* Outer Hex Core */}
          <polygon
            points="160,126 189,143 189,177 160,194 131,177 131,143"
            fill={`url(#${uid}-emerald-mint)`}
            fillOpacity="0.85"
            stroke="#E8E6DD"
            strokeWidth="1.2"
            strokeOpacity="0.6"
          />

          {/* Inner Diamond */}
          <polygon
            points="160,136 178,160 160,184 142,160"
            fill={`url(#${uid}-champagne-grad)`}
            fillOpacity="0.9"
            stroke="#A1E9C9"
            strokeWidth="1.5"
          />

          {/* Singularity Center Point */}
          <circle cx="160" cy="160" r="5" fill="#FFFFFF" filter={`url(#${uid}-core-blur)`} />
        </g>
      </svg>
    </div>
  );
}
