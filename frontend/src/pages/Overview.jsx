import { useEffect, useState } from "react";
import {
  Activity,
  Lock,
  GitBranch,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Users
} from "lucide-react";
import ReaperMascotLogo from "../components/branding/ReaperMascotLogo";
import CiPherTeamSection from "../components/CiPherTeamSection";
import {
  IconAnalyse,
  IconRepair,
  IconValidate,
  IconStartRepair
} from "../components/icons/ReaperIcons";
import ParticleCanvas from "../components/ParticleCanvas";
import RepairWorkspace from "../components/RepairWorkspace";
import DocumentationModal from "../components/DocumentationModal";
import GitHubConnectModal from "../components/GitHubConnectModal";
import { apiService } from "../services/apiService";
import { githubService } from "../services/githubService";

export default function Overview({ onNavigate }) {
  const [backend, setBackend] = useState({ online: false, state: "IDLE", active_tasks: 0 });
  const [authStatus, setAuthStatus] = useState(githubService.getStatus());
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [githubModalOpen, setGithubModalOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadTelemetry() {
      const res = await apiService.getStatus();
      if (active) {
        setBackend(res);
        setAuthStatus(githubService.getStatus());
      }
    }

    loadTelemetry();
    const timer = setInterval(loadTelemetry, 5000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  function handleQuickDemo() {
    githubService.setDemoMode(true);
    setAuthStatus(githubService.getStatus());
    const el = document.getElementById("repair-workspace");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="homepage-container animate-page">
      {/* 1. HERO SECTION WITH OFFICIAL REAPER MASCOT & WORDMARK */}
      <section className="hero-section">
        <ParticleCanvas />

        <div className="hero-content">
          {/* Official REAPER Mascot Logo */}
          <div className="hero-mascot-wrapper">
            <ReaperMascotLogo size={108} glow={true} float={true} animated={true} />
          </div>

          {/* Eyebrow Badge */}
          <div className="hero-pill-badge" onClick={() => setDocModalOpen(true)}>
            <span className="pulsing-teal-dot" />
            <span className="pill-text" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "1px" }}>
              AUTONOMOUS SOFTWARE REPAIR ENGINE
            </span>
            <span className="pill-divider">•</span>
            <span className="pill-tag">v2.0 PREVIEW</span>
            <ChevronRight size={13} className="pill-arrow" />
          </div>

          {/* Main Headline & Wordmark */}
          <h1 className="hero-headline">
            Your Code Breaks. <br />
            <span className="hero-gradient-headline">REAPER Fixes.</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle">
            An autonomous AI engineer that investigates, repairs and validates your software.
          </p>

          {/* 5-Second Purpose Summary */}
          <p className="hero-clarity-lead" style={{ maxWidth: 660, margin: "0 auto 28px", color: "var(--text-sage)", fontSize: "14px", lineHeight: "1.6" }}>
            Connect your project, provide an error or stack trace, and let REAPER's ReAct agent isolate the fault, synthesize a targeted patch, and verify zero regressions in a sealed container.
          </p>

          {/* Action Cluster */}
          <div className="hero-cta-group">
            <a href="#repair-workspace" className="primary-button glowing hero-cta">
              <IconStartRepair size={16} className="btn-zap-icon" />
              <span>Launch Repair Workspace</span>
            </a>

            {!authStatus.isConnected && (
              <button
                className="secondary-button hero-demo-btn"
                onClick={handleQuickDemo}
                title="Load sample repositories for testing"
              >
                <Sparkles size={15} style={{ color: "var(--accent-emerald)" }} />
                <span>Quick Demo Mode</span>
              </button>
            )}

            <button
              className="secondary-button hero-doc-btn"
              onClick={() => onNavigate && onNavigate("Team")}
              title="Meet the CiPher team"
            >
              <Users size={15} />
              <span>Team CiPher</span>
            </button>
          </div>

          {/* Architectural Trust Indicators */}
          <div className="hero-trust-row">
            <div className="trust-item">
              <CheckCircle2 size={14} style={{ color: "var(--accent-emerald)" }} />
              <span>Isolated Sandbox Containers</span>
            </div>
            <div className="trust-divider">•</div>
            <div className="trust-item">
              <GitBranch size={14} style={{ color: "var(--accent-champagne)" }} />
              <span>Zero Protected Branch Writes</span>
            </div>
            <div className="trust-divider">•</div>
            <div className="trust-item">
              <CheckCircle2 size={14} style={{ color: "var(--accent-mint)" }} />
              <span>100% Regression Test Validation</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN REPAIR WORKSPACE */}
      <section className="workspace-section">
        <div className="workspace-ambient-backdrop" />
        <RepairWorkspace onNavigate={onNavigate} />
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="how-it-works-section">
        <div className="section-header-center">
          <span className="eyebrow" style={{ color: "var(--accent-champagne)" }}>
            THREE SIMPLE STEPS
          </span>
          <h2>How REAPER Works<span className="accent">.</span></h2>
          <p>From finding the error to preparing a safely tested fix.</p>
        </div>

        <div className="how-it-works-grid">
          {/* Step 1: Finding what went wrong */}
          <article className="workflow-card hover-lift">
            <div className="workflow-card-glow" />
            <div className="workflow-header-row">
              <div className="workflow-icon-wrap" style={{ background: "rgba(66, 214, 164, 0.12)", color: "var(--accent-emerald)" }}>
                <IconAnalyse size={24} />
              </div>
              <span className="workflow-step-num" style={{ color: "var(--accent-champagne)" }}>
                STEP 01
              </span>
            </div>

            <h3 style={{ color: "var(--text-ivory)", margin: "0 0 8px" }}>Finding What Went Wrong</h3>
            <p className="workflow-desc">
              REAPER understands the error message, inspects your code, and pinpoints the exact file and lines where the problem originated.
            </p>

            <div className="workflow-terminal-preview">
              <div className="terminal-topbar">
                <span className="dot red" />
                <span className="dot yellow" />
                <span className="dot green" />
                <span className="terminal-title">investigation-summary</span>
              </div>
              <pre className="terminal-body">
                <code>
                  <span className="term-prompt">$</span> reaper inspect --trace<br />
                  <span className="term-cyan">[FOUND]</span> payment/webhook.ts:89<br />
                  <span className="term-yellow">[CAUSE]</span> Missing null check on idempotency key
                </code>
              </pre>
            </div>

            <div className="workflow-footer-note">
              <span>Pinpoints Error Root Cause</span>
            </div>
          </article>

          {/* Step 2: Preparing the code fix */}
          <article className="workflow-card hover-lift">
            <div className="workflow-card-glow" />
            <div className="workflow-header-row">
              <div className="workflow-icon-wrap" style={{ background: "rgba(201, 169, 110, 0.12)", color: "var(--accent-champagne)" }}>
                <IconRepair size={24} />
              </div>
              <span className="workflow-step-num" style={{ color: "var(--accent-champagne)" }}>
                STEP 02
              </span>
            </div>

            <h3 style={{ color: "var(--text-ivory)", margin: "0 0 8px" }}>Preparing the Code Fix</h3>
            <p className="workflow-desc">
              REAPER generates a minimal, surgical code patch that solves the bug while strictly conforming to your team's code conventions.
            </p>

            <div className="workflow-terminal-preview diff-preview">
              <div className="terminal-topbar">
                <span className="dot red" />
                <span className="dot yellow" />
                <span className="dot green" />
                <span className="terminal-title">code-fix.diff</span>
              </div>
              <pre className="terminal-body">
                <code>
                  <span className="diff-del">- const key = req.headers['idempotency'];</span><br />
                  <span className="diff-add">+ const key = req.headers['idempotency-key']</span><br />
                  <span className="diff-add">+   ?? generateIdempotencyKey();</span>
                </code>
              </pre>
            </div>

            <div className="workflow-footer-note">
              <span>Minimal Code Changes</span>
            </div>
          </article>

          {/* Step 3: Checking that nothing else broke */}
          <article className="workflow-card hover-lift">
            <div className="workflow-card-glow" />
            <div className="workflow-header-row">
              <div className="workflow-icon-wrap" style={{ background: "rgba(161, 233, 201, 0.12)", color: "var(--accent-mint)" }}>
                <IconValidate size={24} />
              </div>
              <span className="workflow-step-num" style={{ color: "var(--accent-champagne)" }}>
                STEP 03
              </span>
            </div>

            <h3 style={{ color: "var(--text-ivory)", margin: "0 0 8px" }}>Checking Nothing Else Broke</h3>
            <p className="workflow-desc">
              REAPER runs your full test suite in an isolated test environment. We verify that the fix works and has not caused any regressions.
            </p>

            <div className="workflow-terminal-preview test-preview">
              <div className="terminal-topbar">
                <span className="dot red" />
                <span className="dot yellow" />
                <span className="dot green" />
                <span className="terminal-title">sandbox-runner:pytest</span>
              </div>
              <pre className="terminal-body">
                <code>
                  <span className="test-pass">✓</span> test_webhook_idempotency <span className="dim">(38ms)</span><br />
                  <span className="test-pass">✓</span> test_regression_billing <span className="dim">(142ms)</span><br />
                  <span className="test-success" style={{ color: "var(--accent-emerald)" }}>ALL TESTS PASSED • Zero regressions</span>
                </code>
              </pre>
            </div>

            <div className="workflow-footer-note">
              <span>Hermetic Sandbox Verified</span>
            </div>
          </article>
        </div>

        {/* Optional Technical Details Drawer */}
        <div style={{ maxWidth: 880, margin: "28px auto 0" }}>
          <details className="tech-details-accordion panel" style={{ padding: "16px 20px" }}>
            <summary style={{ cursor: "pointer", color: "var(--accent-champagne)", fontWeight: 600, fontSize: "13.5px" }}>
              ▸ View Technical Architecture & AST Pipeline (For Advanced Engineers)
            </summary>
            <div style={{ marginTop: 14, color: "var(--text-sage)", fontSize: "13px", lineHeight: "1.7" }}>
              <p>
                <strong>Engine Mechanics:</strong> REAPER uses a multi-stage ReAct (Reasoning + Acting) loop combined with deterministic Abstract Syntax Tree (AST) parsing.
              </p>
              <ul style={{ paddingLeft: 20, margin: "8px 0" }}>
                <li><strong>Static Analysis:</strong> Tree-sitter AST queries identify call-graph reaches and variable scoping.</li>
                <li><strong>Hermetic Isolation:</strong> Ephemeral Docker containers mount snapshots without host filesystem or outbound internet privileges.</li>
                <li><strong>Validation Gate:</strong> Patches are only considered valid when exit code is 0 across all unit and regression test commands.</li>
              </ul>
            </div>
          </details>
        </div>
      </section>

      {/* 4. DEDICATED CIPHER FOUNDING TEAM BRANDING SECTION */}
      <section className="homepage-team-section">
        <CiPherTeamSection />
      </section>

      {/* 5. REAL TELEMETRY & SYSTEM INTEGRITY BANNER */}
      <section className="system-telemetry-strip">
        <div className="telemetry-inner">
          <div className="telemetry-info">
            <div className="telemetry-title-row">
              <Activity size={18} style={{ color: "var(--accent-emerald)" }} />
              <strong style={{ color: "var(--text-ivory)" }}>Real-Time Engine Telemetry</strong>
              <span className="real-data-guarantee">REAL DATA ONLY</span>
            </div>
            <p style={{ color: "var(--text-sage)" }}>
              Zero synthetic metrics or simulated statistics. All indicators reflect authentic backend connection status and live repository states.
            </p>
          </div>

          <div className="telemetry-metrics-grid">
            <div className="metric-cell">
              <span className="metric-label">FastAPI Backend</span>
              <strong className={`metric-value ${backend.online ? "online" : "offline"}`}>
                <span className="status-indicator-dot" />
                {backend.online ? "Online (127.0.0.1:8000)" : "Disconnected"}
              </strong>
            </div>

            <div className="metric-cell">
              <span className="metric-label">Agent State</span>
              <strong className="metric-value">
                {backend.online ? backend.state : "UNAVAILABLE"}
              </strong>
            </div>

            <div className="metric-cell">
              <span className="metric-label">Active Tasks</span>
              <strong className="metric-value">
                {backend.online ? backend.active_tasks : "—"}
              </strong>
            </div>

            <div className="metric-cell">
              <span className="metric-label">GitHub Integration</span>
              <strong className="metric-value">
                {authStatus.isConnected
                  ? authStatus.isDemo
                    ? "Preview Mode Active"
                    : `@${authStatus.username}`
                  : "Not Configured Yet"}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER WITH OFFICIAL REAPER MASCOT */}
      <footer className="reaper-footer">
        <div className="footer-top">
          <div className="footer-brand" onClick={() => onNavigate && onNavigate("Team")} style={{ cursor: "pointer" }}>
            <div className="brand-logo-small reaper-footer-symbol">
              <ReaperMascotLogo size={26} glow={false} />
            </div>
            <div>
              <strong style={{ fontFamily: "'Space Grotesk', sans-serif" }}>REAPER</strong>
              <p>Autonomous Software Repair Engine</p>
            </div>
          </div>

          <div className="footer-links">
            <button className="footer-link-btn" onClick={() => setDocModalOpen(true)}>
              Documentation
            </button>
            <button
              className="footer-link-btn"
              onClick={() => onNavigate && onNavigate("Safety Center")}
            >
              Safety Information
            </button>
            <button
              className="footer-link-btn"
              onClick={() => onNavigate && onNavigate("Team")}
            >
              Team CiPher
            </button>
            <button
              className="footer-link-btn"
              onClick={() => onNavigate && onNavigate("Repair History")}
            >
              Activity & Runs
            </button>
          </div>

          <div className="footer-version-tag">
            <span className="dev-indicator-dot" />
            <span>v2.0 • Competition Edition</span>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 REAPER • Built by CiPher (Archi Sharma & Parth Goyal) • Engineering autonomous software repair.</p>
          <div className="footer-status-pill">
            <Lock size={12} />
            <span>Non-Destructive • Sealed Sandbox</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DocumentationModal
        isOpen={docModalOpen}
        onClose={() => setDocModalOpen(false)}
      />

      <GitHubConnectModal
        isOpen={githubModalOpen}
        onClose={() => setGithubModalOpen(false)}
        onStatusChange={() => setAuthStatus(githubService.getStatus())}
      />
    </div>
  );
}
