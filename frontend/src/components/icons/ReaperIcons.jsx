/**
 * REAPER Obsidian Emerald Custom Vector Iconography System
 * Precision geometric icons with consistent stroke-weights (1.6px - 1.8px),
 * balanced visual gravity, and emerald/champagne accent highlights.
 */

// 1. Workspace / Overview Icon (Precision Command Deck)
export function IconWorkspace({ size = 18, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="7.5" height="7.5" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.25" cy="6.75" r="1.25" fill="#42D6A4" />
    </svg>
  );
}

// 2. Repository Icon (Geometric Branch Matrix)
export function IconRepo({ size = 18, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="6" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="6" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6 8.5V15.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M6 12C6 9.5 8.5 9 15.5 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="18" cy="9" r="1" fill="#42D6A4" />
    </svg>
  );
}

// 3. Live Agent Icon (Autonomous AI Core)
export function IconLiveAgent({ size = 18, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <polygon points="12,3 19,7 19,17 12,21 5,17 5,7" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="1.5" fill="#42D6A4" />
      <line x1="12" y1="3" x2="12" y2="7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

// 4. Repair History / Activity Icon (Chrono Telemetry)
export function IconRepairHistory({ size = 18, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 3V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3.5 12A8.5 8.5 0 1 0 5.8 6.2L3.5 8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="12,8 12,12 15.5,14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="1" fill="#C9A96E" />
    </svg>
  );
}

// 5. Reports Icon (Diagnostic Verification Dossier)
export function IconReports({ size = 18, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 2V8H20" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <line x1="8" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="8" y1="17" x2="13" y2="17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="15.5" cy="17" r="1.25" fill="#42D6A4" />
    </svg>
  );
}

// 6. Safety Center Icon (Hexagonal Cryptoshield)
export function IconSafetyCenter({ size = 18, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 2L20 5.5V11.5C20 16.5 16.6 20.8 12 22C7.4 20.8 4 16.5 4 11.5V5.5L12 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <polyline points="8.5,11.5 11,14 15.5,9.5" stroke="#42D6A4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// 7. Settings Icon (Precision Calibrated Telemetry)
export function IconSettings({ size = 18, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="4" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="8" cy="6" r="2.2" fill="#101713" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16" cy="12" r="2.2" fill="#101713" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="10" cy="18" r="2.2" fill="#101713" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="8" cy="6" r="1" fill="#42D6A4" />
      <circle cx="16" cy="12" r="1" fill="#C9A96E" />
    </svg>
  );
}

// 8. Start Repair Icon (Quantum Energy Aperture)
export function IconStartRepair({ size = 18, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <polygon points="12,2 15.5,8.5 22,12 15.5,15.5 12,22 8.5,15.5 2,12 8.5,8.5" fill="currentColor" opacity="0.15" />
      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

// 9. Analyse Icon (Deep AST Inspector Optic)
export function IconAnalyse({ size = 24, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="11" cy="11" r="4.5" stroke="currentColor" strokeWidth="1.6" />
      <line x1="14.5" y1="14.5" x2="19" y2="19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7 7L9 9" stroke="#42D6A4" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="11" cy="11" r="1.5" fill="#42D6A4" />
    </svg>
  );
}

// 10. Repair Icon (Targeted Patch Synthesizer)
export function IconRepair({ size = 24, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M14.7 6.3C16.3 4.7 18.8 4.7 20.4 6.3C22 7.9 22 10.4 20.4 12L17.5 14.9L11.8 9.2L14.7 6.3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M11.8 9.2L3.5 17.5C2.8 18.2 2.8 19.3 3.5 20C4.2 20.7 5.3 20.7 6 20L14.3 11.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="18.5" cy="8.2" r="1.25" fill="#C9A96E" />
    </svg>
  );
}

// 11. Validate Icon (Hermetic Sandbox Validator)
export function IconValidate({ size = 24, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <polyline points="8,12 11,15 16,9" stroke="#42D6A4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// 12. Notification Icon (Pulse Wave Emitter)
export function IconNotification({ size = 18, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M18 8C18 4.7 15.3 2 12 2C8.7 2 6 4.7 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.3 21C10.7 21.6 11.3 22 12 22C12.7 22 13.3 21.6 13.7 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="18" cy="4" r="2.5" fill="#42D6A4" stroke="#101713" strokeWidth="1.5" />
    </svg>
  );
}

// 13. User Profile Icon (Engineer Identity Aperture)
export function IconUserProfile({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="7.5" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 20C4 16.5 7.5 14 12 14C16.5 14 20 16.5 20 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="7.5" r="1.5" fill="#42D6A4" />
    </svg>
  );
}
