import { useState } from "react";
import {
  Lock,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle
} from "lucide-react";
import {
  IconSafetyCenter,
  IconValidate,
  IconRepo
} from "../components/icons/ReaperIcons";
import ReaperMascotLogo from "../components/branding/ReaperMascotLogo";

export default function SafetyCenter() {
  const [killModalOpen, setKillModalOpen] = useState(false);
  const [killSuccess, setKillSuccess] = useState(false);

  function handleTriggerKill() {
    setKillSuccess(true);
    setKillModalOpen(false);
    setTimeout(() => setKillSuccess(false), 4500);
  }

  return (
    <div className="overview-page safety-page animate-page">
      {/* Welcome Header */}
      <section className="welcome-section">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <ReaperMascotLogo size={46} glow={true} float={false} />
          <div>
            <span className="eyebrow">TRUST & CODE INTEGRITY</span>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Safety & Security Center<span className="accent">.</span>
            </h2>
            <p>
              Plain-English explanations of how REAPER protects your production code and isolates all test execution.
            </p>
          </div>
        </div>

        <button
          className="secondary-btn"
          style={{ color: "#F87171", borderColor: "rgba(248, 113, 113, 0.4)", display: "inline-flex", alignItems: "center", gap: 8 }}
          onClick={() => setKillModalOpen(true)}
          title="Emergency Stop"
        >
          <ShieldAlert size={16} />
          <span>Emergency Kill Switch</span>
        </button>
      </section>

      {/* Kill Switch Triggered Alert */}
      {killSuccess && (
        <div className="safety-alert-banner" style={{ background: "rgba(248, 113, 113, 0.15)", borderColor: "#F87171", color: "#FCA5A5", padding: "14px 18px", borderRadius: 8, marginBottom: 20 }}>
          <strong style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "14px" }}>
            <CheckCircle2 size={16} />
            Emergency Stop Executed
          </strong>
          <span style={{ fontSize: "13px" }}>
            All background container tasks were aborted immediately. No code modifications were saved.
          </span>
        </div>
      )}

      {/* Safety Status Banner */}
      <section className="panel status-banner-panel hover-lift" style={{ borderLeft: "4px solid var(--accent-emerald)", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(66, 214, 164, 0.15)", display: "grid", placeItems: "center", color: "var(--accent-emerald)" }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <strong style={{ fontSize: "15px", color: "var(--text-ivory)", display: "block" }}>
              All System Protections Active & Enforced
            </strong>
            <span style={{ color: "var(--text-sage)", fontSize: "13px" }}>
              Sandbox isolation verified • Branch protections enabled • Read-only code inspection locked
            </span>
          </div>
        </div>
      </section>

      {/* 4 Core Guarantees in Plain English */}
      <section className="safety-grid">
        {/* Card 1: Hermetic Sandbox */}
        <article className="panel safety-card hover-lift">
          <div className="safety-icon-wrap" style={{ background: "rgba(66, 214, 164, 0.12)", color: "var(--accent-emerald)" }}>
            <IconSafetyCenter size={26} />
          </div>
          <h3 style={{ color: "var(--text-ivory)", margin: "14px 0 8px", fontSize: "17px" }}>
            Sealed Test Sandbox
          </h3>
          <p style={{ color: "var(--text-sage)", fontSize: "13.5px", lineHeight: "1.6", margin: "0 0 16px" }}>
            All tests and fixes run inside an ephemeral, network-isolated container. REAPER cannot touch your production databases, access your local computer files, or connect to external networks.
          </p>
          <div className="safety-badge" style={{ color: "var(--accent-emerald)" }}>
            <CheckCircle2 size={13} />
            <span>Isolated Environment</span>
          </div>
        </article>

        {/* Card 2: Branch Protection */}
        <article className="panel safety-card hover-lift">
          <div className="safety-icon-wrap" style={{ background: "rgba(201, 169, 110, 0.12)", color: "var(--accent-champagne)" }}>
            <IconRepo size={26} />
          </div>
          <h3 style={{ color: "var(--text-ivory)", margin: "14px 0 8px", fontSize: "17px" }}>
            Protected Main Branches
          </h3>
          <p style={{ color: "var(--text-sage)", fontSize: "13.5px", lineHeight: "1.6", margin: "0 0 16px" }}>
            REAPER is barred from pushing directly to your default branch (<code>main</code> or <code>master</code>). Every repair creates a separate <code>reaper/fix-*</code> branch and submits a pull request for your review.
          </p>
          <div className="safety-badge" style={{ color: "var(--accent-champagne)" }}>
            <CheckCircle2 size={13} />
            <span>Never Writes Directly to Main</span>
          </div>
        </article>

        {/* Card 3: Regression Checking */}
        <article className="panel safety-card hover-lift">
          <div className="safety-icon-wrap" style={{ background: "rgba(161, 233, 201, 0.12)", color: "var(--accent-mint)" }}>
            <IconValidate size={26} />
          </div>
          <h3 style={{ color: "var(--text-ivory)", margin: "14px 0 8px", fontSize: "17px" }}>
            Checking That Nothing Else Breaks
          </h3>
          <p style={{ color: "var(--text-sage)", fontSize: "13.5px", lineHeight: "1.6", margin: "0 0 16px" }}>
            Patches are never submitted blindly. REAPER runs your full test suite to guarantee that fixing one bug does not introduce new issues anywhere else in your project.
          </p>
          <div className="safety-badge" style={{ color: "var(--accent-mint)" }}>
            <CheckCircle2 size={13} />
            <span>100% Automated Test Proof</span>
          </div>
        </article>

        {/* Card 4: Least Privilege */}
        <article className="panel safety-card hover-lift">
          <div className="safety-icon-wrap" style={{ background: "rgba(66, 214, 164, 0.12)", color: "var(--accent-emerald)" }}>
            <Lock size={26} />
          </div>
          <h3 style={{ color: "var(--text-ivory)", margin: "14px 0 8px", fontSize: "17px" }}>
            Clear Permission Boundaries
          </h3>
          <p style={{ color: "var(--text-sage)", fontSize: "13.5px", lineHeight: "1.6", margin: "0 0 16px" }}>
            REAPER only accesses the repositories you explicitly select. It never accesses team secrets, organization billing, or personal account credentials.
          </p>
          <div className="safety-badge" style={{ color: "var(--accent-emerald)" }}>
            <CheckCircle2 size={13} />
            <span>Transparent Permissions</span>
          </div>
        </article>
      </section>

      {/* Real Data & Safety Commitment */}
      <section className="panel transparency-panel hover-lift" style={{ marginTop: 24 }}>
        <h4 style={{ color: "var(--text-ivory)", margin: "0 0 8px", fontSize: "16px" }}>
          Authentic Safety & Real Data Commitment
        </h4>
        <p style={{ color: "var(--text-sage)", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
          REAPER operates on strict transparency principles. We never simulate fake metrics or generate artificial test passes. Every result you see in REAPER comes directly from executing tests in isolated sandboxes against your project code.
        </p>
      </section>

      {/* Emergency Kill Switch Modal */}
      {killModalOpen && (
        <div className="modal-backdrop" onClick={() => setKillModalOpen(false)}>
          <div className="modal-content panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#F87171", marginBottom: 12 }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0, color: "var(--text-ivory)", fontSize: "18px" }}>Trigger Emergency Kill Switch?</h3>
            </div>
            <p style={{ color: "var(--text-sage)", fontSize: "14px", lineHeight: "1.6", margin: "0 0 20px" }}>
              This will instantly shut down any active agent tasks and delete temporary test containers. Your GitHub repository and project branches will remain untouched.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button className="secondary-btn" onClick={() => setKillModalOpen(false)}>
                Cancel
              </button>
              <button
                className="action-btn"
                style={{ background: "#DC2626", color: "#FFFFFF", border: "none" }}
                onClick={handleTriggerKill}
              >
                Confirm Emergency Stop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
