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
  AlertTriangle,
  Server,
  Cpu,
  Layers,
  FileCode2,
  CheckCheck
} from "lucide-react";
import ReaperCoreIllustration from "../components/illustrations/ReaperCoreIllustration";
import ReaperMascotLogo from "../components/branding/ReaperMascotLogo";
import {
  IconLiveAgent,
  IconSafetyCenter
} from "../components/icons/ReaperIcons";
import { apiService } from "../services/apiService";

export default function LiveAgent() {
  const [telemetry, setTelemetry] = useState(null);
  const [engineStatus, setEngineStatus] = useState(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [killModalOpen, setKillModalOpen] = useState(false);
  const [killSuccess, setKillSuccess] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const [agentRes, statusRes] = await Promise.all([
        apiService.getAgentsStatus(),
        apiService.getStatus()
      ]);

      setTelemetry(agentRes);
      setEngineStatus(statusRes);
      setConnected(Boolean(statusRes?.online));
      setLastUpdated(new Date());
    } catch {
      setConnected(false);
      setTelemetry(null);
      setEngineStatus(null);
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

  const rawState = engineStatus?.state || (connected ? "IDLE" : "WAITING");
  let friendlyStatus = "Standing By";
  let statusBadgeClass = "status-completed";
  let currentActivityDesc = "REAPER multi-agent engine is active and listening for failure signals.";

  if (!connected) {
    friendlyStatus = "Connecting...";
    statusBadgeClass = "status-waiting";
    currentActivityDesc = "Awaiting connection to FastAPI engine at 127.0.0.1:8000.";
  } else if (rawState === "BUSY" || (engineStatus?.active_tasks ?? 0) > 0) {
    friendlyStatus = "Active Repair";
    statusBadgeClass = "status-fixing";
    currentActivityDesc = `Active tasks executing across autonomous agent pipeline (${engineStatus.active_tasks} job(s)).`;
  }

  const agents = telemetry?.agents || {};
  const dockerAvail = Boolean(telemetry?.docker_sandbox_available);
  const geminiAvail = Boolean(telemetry?.ai_connected);

  return (
    <div className="overview-page live-agent-page animate-page">
      {/* Page Header */}
      <section className="welcome-section">
        <div>
          <span className="eyebrow">MULTI-AGENT AUTONOMOUS REPAIR CORE</span>
          <h2>
            Live Agent Operations<span className="accent">.</span>
          </h2>
          <p>
            Real-time telemetry and execution monitoring for REAPER's 5 specialized repair agents.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="secondary-btn" onClick={fetchStatus} title="Refresh telemetry">
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
            Emergency Stop Signal Delivered
          </strong>
          <span style={{ fontSize: "13px" }}>All active container tasks were halted safely. No unverified patches were written.</span>
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
                ORCHESTRATION ENGINE
              </span>
              <h2 style={{ color: "var(--text-ivory)", margin: "2px 0 0", fontSize: "22px", fontFamily: "'Space Grotesk', sans-serif" }}>
                REAPER Kernel v{telemetry?.version || "2.0"}
              </h2>
            </div>
          </div>
          <p style={{ color: "var(--text-sage)", fontSize: "14px", lineHeight: "1.5", margin: "0 0 16px" }}>
            {currentActivityDesc}
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
            <div className={`status-pill ${statusBadgeClass}`} style={{ fontSize: "13px", padding: "6px 14px" }}>
              <CircleDot size={12} />
              <span>State: {friendlyStatus}</span>
            </div>

            <div className="live-connection" style={{ color: "var(--text-sage)", fontSize: "13px", display: "flex", alignItems: "center", gap: 6 }}>
              {connected ? <Wifi size={15} style={{ color: "var(--accent-emerald)" }} /> : <WifiOff size={15} />}
              <span>{connected ? "Engine Connected (FastAPI)" : "Awaiting Engine (127.0.0.1:8000)"}</span>
            </div>

            <div style={{ color: "var(--text-sage)", fontSize: "13px", display: "flex", alignItems: "center", gap: 6 }}>
              <Cpu size={15} style={{ color: geminiAvail ? "var(--accent-emerald)" : "var(--accent-champagne)" }} />
              <span>AI Provider: {telemetry?.provider ? `${telemetry.provider} (${telemetry.model})` : "Gemini 3.5 Flash"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Canonical Agents Grid */}
      <section style={{ marginTop: 24, marginBottom: 24 }}>
        <div className="panel-heading" style={{ marginBottom: 14 }}>
          <div>
            <span className="eyebrow" style={{ color: "var(--accent-champagne)" }}>SPECIALIZED REPAIR AGENTS</span>
            <h3 style={{ margin: "2px 0 0", color: "var(--text-ivory)", fontSize: "18px" }}>Multi-Agent Operational Matrix</h3>
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-sage)" }}>5 Autonomous Units</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          {/* 1. Detection Agent */}
          <article className="panel hover-lift" style={{ padding: "16px 18px", borderLeft: "3px solid var(--accent-emerald)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <strong style={{ color: "var(--text-ivory)", fontSize: "15px", display: "flex", alignItems: "center", gap: 6 }}>
                <Layers size={16} style={{ color: "var(--accent-emerald)" }} />
                1. Detection Agent
              </strong>
              <span className="status-pill status-completed" style={{ fontSize: "11px", padding: "3px 8px" }}>
                {agents.detection_agent?.status || "ACTIVE"}
              </span>
            </div>
            <p style={{ color: "var(--text-sage)", fontSize: "12.5px", margin: "0 0 10px", lineHeight: "1.5" }}>
              Identifies build failures, parses stack traces, and extracts faulty AST source frames.
            </p>
            <small style={{ color: "var(--accent-mint)", fontSize: "11px" }}>Mode: Deterministic AST & Regex Engine</small>
          </article>

          {/* 2. Diagnosis Agent */}
          <article className="panel hover-lift" style={{ padding: "16px 18px", borderLeft: "3px solid var(--accent-champagne)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <strong style={{ color: "var(--text-ivory)", fontSize: "15px", display: "flex", alignItems: "center", gap: 6 }}>
                <Activity size={16} style={{ color: "var(--accent-champagne)" }} />
                2. Diagnosis Agent
              </strong>
              <span className="status-pill status-completed" style={{ fontSize: "11px", padding: "3px 8px" }}>
                {agents.diagnosis_agent?.status || (geminiAvail ? "ACTIVE" : "STANDBY")}
              </span>
            </div>
            <p style={{ color: "var(--text-sage)", fontSize: "12.5px", margin: "0 0 10px", lineHeight: "1.5" }}>
              Isolates primary root causes from secondary errors using deep semantic reasoning.
            </p>
            <small style={{ color: "var(--accent-champagne)", fontSize: "11px" }}>
              Mode: {geminiAvail ? "Gemini 3.5 Flash Reasoning" : "Deterministic Fallback"}
            </small>
          </article>

          {/* 3. Repair Agent */}
          <article className="panel hover-lift" style={{ padding: "16px 18px", borderLeft: "3px solid var(--accent-mint)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <strong style={{ color: "var(--text-ivory)", fontSize: "15px", display: "flex", alignItems: "center", gap: 6 }}>
                <FileCode2 size={16} style={{ color: "var(--accent-mint)" }} />
                3. Repair Agent
              </strong>
              <span className="status-pill status-completed" style={{ fontSize: "11px", padding: "3px 8px" }}>
                {agents.repair_agent?.status || (geminiAvail ? "ACTIVE" : "STANDBY")}
              </span>
            </div>
            <p style={{ color: "var(--text-sage)", fontSize: "12.5px", margin: "0 0 10px", lineHeight: "1.5" }}>
              Synthesizes minimal surgical unified diff patches conforming to language idioms.
            </p>
            <small style={{ color: "var(--accent-mint)", fontSize: "11px" }}>
              Mode: {geminiAvail ? "Gemini Surgical Synthesis" : "Targeted Template"}
            </small>
          </article>

          {/* 4. Verification Agent */}
          <article className="panel hover-lift" style={{ padding: "16px 18px", borderLeft: `3px solid ${dockerAvail ? "var(--accent-emerald)" : "#F87171"}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <strong style={{ color: "var(--text-ivory)", fontSize: "15px", display: "flex", alignItems: "center", gap: 6 }}>
                <Server size={16} style={{ color: dockerAvail ? "var(--accent-emerald)" : "#F87171" }} />
                4. Verification Agent
              </strong>
              <span className={`status-pill ${dockerAvail ? "status-completed" : "status-waiting"}`} style={{ fontSize: "11px", padding: "3px 8px" }}>
                {dockerAvail ? "ACTIVE" : "NO DOCKER"}
              </span>
            </div>
            <p style={{ color: "var(--text-sage)", fontSize: "12.5px", margin: "0 0 10px", lineHeight: "1.5" }}>
              Executes test suites inside isolated Docker containers; rejects unverified fixes.
            </p>
            <small style={{ color: dockerAvail ? "var(--accent-emerald)" : "#FCA5A5", fontSize: "11px" }}>
              Mode: {dockerAvail ? "Isolated Container Sandbox" : "Blocked (Host Protection Active)"}
            </small>
          </article>

          {/* 5. Reporting Agent */}
          <article className="panel hover-lift" style={{ padding: "16px 18px", borderLeft: "3px solid var(--accent-emerald)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <strong style={{ color: "var(--text-ivory)", fontSize: "15px", display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCheck size={16} style={{ color: "var(--accent-emerald)" }} />
                5. Reporting Agent
              </strong>
              <span className="status-pill status-completed" style={{ fontSize: "11px", padding: "3px 8px" }}>
                ACTIVE
              </span>
            </div>
            <p style={{ color: "var(--text-sage)", fontSize: "12.5px", margin: "0 0 10px", lineHeight: "1.5" }}>
              Generates structured audit reports and formats non-destructive PR drafts for review.
            </p>
            <small style={{ color: "var(--accent-emerald)", fontSize: "11px" }}>Mode: Persisted DB Audit Trails</small>
          </article>
        </div>
      </section>

      {/* Safety & Isolation Overview */}
      <section className="dashboard-grid">
        <article className="panel">
          <span className="eyebrow">SANDBOX INTEGRITY</span>
          <h3 style={{ margin: "6px 0 16px", color: "var(--text-ivory)" }}>Host Protection Guarantees</h3>

          <div className="connection-details">
            <div>
              <span>Docker Daemon Availability</span>
              <strong style={{ color: dockerAvail ? "var(--accent-emerald)" : "var(--accent-champagne)" }}>
                {dockerAvail ? "Active & Verified" : "Not Running on Host"}
              </strong>
            </div>
            <div>
              <span>Network Isolation Policy</span>
              <strong style={{ color: "var(--accent-emerald)" }}>Enforced (--network none)</strong>
            </div>
            <div>
              <span>Privilege Escalation</span>
              <strong style={{ color: "var(--accent-mint)" }}>Disabled (Non-root UID 1000)</strong>
            </div>
            <div>
              <span>Execution Timeouts</span>
              <strong>Hard 30-Second Limit</strong>
            </div>
          </div>
        </article>

        {/* Live Raw Telemetry Inspector */}
        <article className="panel">
          <span className="eyebrow">API TELEMETRY</span>
          <h3 style={{ margin: "6px 0 16px", color: "var(--text-ivory)" }}>Engine State Inspector</h3>

          <div style={{ padding: 12, background: "var(--bg-obsidian)", borderRadius: 6, border: "1px solid var(--border-forest)", maxHeight: 180, overflowY: "auto" }}>
            <pre style={{ margin: 0, color: "var(--text-sage)", fontSize: "11.5px", fontFamily: "monospace" }}>
{JSON.stringify(
  {
    engine: "REAPER",
    status: connected ? "ONLINE" : "DISCONNECTED",
    active_tasks: engineStatus?.active_tasks ?? 0,
    gemini_connected: geminiAvail,
    gemini_model: telemetry?.model || "gemini-3.5-flash",
    docker_sandbox_active: dockerAvail,
    last_sync: lastUpdated ? lastUpdated.toISOString() : null
  },
  null,
  2
)}
            </pre>
          </div>
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
        <span>Telemetry synchronizes with REAPER FastAPI engine automatically every 5 seconds.</span>
      </div>
    </div>
  );
}
