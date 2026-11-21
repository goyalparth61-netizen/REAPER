import { useState } from "react";
import {
  X,
  ShieldCheck,
  GitBranch,
  CheckCircle2,
  ArrowRight,
  Terminal,
  AlertCircle
} from "lucide-react";
import ReaperMascotLogo from "./branding/ReaperMascotLogo";
import { IconStartRepair, IconSafetyCenter } from "./icons/ReaperIcons";
import { apiService } from "../services/apiService";

export default function RepairConfirmModal({
  isOpen,
  onClose,
  repo,
  branch,
  issueDescription,
  onSuccessNavigate
}) {
  const [dispatching, setDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState(null);
  const [dispatchError, setDispatchError] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);

  if (!isOpen || !repo) return null;

  async function handleConfirmRepair() {
    setDispatching(true);
    setDispatchError(null);
    setStepIndex(1); // Preparing isolated environment

    try {
      await new Promise((r) => setTimeout(r, 400));
      setStepIndex(2); // Mounting repository snapshot

      await new Promise((r) => setTimeout(r, 400));
      setStepIndex(3); // Dispatching agent

      const result = await apiService.dispatchRepair({
        repo,
        branch,
        issueDescription,
        isDemo: repo.isDemo
      });

      // Save real run to localStorage for immediate UI continuity
      try {
        const existing = JSON.parse(localStorage.getItem("reaper_recent_runs") || "[]");
        const newRun = {
          runId: result.runId,
          repo: repo.fullName || repo.name,
          branch: branch || repo.defaultBranch || "main",
          issue: issueDescription || "Runtime exception diagnosed in source code.",
          status: result.status || "DISPATCHED",
          timestamp: new Date().toISOString()
        };
        localStorage.setItem("reaper_recent_runs", JSON.stringify([newRun, ...existing]));
      } catch {}

      setDispatchResult(result);
    } catch (err) {
      setDispatchError(err.message || "Failed to reach backend engine.");
    } finally {
      setDispatching(false);
    }
  }

  function handleClose() {
    if (dispatching) return;
    setDispatchResult(null);
    setDispatchError(null);
    setStepIndex(0);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={handleClose} role="dialog" aria-modal="true">
      <div className="modal-card repair-confirm-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon zap">
              <IconStartRepair size={22} />
            </div>
            <div>
              <h3>
                {dispatchResult ? "Repair Agent Dispatched" : "Confirm Repair Operation"}
              </h3>
              <p>Autonomous AI Software Repair Engine</p>
            </div>
          </div>
          {!dispatching && (
            <button className="modal-close-btn" onClick={handleClose} aria-label="Close modal">
              <X size={18} />
            </button>
          )}
        </div>

        <div className="modal-body">
          {dispatchError && (
            <div className="safety-alert-banner" style={{ background: "rgba(239, 68, 68, 0.15)", borderColor: "#EF4444", color: "#FCA5A5", padding: "12px 16px", borderRadius: 8, marginBottom: 16 }}>
              <strong style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <AlertCircle size={16} />
                Dispatch Failed
              </strong>
              <p style={{ margin: "4px 0 0", fontSize: "13px" }}>{dispatchError}</p>
            </div>
          )}

          {dispatchResult ? (
            /* Result State */
            <div className="dispatch-success-view">
              <div className="success-pulse-icon">
                <CheckCircle2 size={44} />
              </div>
              <h4>Autonomous Agent Initialized</h4>
              <p className="success-sub">
                REAPER has initiated analysis on <strong>{dispatchResult.repo}</strong>.
              </p>

              <div className="run-telemetry-badge">
                <Terminal size={14} />
                <span>Run ID: <code>{dispatchResult.runId}</code></span>
                <span className="status-pill active">STATUS: {dispatchResult.status || "ANALYSING"}</span>
              </div>

              <div className="active-pipeline-preview">
                <div className="pipeline-mini-step active">
                  <span className="step-dot" />
                  <strong>01 / Finding What Went Wrong</strong>
                  <small>Parsing error traces & source code</small>
                </div>
                <div className="pipeline-mini-step">
                  <span className="step-dot" />
                  <strong>02 / Preparing the Code Fix</strong>
                  <small>Generating minimal verified patch</small>
                </div>
                <div className="pipeline-mini-step">
                  <span className="step-dot" />
                  <strong>03 / Checking That Nothing Else Breaks</strong>
                  <small>Running sandbox regression test suite</small>
                </div>
              </div>
            </div>
          ) : dispatching ? (
            /* Dispatching in progress with Custom AI Nexus Symbol */
            <div className="dispatch-loading-view">
              <div className="spinner-large" style={{ display: "grid", placeItems: "center", marginBottom: 12 }}>
                <ReaperMascotLogo size={56} glow={true} float={true} />
              </div>
              <h4>Launching Autonomous Repair Sandbox</h4>
              <p className="loading-stage-text">
                {stepIndex === 1 && "Provisioning network-isolated runner..."}
                {stepIndex === 2 && `Mounting snapshot of ${repo.fullName || repo.name}@${branch}...`}
                {stepIndex === 3 && "Loading test suite & AST investigator..."}
              </p>
              <div className="progress-bar-wrap">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${(stepIndex / 3) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            /* Confirmation Form */
            <>
              {/* Target Repo Summary */}
              <div className="target-repo-box">
                <div className="target-repo-header">
                  <span className="eyebrow">TARGET REPOSITORY</span>
                  {repo.isDemo && <span className="demo-tag">[DEMO]</span>}
                </div>
                <div className="target-repo-details">
                  <strong className="repo-title">{repo.fullName || repo.name}</strong>
                  <div className="repo-meta-pills">
                    <span className="meta-pill">
                      <GitBranch size={13} /> {branch || repo.defaultBranch || "main"}
                    </span>
                    <span className="meta-pill">
                      {repo.visibility === "private" ? "Private" : "Public"}
                    </span>
                    {repo.language && (
                      <span className="meta-pill lang">{repo.language}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Problem Description Summary */}
              <div className="issue-summary-box">
                <span className="eyebrow">DIAGNOSTIC TARGET</span>
                {issueDescription ? (
                  <p className="issue-text">"{issueDescription}"</p>
                ) : (
                  <p className="issue-text placeholder">
                    Automatic Diagnostic: REAPER will inspect failing tests, crash logs, and compiler diagnostics.
                  </p>
                )}
              </div>

              {/* Safety Guarantees */}
              <div className="safety-guarantees-list">
                <div className="safety-item">
                  <IconSafetyCenter size={16} className="safety-icon" />
                  <span>Isolated sandbox environment (no external network or host access)</span>
                </div>
                <div className="safety-item">
                  <ShieldCheck size={16} className="safety-icon" />
                  <span>Non-destructive: Zero commits to protected branches</span>
                </div>
                <div className="safety-item">
                  <CheckCircle2 size={16} className="safety-icon" />
                  <span>Regression verification: Runs existing test suite before proposing PR</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          {dispatchResult ? (
            <>
              <button className="secondary-button" onClick={handleClose}>
                Done
              </button>
              <button
                className="primary-button glowing"
                onClick={() => {
                  handleClose();
                  if (onSuccessNavigate) onSuccessNavigate("Live Agent");
                }}
              >
                <span>View Live Telemetry</span>
                <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                className="secondary-button"
                onClick={handleClose}
                disabled={dispatching}
              >
                Cancel
              </button>
              <button
                className="primary-button glowing"
                onClick={handleConfirmRepair}
                disabled={dispatching}
              >
                <IconStartRepair size={16} />
                <span>Confirm & Dispatch Agent</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
