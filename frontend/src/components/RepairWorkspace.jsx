import { useState, useEffect, useMemo, useRef } from "react";
import {
  GitBranch,
  Search,
  ChevronDown,
  Lock,
  Globe,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Check,
  X,
  ArrowRight
} from "lucide-react";
import ReaperMascotLogo from "./branding/ReaperMascotLogo";
import { IconRepo, IconStartRepair } from "./icons/ReaperIcons";
import GitHubIcon from "./GitHubIcon";
import { githubService } from "../services/githubService";
import GitHubConnectModal from "./GitHubConnectModal";
import RepairConfirmModal from "./RepairConfirmModal";

export default function RepairWorkspace({ onNavigate }) {
  const [authStatus, setAuthStatus] = useState(githubService.getStatus());
  const [repositories, setRepositories] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [repoError, setRepoError] = useState("");
  
  // Selection state
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  
  // UI Dropdown states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [repoSearch, setRepoSearch] = useState("");

  // Modals
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load repositories whenever auth status changes
  useEffect(() => {
    async function fetchRepos() {
      const current = githubService.getStatus();
      setAuthStatus(current);

      if (!current.isConnected) {
        setRepositories([]);
        setSelectedRepo(null);
        setRepoError("");
        return;
      }

      setLoadingRepos(true);
      setRepoError("");
      try {
        const res = await githubService.getRepositories();
        if (res.success) {
          setRepositories(res.repositories);
          if (res.repositories.length > 0) {
            // Check if user pre-selected a repository from the Repositories page
            let preSelected = null;
            try {
              const saved = localStorage.getItem("reaper_selected_repo");
              if (saved) preSelected = JSON.parse(saved);
            } catch {}

            const match = preSelected ? res.repositories.find(r => r.id === preSelected.id || r.fullName === preSelected.fullName) : null;
            const target = match || res.repositories[0];

            setSelectedRepo((prev) => prev || target);
            setSelectedBranch((prev) => prev || target.defaultBranch || "main");
          }
        } else {
          setRepoError(res.error || "Failed to load repositories");
        }
      } catch {
        setRepoError("Unable to retrieve repositories from source control.");
      } finally {
        setLoadingRepos(false);
      }
    }

    fetchRepos();
  }, [authStatus.isConnected, authStatus.isDemo]);

  function handleAuthStatusChange() {
    const updated = githubService.getStatus();
    setAuthStatus(updated);
  }

  function handleEnableDemo() {
    githubService.setDemoMode(true);
    handleAuthStatusChange();
  }

  // Filter repositories based on search
  const filteredRepos = useMemo(() => {
    if (!repoSearch.trim()) return repositories;
    const q = repoSearch.toLowerCase();
    return repositories.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.owner.toLowerCase().includes(q) ||
        (r.language && r.language.toLowerCase().includes(q))
    );
  }, [repositories, repoSearch]);

  function handleSelectRepo(repo) {
    setSelectedRepo(repo);
    setSelectedBranch(repo.defaultBranch || "main");
    setIsDropdownOpen(false);
    setRepoSearch("");
  }

  const examplePrompts = [
    "TypeError: Cannot read properties of undefined in authMiddleware.ts:42",
    "Failing unit test suite in test_checkout.py on null idempotency key",
    "500 Internal Error: Connection timeout in database pool retry loop"
  ];

  return (
    <section className="repair-workspace-card" id="repair-workspace">
      {/* Top Glass Header & Live Status */}
      <div className="workspace-card-header">
        <div className="workspace-header-title">
          <div className="brand-workspace-icon">
            <ReaperMascotLogo size={24} glow={false} />
          </div>
          <div>
            <h3>Autonomous Repair Workspace</h3>
            <p>Single-deck software diagnosis, semantic patch synthesis & sandbox verification</p>
          </div>
        </div>

        <div className="workspace-header-badges">
          {authStatus.isConnected ? (
            <span className="mode-pill connected" title="Source control connected">
              <span className="pulsing-dot" />
              {authStatus.isDemo ? "Preview Demo Repos" : "GitHub Connected"}
            </span>
          ) : (
            <span className="mode-pill offline" title="GitHub integration not configured yet">
              <span className="offline-dot" />
              GitHub Awaiting Auth
            </span>
          )}
          <span className="mode-pill sandbox-tag">
            <Lock size={11} />
            Hermetic Sandbox
          </span>
        </div>
      </div>

      <div className="workspace-steps-container">
        {/* STEP 1: Connect GitHub */}
        <div className={`workspace-step ${authStatus.isConnected ? "completed" : "active"}`}>
          <div className="step-marker">
            <span className="step-num">01</span>
            <div className={`step-line ${authStatus.isConnected ? "illuminated" : ""}`} />
          </div>

          <div className="step-content">
            <div className="step-header">
              <div className="step-title-group">
                <h4>
                  Connect GitHub <span className="step-label-pill">{authStatus.isConnected ? "AUTHENTICATED" : "STEP 1"}</span>
                </h4>
                <p>Grant REAPER read-only access to inspect your codebase and branch-write rights for verified fixes.</p>
              </div>

              <div className="step-actions">
                {authStatus.isConnected ? (
                  <div className="connected-user-chip">
                    <div className="gh-avatar">
                      <GitHubIcon size={16} />
                    </div>
                    <div className="gh-user-info">
                      <strong>@{authStatus.username}</strong>
                      <small>{authStatus.isDemo ? "Demo Sandbox" : "OAuth Session"}</small>
                    </div>
                    <button
                      className="mini-text-btn"
                      onClick={() => setIsGitHubModalOpen(true)}
                    >
                      Manage
                    </button>
                  </div>
                ) : (
                  <div className="unauth-button-group">
                    <button
                      className="primary-button glowing step-connect-btn"
                      onClick={() => setIsGitHubModalOpen(true)}
                    >
                      <GitHubIcon size={16} />
                      <span>Connect GitHub</span>
                    </button>
                    <button
                      className="secondary-button demo-fast-btn"
                      onClick={handleEnableDemo}
                      title="Quick load sandbox repositories"
                    >
                      <Sparkles size={14} className="teal-icon" />
                      <span>Use Demo Repos</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {!authStatus.isConnected && (
              <div className="step-notice">
                <AlertCircle size={14} className="notice-icon" />
                <span>
                  Hackathon Notice: Live OAuth secrets are ready for hackathon kickoff. Click <strong>Connect GitHub</strong> or <strong>Use Demo Repos</strong> to evaluate the repository picker and repair flow.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* STEP 2: Select Repository */}
        <div className={`workspace-step ${selectedRepo ? "completed" : authStatus.isConnected ? "active" : "disabled"}`}>
          <div className="step-marker">
            <span className="step-num">02</span>
            <div className={`step-line ${selectedRepo ? "illuminated" : ""}`} />
          </div>

          <div className="step-content" ref={dropdownRef}>
            <div className="step-header">
              <div className="step-title-group">
                <h4>
                  Select Target Repository <span className="step-label-pill">{selectedRepo ? "SELECTED" : "STEP 2"}</span>
                </h4>
                <p>Choose the repository where REAPER will isolate faults, parse ASTs, and generate a verified patch.</p>
              </div>
            </div>

            {!authStatus.isConnected ? (
              <div className="step-locked-box">
                <IconRepo size={22} className="locked-icon" />
                <div>
                  <strong>No repository connected</strong>
                  <p>Authenticate GitHub in Step 1 above to load your repositories.</p>
                </div>
              </div>
            ) : loadingRepos ? (
              <div className="repo-loading-box">
                <RefreshCw size={18} className="spinning" />
                <span>Querying accessible repositories...</span>
              </div>
            ) : repoError ? (
              <div className="repo-error-box">
                <AlertCircle size={18} />
                <span>{repoError}</span>
              </div>
            ) : (
              <div className="repo-selector-wrapper">
                {/* Command Bar Styled Dropdown Trigger */}
                <div
                  className={`repo-dropdown-trigger ${isDropdownOpen ? "open" : ""}`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="trigger-left">
                    <IconRepo size={18} className="repo-icon teal" />
                    {selectedRepo ? (
                      <div className="selected-repo-summary">
                        <div className="repo-name-row">
                          <span className="repo-owner">{selectedRepo.owner}/</span>
                          <strong className="repo-name">{selectedRepo.name}</strong>
                          {selectedRepo.isDemo && <span className="demo-pill">[DEMO]</span>}
                        </div>
                        <span className="repo-desc">{selectedRepo.description}</span>
                      </div>
                    ) : (
                      <span className="placeholder-text">Choose a repository to repair...</span>
                    )}
                  </div>

                  <div className="trigger-right">
                    {selectedRepo && (
                      <span className="branch-badge">
                        <GitBranch size={12} /> {selectedBranch}
                      </span>
                    )}
                    <ChevronDown size={16} className={`chevron ${isDropdownOpen ? "rotated" : ""}`} />
                  </div>
                </div>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="repo-dropdown-menu">
                    <div className="dropdown-search-box">
                      <Search size={15} />
                      <input
                        type="text"
                        placeholder="Search repository or language (e.g. TypeScript, Python)..."
                        value={repoSearch}
                        onChange={(e) => setRepoSearch(e.target.value)}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                      {repoSearch && (
                        <button
                          className="search-clear-btn"
                          onClick={() => setRepoSearch("")}
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    <div className="dropdown-items-list">
                      {filteredRepos.length === 0 ? (
                        <div className="dropdown-empty-state">
                          <AlertCircle size={16} />
                          <span>No matching repositories found.</span>
                        </div>
                      ) : (
                        filteredRepos.map((r) => {
                          const isSelected = selectedRepo?.id === r.id;
                          return (
                            <div
                              key={r.id}
                              className={`dropdown-item ${isSelected ? "selected" : ""}`}
                              onClick={() => handleSelectRepo(r)}
                            >
                              <div className="item-main">
                                <div className="item-title">
                                  <span className="item-owner">{r.owner}/</span>
                                  <strong className="item-name">{r.name}</strong>
                                  {r.isDemo && <span className="item-demo-pill">DEMO</span>}
                                </div>
                                <div className="item-meta">
                                  <span className="visibility-tag">
                                    {r.visibility === "private" ? (
                                      <Lock size={11} />
                                    ) : (
                                      <Globe size={11} />
                                    )}
                                    {r.visibility}
                                  </span>
                                  <span className="branch-tag">
                                    <GitBranch size={11} /> {r.defaultBranch}
                                  </span>
                                  {r.language && (
                                    <span className="lang-tag">{r.language}</span>
                                  )}
                                  {r.lastScan && (
                                    <span className="scan-tag">{r.lastScan}</span>
                                  )}
                                </div>
                              </div>
                              {isSelected && <Check size={16} className="check-icon teal" />}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* STEP 3: Describe the Problem (Optional) */}
        <div className={`workspace-step ${selectedRepo ? "active" : "disabled"}`}>
          <div className="step-marker">
            <span className="step-num">03</span>
            <div className={`step-line ${selectedRepo ? "illuminated" : ""}`} />
          </div>

          <div className="step-content">
            <div className="step-header">
              <div className="step-title-group">
                <h4>
                  Describe the Issue <span className="optional-tag">(optional)</span>
                </h4>
                <p>
                  Paste an error message, stack trace, or describe what went wrong. If left blank, REAPER
                  automatically runs the repository test suite to identify failures.
                </p>
              </div>
            </div>

            <div className="issue-input-container">
              <div className="issue-editor-wrapper">
                <div className="editor-prompt-indicator">reaper&gt;_</div>
                <textarea
                  className="issue-textarea"
                  rows={3}
                  placeholder="e.g. In checkout/payment.ts: Payment webhook crashes with 500 when idempotency-key header is absent..."
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  disabled={!selectedRepo}
                />
              </div>

              {/* Quick Prompt Suggestions */}
              {selectedRepo && (
                <div className="prompt-suggestions">
                  <span className="suggestions-label">
                    <Sparkles size={12} className="teal-icon" /> Quick diagnostic prompts:
                  </span>
                  <div className="suggestion-pills">
                    {examplePrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="suggestion-pill"
                        onClick={() => setIssueDescription(prompt)}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* STEP 4: Start Repair */}
        <div className={`workspace-step step-launch ${selectedRepo ? "ready" : "disabled"}`}>
          <div className="step-marker">
            <span className="step-num">04</span>
          </div>

          <div className="step-content">
            <div className="launch-action-bar">
              <div className="launch-summary">
                <div className="summary-target">
                  <span className="summary-label">Target Execution:</span>
                  <strong>
                    {selectedRepo ? (
                      <>
                        {selectedRepo.fullName} <span className="target-branch-pill">({selectedBranch || "main"})</span>
                      </>
                    ) : (
                      "Awaiting repository selection"
                    )}
                  </strong>
                </div>
                <div className="summary-safety">
                  <CheckCircle2 size={14} className="teal" />
                  <span>Isolated Container Sandbox • Zero Direct Commits to Main • Verified Regression Run</span>
                </div>
              </div>

              <button
                className={`start-repair-btn ${selectedRepo ? "active-glow" : "disabled"}`}
                disabled={!selectedRepo}
                onClick={() => setIsConfirmModalOpen(true)}
              >
                <IconStartRepair size={18} className="btn-zap" />
                <span>Start Repair</span>
                <ArrowRight size={16} className="btn-arrow" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <GitHubConnectModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        onStatusChange={handleAuthStatusChange}
      />

      <RepairConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        repo={selectedRepo}
        branch={selectedBranch}
        issueDescription={issueDescription}
        onSuccessNavigate={onNavigate}
      />
    </section>
  );
}
