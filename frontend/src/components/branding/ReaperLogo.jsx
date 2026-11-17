import ReaperMascotLogo from "./ReaperMascotLogo";

export default function ReaperLogo({
  size = 36,
  variant = "dark",
  showSubtitle = true,
  className = "",
  glow = true
}) {
  const isLight = variant === "light";

  return (
    <div className={`reaper-brand-lockup ${variant} ${className}`}>
      <div className="reaper-symbol-wrapper">
        <ReaperMascotLogo size={size} glow={glow} />
      </div>

      <div className="reaper-wordmark-wrapper">
        <span
          className="reaper-wordmark-title"
          style={{
            fontSize: `${Math.max(16, size * 0.48)}px`,
            color: isLight ? "#18251E" : "#E8E6DD",
            fontFamily: "'Space Grotesk', 'Sora', sans-serif",
            fontWeight: 800,
            letterSpacing: "1.8px",
            lineHeight: 1.1
          }}
        >
          REAPER
        </span>

        {showSubtitle && (
          <span
            className="reaper-wordmark-subtitle"
            style={{
              fontSize: `${Math.max(8, size * 0.22)}px`,
              color: isLight ? "#1D8E6C" : "#C9A96E",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              letterSpacing: "1.4px",
              lineHeight: 1.2
            }}
          >
            AUTONOMOUS SOFTWARE REPAIR ENGINE
          </span>
        )}
      </div>
    </div>
  );
}
