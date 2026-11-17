import { useState } from "react";
import { X, ShieldCheck, CheckCircle2, AlertCircle, Info } from "lucide-react";
import GitHubIcon from "./GitHubIcon";
import { githubService } from "../services/githubService";

export default function GitHubConnectModal({ isOpen, onClose, onStatusChange }) {
  const [loading, setLoading] = useState(false);
  const status = githubService.getStatus();

  if (!isOpen) return null;

  async function handleToggleDemo() {
    setLoading(true);
    try {
      if (status.isDemo) {
        githubService.disconnect();
      } else {
        await githubService.initiateConnection({ useDemoMode: true });
      }
      onStatusChange();
    } finally {
      setLoading(false);
    }
  }

  function handleDisconnect() {
    githubService.disconnect();
    onStatusChange();
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon github">
              <GitHubIcon size={22} />
            </div>
            <div>
              <h3>GitHub Integration</h3>
              <p>Source Control & Repository Access</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Status banner */}
          <div className={`status-banner ${status.isConnected ? "connected" : "notice"}`}>
            {status.isConnected ? (
              <CheckCircle2 size={18} className="banner-icon teal" />
            ) : (
              <AlertCircle size={18} className="banner-icon blue" />
            )}
            <div>
              <strong>
                {status.isConnected
                  ? status.isDemo
                    ? "Connected in Preview Demo Mode"
                    : "Connected to GitHub Account"
                  : "GitHub Integration Not Configured Yet"}
              </strong>
              <p>
                {status.isConnected
                  ? status.isDemo
                    ? "Interactive preview data loaded for UI testing. All test repositories are clearly marked [DEMO]."
                    : `Active session authenticated as @${status.username}.`
                  : "Pre-hackathon status: Live OAuth secrets are deferred until hackathon kickoff. You can enable Preview Demo Mode to test the complete repository selection & repair workflow."}
              </p>
            </div>
          </div>

          {/* Security & Permissions details */}
          <div className="permissions-group">
            <h4>Requested Scopes & Security Guarantees</h4>
            <div className="permission-item">
              <ShieldCheck size={16} className="perm-icon" />
              <div>
                <strong>Least Privilege Access</strong>
                <small>REAPER only requests read access to target repositories and branch-creation write rights.</small>
              </div>
            </div>
            <div className="permission-item">
              <ShieldCheck size={16} className="perm-icon" />
              <div>
                <strong>Branch Isolation</strong>
                <small>REAPER never writes to protected branches (`main`, `master`). Fixes are committed to isolated repair branches.</small>
              </div>
            </div>
          </div>

          {/* Architecture notice for evaluators */}
          <div className="tech-spec-box">
            <div className="tech-spec-header">
              <Info size={14} />
              <span>Production Integration Architecture</span>
            </div>
            <code>
              GITHUB_APP_ID=••••••••<br />
              GITHUB_CLIENT_ID=••••••••<br />
              WEBHOOK_SECRET=••••••••
            </code>
          </div>
        </div>

        <div className="modal-footer">
          {status.isConnected ? (
            <>
              <button
                className="secondary-button"
                onClick={handleDisconnect}
                disabled={loading}
              >
                Disconnect GitHub
              </button>
              <button className="primary-button" onClick={onClose}>
                Done
              </button>
            </>
          ) : (
            <>
              <button className="secondary-button" onClick={onClose}>
                Cancel
              </button>
              <button
                className="primary-button glowing"
                onClick={handleToggleDemo}
                disabled={loading}
              >
                <GitHubIcon size={16} />
                {loading ? "Connecting..." : "Enable Preview Demo Repositories"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
