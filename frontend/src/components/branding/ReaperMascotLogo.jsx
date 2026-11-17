export default function ReaperMascotLogo({
  size = 36,
  className = "",
  glow = true,
  float = false,
  animated = true,
  alt = "REAPER Mascot — Autonomous Software Repair Engine"
}) {
  return (
    <div
      className={`reaper-mascot-container ${glow ? "has-glow" : ""} ${float ? "floating" : ""} ${animated ? "entrance" : ""} ${className}`}
      style={{ width: size, height: size }}
      aria-label={alt}
    >
      <img
        src="/branding/reaper-logo.png"
        alt={alt}
        className="reaper-mascot-img"
        loading="eager"
        decoding="async"
      />
    </div>
  );
}
