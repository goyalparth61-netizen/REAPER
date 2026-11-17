import { X, BookOpen, GitPullRequest, CheckCircle2 } from "lucide-react";
import {
  IconAnalyse,
  IconRepair,
  IconValidate,
  IconSafetyCenter
} from "./icons/ReaperIcons";

export default function DocumentationModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card doc-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon doc">
              <BookOpen size={22} />
            </div>
            <div>
              <h3>REAPER Documentation & Architecture</h3>
              <p>Autonomous AI Software Repair Engine Technical Overview</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body doc-body">
          {/* Section: Overview */}
          <section className="doc-section">
            <span className="eyebrow">SYSTEM OVERVIEW</span>
            <h4>What is REAPER?</h4>
            <p>
              REAPER is an autonomous AI software repair agent designed to eliminate developer downtime by
              automatically investigating errors, identifying root causes, generating minimal semantic patches,
              and verifying them inside isolated execution containers.
            </p>
          </section>

          {/* Section: How REAPER Operates */}
          <section className="doc-section">
            <span className="eyebrow">REPAIR WORKFLOW</span>
            <h4>Four-Stage Autonomous Pipeline</h4>
            <div className="doc-pipeline-grid">
              <div className="doc-step-box">
                <div className="doc-step-number">01</div>
                <div className="doc-step-icon"><IconAnalyse size={18} /></div>
                <strong>Finding What Went Wrong</strong>
                <p>Ingests stack traces, failing test outputs, and pinpoints the exact faulty source files.</p>
              </div>

              <div className="doc-step-box">
                <div className="doc-step-number">02</div>
                <div className="doc-step-icon"><IconRepair size={18} /></div>
                <strong>Preparing the Code Fix</strong>
                <p>Generates targeted, minimal code diffs strictly conforming to existing codebase conventions.</p>
              </div>

              <div className="doc-step-box">
                <div className="doc-step-number">03</div>
                <div className="doc-step-icon"><IconValidate size={18} /></div>
                <strong>Checking That Nothing Else Breaks</strong>
                <p>Executes test suites and regression checks inside a sealed sandbox to verify zero regressions.</p>
              </div>

              <div className="doc-step-box">
                <div className="doc-step-number">04</div>
                <div className="doc-step-icon"><GitPullRequest size={18} /></div>
                <strong>Verified Pull Request</strong>
                <p>Pushes the fix to a dedicated branch and prepares a clear Pull Request for your human review.</p>
              </div>
            </div>
          </section>

          {/* Section: Safety & Blast Radius */}
          <section className="doc-section">
            <span className="eyebrow">SAFETY & BLAST RADIUS</span>
            <h4>Non-Destructive Execution Principles</h4>
            <ul className="doc-safety-list">
              <li>
                <CheckCircle2 size={16} className="teal" />
                <span><strong>No direct commits to main:</strong> REAPER only creates isolated feature branches.</span>
              </li>
              <li>
                <IconSafetyCenter size={16} className="teal" />
                <span><strong>Isolated sandboxes:</strong> Code execution occurs in disposable containers with strict egress filters.</span>
              </li>
              <li>
                <CheckCircle2 size={16} className="teal" />
                <span><strong>Zero synthetic data:</strong> All telemetry reflects genuine backend tasks and real repository states.</span>
              </li>
            </ul>
          </section>
        </div>

        <div className="modal-footer">
          <button className="primary-button" onClick={onClose}>
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
}
