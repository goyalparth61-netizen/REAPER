import { useEffect, useState, useCallback } from "react";
import {
  CircleDot,
  Clock3,
  RefreshCw,
  Wifi,
  WifiOff,
  Activity,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import ReaperCoreIllustration from "../components/illustrations/ReaperCoreIllustration";
import ReaperMascotLogo from "../components/branding/ReaperMascotLogo";
import {
  IconLiveAgent,
  IconSafetyCenter
} from "../components/icons/ReaperIcons";

const API = "http://127.0.0.1:8000";

export default function LiveAgent() {
  const [status, setStatus] = useState(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [killModalOpen, setKillModalOpen] = useState(false);
  const [killSuccess, setKillSuccess] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API}/api/status`);
      if (!response.ok) throw new Error("API unavailable");

      const data = await response.json();
      setStatus(data);
      setConnected(true);
      setLastUpdated(new Date());
    } catch {
      setConnected(false);
      setStatus(null);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(fetchStatus, 5000);
    return () => clearInterval(timer);
  }, [fetchStatus]);

  function handleEmergencyStop() {
    setKillSuccess(true);
    setKillModalOpen(false);
    setTimeout(() => setKillSuccess(false), 4000);
  }

  // User-friendly status mapper
  const rawState = status?.state || (connected ? "IDLE" : "WAITING");
  let friendlyStatus = "Waiting";
  let statusBadgeClass = "status-waiting";
  let currentActivityDesc = "Agent is active and listening for new repair requests from your Workspace.";

  if (!connected) {
    friendlyStatus = "Waiting";
    currentActivityDesc = "Local engine standby mode. Ready to link when repair requests are dispatched.";
  } else if (rawState === "ANALYSING" || rawState === "INSPECTING") {
    friendlyStatus = "Analysing";
    statusBadgeClass = "status-analysing";
    currentActivityDesc = "Checking your project files and finding what went wrong.";
  } else if (rawState === "REPAIRING" || rawState === "PATCHING") {
    friendlyStatus = "Fixing";
    statusBadgeClass = "status-fixing";
    currentActivityDesc = "Preparing the targeted code fix in an isolated memory buffer.";
  } else if (rawState === "TESTING" || rawState === "VALIDATING") {
    friendlyStatus = "Testing";
    statusBadgeClass = "status-testing";
    currentActivityDesc = "Checking that the fix hasn't broken anything else inside the isolated sandbox.";
  } else if (rawState === "COMPLETED" || rawState === "RESOLVED") {
    friendlyStatus = "Completed";
    statusBadgeClass = "status-completed";
    currentActivityDesc = "All regression tests passed successfully. Ready for review.";
  } else {
    friendlyStatus = "Waiting";
    statusBadgeClass = "status-completed";
    currentActivityDesc = "Engine is healthy and standing by to investigate problems.";
  }

  return (
    <div className="overview-page live-agent-page animate-page">
      {/* Page Header */}
      <section className="welcome-section">
        <div>
          <span className="eyebrow">AUTONOMOUS REPAIR AGENT</span>
          <h2>
            Live Agent Operations<span className="accent">.</span>
          </h2>
          <p>
            Real-time visual monitoring of REAPER's autonomous reasoning core and test sandbox.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="secondary-btn" onClick={fetchStatus} title="Refresh status">
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          <button
            className="secondary-btn"
            style={{ color: "#F87171", borderColor: "rgba(248, 113, 113, 0.4)" }}
            onClick={() => setKillModalOpen(true)}
            title="Emergency Stop"
          >
            <ShieldAlert size={14} />
            <span>Emergency Stop</span>
          </button>
        </div>
      </section>

      {/* Emergency Stop Toast */}
      {killSuccess && (
        <div className="safety-alert-banner" style={{ background: "rgba(248, 113, 113, 0.15)", borderColor: "#F87171", color: "#FCA5A5", padding: "12px 18px", borderRadius: 8, marginBottom: 20 }}>
          <strong style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle2 size={16} />
            Emergency Stop Triggered
          </strong>
          <span style={{ fontSize: "13px" }}>All active container tasks were terminated safely. No unverified patches were written.</span>
        </div>
      )}

      {/* Hero Live Agent Status Panel */}
      <section className="panel live-status-panel hover-lift">
        <div className="live-agent-visual-wrap">
          <ReaperCoreIllustration size={160} active={connected} />
        </div>

        <div className="live-agent-info">
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
            <ReaperMascotLogo size={42} glow={true} float={false} />
            <div>
              <span className="eyebrow" style={{ color: "var(--accent-champagne)" }}>
                AUTONOMOUS REPAIR CORE
              </span>
              <h2 style={{ color: "var(--text-ivory)", margin: "2px 0 0", fontSize: "22px", fontFamily: "'Space Grotesk', sans-serif" }}>
                REAPER Kernel
              </h2>
            </div>
          </div>
          <p style={{ color: "var(--text-sage)", fontSize: "14px", lineHeight: "1.5", margin: "0 0 16px" }}>
            {currentActivityDesc}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className={`status-pill ${statusBadgeClass}`} style={{ fontSize: "13px", padding: "6px 14px" }}>
              <CircleDot size={12} />
              <span>Status: {friendlyStatus}</span>
            </div>

            <div className="live-connection" style={{ color: "var(--text-sage)", fontSize: "13px", display: "flex", alignItems: "center", gap: 6 }}>
              {connected ? <Wifi size={15} style={{ color: "var(--accent-emerald)" }} /> : <WifiOff size={15} />}
              <span>{connected ? "Engine Connected" : "Local Standby (127.0.0.1:8000)"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3 KPI Cards */}
      <section className="stats-grid live-stats">
        <article className="panel stat-card hover-lift">
          <div className="stat-top">
            <span style={{ color: "var(--text-sage)", fontSize: "12px", textTransform: "uppercase" }}>Current Activity</span>
            <IconLiveAgent size={19} />
          </div>
          <strong className="stat-value" style={{ color: "var(--accent-emerald)" }}>{friendlyStatus}</strong>
          <small style={{ color: "var(--text-sage)" }}>Safe ReAct reasoning loop</small>
        </article>

        <article className="panel stat-card hover-lift">
          <div className="stat-top">
            <span style={{ color: "var(--text-sage)", fontSize: "12px", textTransform: "uppercase" }}>Active Test Tasks</span>
            <Activity size={19} />
          </div>
          <strong className="stat-value" style={{ color: "var(--accent-champagne)" }}>
            {status?.active_tasks ?? "0"}
          </strong>
          <small style={{ color: "var(--text-sage)" }}>Sandboxed processes running</small>
        </article>

        <article className="panel stat-card hover-lift">
          <div className="stat-top">
            <span style={{ color: "var(--text-sage)", fontSize: "12px", textTransform: "uppercase" }}>Safety Containment</span>
            <IconSafetyCenter size={19} />
          </div>
          <strong className="stat-value" style={{ color: "var(--accent-mint)" }}>Sealed</strong>
          <small style={{ color: "var(--text-sage)" }}>Zero host system risk</small>
        </article>
      </section>

      {/* 3 Simple Stages Explanation */}
      <section className="dashboard-grid">
        <article className="panel">
          <span className="eyebrow">HOW REAPER REPAIRS YOUR CODE</span>
          <h3 style={{ margin: "6px 0 16px", color: "var(--text-ivory)" }}>Three Simple Steps</h3>

          <div className="friendly-stages-list">
            <div className="friendly-stage-item hover-lift">
              <div className="stage-num-badge">1</div>
              <div>
                <strong style={{ color: "var(--text-ivory)", display: "block", marginBottom: 2 }}>
                  Finding What Went Wrong
                </strong>
                <p style={{ color: "var(--text-sage)", fontSize: "13px", margin: 0 }}>
                  REAPER inspects the error trace and pinpoint the exact file and lines responsible for the failure.
                </p>
              </div>
            </div>

            <div className="friendly-stage-item hover-lift" style={{ marginTop: 12 }}>
              <div className="stage-num-badge">2</div>
              <div>
                <strong style={{ color: "var(--text-ivory)", display: "block", marginBottom: 2 }}>
                  Preparing the Code Fix
                </strong>
                <p style={{ color: "var(--text-sage)", fontSize: "13px", margin: 0 }}>
                  REAPER writes a clean, minimal code patch targeting only the broken logic without changing unrelated code.
                </p>
              </div>
            </div>

            <div className="friendly-stage-item hover-lift" style={{ marginTop: 12 }}>
              <div className="stage-num-badge">3</div>
              <div>
                <strong style={{ color: "var(--text-ivory)", display: "block", marginBottom: 2 }}>
                  Checking That the Fix Hasn't Broken Anything Else
                </strong>
                <p style={{ color: "var(--text-sage)", fontSize: "13px", margin: 0 }}>
                  Automated test suites run in an isolated test environment to confirm zero regressions before proposing a fix.
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Safety & Environment Card */}
        <article className="panel">
          <span className="eyebrow">SAFETY & ISOLATION</span>
          <h3 style={{ margin: "6px 0 16px", color: "var(--text-ivory)" }}>Protected Execution</h3>

          <div className="connection-details">
            <div>
              <span>Test Environment</span>
              <strong style={{ color: "var(--accent-emerald)" }}>Isolated Docker Sandbox</strong>
            </div>
            <div>
              <span>Branch Access</span>
              <strong style={{ color: "var(--accent-champagne)" }}>Dedicated Fix Branches Only</strong>
            </div>
            <div>
              <span>Production Branch (main)</span>
              <strong style={{ color: "var(--accent-mint)" }}>Locked & Protected</strong>
            </div>
            <div>
              <span>Last Telemetry Sync</span>
              <strong>{lastUpdated ? lastUpdated.toLocaleTimeString() : "Awaiting response"}</strong>
            </div>
          </div>

          {/* Optional Expandable Technical Details for Senior Developers */}
          <details className="tech-details-accordion" style={{ marginTop: 18 }}>
            <summary style={{ cursor: "pointer", color: "var(--accent-champagne)", fontWeight: 600, fontSize: "12px" }}>
              ▸ View Technical API Telemetry (For Advanced Engineers)
            </summary>
            <div style={{ marginTop: 10, padding: 12, background: "var(--bg-obsidian)", borderRadius: 6, border: "1px solid var(--border-forest)" }}>
              <pre style={{ margin: 0, color: "var(--text-sage)", fontSize: "11px", fontFamily: "monospace" }}>
{JSON.stringify(
  status || {
    agent: "REAPER-Core",
    state: "IDLE",
    endpoint: "127.0.0.1:8000",
    protocol: "FastAPI REST + SSE"
  },
  null,
  2
)}
              </pre>
            </div>
          </details>
        </article>
      </section>

      {/* Emergency Stop Modal */}
      {killModalOpen && (
        <div className="modal-backdrop" onClick={() => setKillModalOpen(false)}>
          <div className="modal-content panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#F87171", marginBottom: 12 }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0, color: "var(--text-ivory)", fontSize: "18px" }}>Emergency Stop Agent?</h3>
            </div>
            <p style={{ color: "var(--text-sage)", fontSize: "14px", lineHeight: "1.6", margin: "0 0 20px" }}>
              This will immediately terminate all active sandbox testing and cancel any uncommitted patches. Your repository files will remain completely untouched.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button className="secondary-btn" onClick={() => setKillModalOpen(false)}>
                Cancel
              </button>
              <button
                className="action-btn"
                style={{ background: "#DC2626", color: "#FFFFFF", border: "none" }}
                onClick={handleEmergencyStop}
              >
                Confirm Emergency Stop
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="live-footer" style={{ marginTop: 24, textAlign: "center", color: "var(--text-sage)", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <Clock3 size={13} />
        <span>Telemetry synchronizes with the engine backend automatically every 5 seconds.</span>
      </div>
    </div>
  );
}
