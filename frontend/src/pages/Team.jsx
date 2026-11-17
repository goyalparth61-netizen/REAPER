import CiPherTeamSection from "../components/CiPherTeamSection";
import { ArrowLeft } from "lucide-react";

export default function Team({ onNavigate }) {
  return (
    <div className="overview-page team-page animate-page">
      {/* Top Banner Navigation */}
      <div style={{ marginBottom: 18 }}>
        <button
          className="secondary-btn"
          onClick={() => onNavigate && onNavigate("Workspace")}
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <ArrowLeft size={14} />
          <span>Back to Workspace</span>
        </button>
      </div>

      {/* Main Team Presentation */}
      <CiPherTeamSection />

      {/* Mission Statement Panel */}
      <div className="panel" style={{ marginTop: 28, padding: "24px 28px", borderLeft: "4px solid var(--accent-emerald)" }}>
        <span className="eyebrow" style={{ color: "var(--accent-champagne)" }}>THE REAPER INITIATIVE</span>
        <h3 style={{ fontSize: "18px", color: "var(--text-ivory)", margin: "6px 0 10px" }}>
          Autonomous Engineering for Modern Codebases
        </h3>
        <p style={{ color: "var(--text-sage)", fontSize: "14px", lineHeight: "1.7", margin: 0, maxWidth: "780px" }}>
          CiPher was founded on the belief that developers should spend their time inventing software, not wrestling with broken dependencies, null pointers, and regressions. REAPER operates as a reliable autonomous colleague — investigating faults, synthesizing minimal surgical patches, and verifying that everything passes before code lands in your repositories.
        </p>
      </div>
    </div>
  );
}
