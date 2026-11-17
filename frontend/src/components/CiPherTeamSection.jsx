import ReaperMascotLogo from "./branding/ReaperMascotLogo";
import { ShieldCheck, Cpu, Sparkles, Terminal } from "lucide-react";

export default function CiPherTeamSection() {
  return (
    <section className="cipher-team-section animate-page" id="team-cipher">
      <div className="cipher-header-block">
        <div className="cipher-badge-row">
          <span className="cipher-pill">FOUNDING TEAM</span>
          <span className="cipher-divider">•</span>
          <span className="cipher-sub-pill">ENGINEERING EXCELLENCE</span>
        </div>

        <h2 className="cipher-main-title">
          CiPher<span className="accent">.</span>
        </h2>
        <p className="cipher-subtitle">
          Architects of the REAPER Autonomous Software Repair Engine.
        </p>
      </div>

      {/* Two Equal-Weight Premium Member Cards (Archi Sharma FIRST/LEFT, Parth Goyal SECOND/RIGHT) */}
      <div className="cipher-cards-grid">
        {/* 1. Archi Sharma (FIRST & LEFT) */}
        <div className="cipher-member-card hover-lift" id="team-member-archi">
          <div className="cipher-card-glow-emerald" />
          <div className="cipher-member-top">
            <div className="cipher-avatar-ring">
              <span className="cipher-initials">AS</span>
            </div>
            <div className="cipher-role-tag">
              <Cpu size={13} />
              <span>AI/ML</span>
            </div>
          </div>

          <div className="cipher-member-info">
            <h3 className="cipher-member-name">Archi Sharma</h3>
            <span className="cipher-member-role">
              Specialization: <strong style={{ color: "var(--accent-emerald)" }}>AI/ML</strong>
            </span>
            <p className="cipher-member-desc">
              Spearheading autonomous ReAct reasoning loops, semantic AST code synthesis, LLM prompt orchestration, and automated patch regression verification.
            </p>
          </div>

          <div className="cipher-card-footer">
            <div className="cipher-spec-pill">
              <Sparkles size={12} style={{ color: "var(--accent-emerald)" }} />
              <span>AI/ML & Neural Reasoning</span>
            </div>
            <span className="cipher-badge-equal">Founding Team</span>
          </div>
        </div>

        {/* 2. Parth Goyal (SECOND & RIGHT) */}
        <div className="cipher-member-card hover-lift" id="team-member-parth">
          <div className="cipher-card-glow-champagne" />
          <div className="cipher-member-top">
            <div className="cipher-avatar-ring champagne">
              <span className="cipher-initials champagne">PG</span>
            </div>
            <div className="cipher-role-tag champagne">
              <ShieldCheck size={13} />
              <span>CSCQ</span>
            </div>
          </div>

          <div className="cipher-member-info">
            <h3 className="cipher-member-name">Parth Goyal</h3>
            <span className="cipher-member-role">
              Specialization: <strong style={{ color: "var(--accent-champagne)" }}>CSCQ</strong>
            </span>
            <p className="cipher-member-desc">
              Leading hermetic sandbox isolation, runtime security boundaries, deterministic test environments, and autonomous agent execution policies.
            </p>
          </div>

          <div className="cipher-card-footer">
            <div className="cipher-spec-pill champagne">
              <Terminal size={12} style={{ color: "var(--accent-champagne)" }} />
              <span>CSCQ & Systems Architecture</span>
            </div>
            <span className="cipher-badge-equal champagne">Founding Team</span>
          </div>
        </div>
      </div>

      {/* Team Closing Statement */}
      <div className="cipher-closing-banner panel hover-lift">
        <div className="cipher-closing-logo">
          <ReaperMascotLogo size={46} glow={true} float={false} />
        </div>
        <div className="cipher-closing-text">
          <strong className="cipher-built-by">Built by CiPher</strong>
          <span className="cipher-mission">Engineering autonomous software repair.</span>
        </div>
      </div>
    </section>
  );
}
