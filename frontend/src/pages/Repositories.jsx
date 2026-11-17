import { useState, useEffect, useCallback } from "react";
import {
  GitBranch,
  Search,
  RefreshCw,
  ShieldCheck
} from "lucide-react";
import {
  IconRepo,
  IconSafetyCenter,
  IconAnalyse,
  IconStartRepair
} from "../components/icons/ReaperIcons";
import GitHubIcon from "../components/GitHubIcon";
import ReaperMascotLogo from "../components/branding/ReaperMascotLogo";
import { githubService } from "../services/githubService";
import GitHubConnectModal from "../components/GitHubConnectModal";

export default function Repositories({ onNavigate }) {
  const [search, setSearch] = useState("");
  const [authStatus, setAuthStatus] = useState(githubService.getStatus());
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadRepos = useCallback(async () => {
    const status = githubService.getStatus();
    setAuthStatus(status);
    if (!status.isConnected) {
      setRepositories([]);
      return;
    }

    setLoading(true);
    try {
      const res = await githubService.getRepositories();
      if (res.success) {
        setRepositories(res.repositories);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRepos();
  }, [loadRepos, authStatus.isConnected, authStatus.isDemo]);

  const filteredRepos = repositories.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.owner.toLowerCase().includes(search.toLowerCase()) ||
      (r.language && r.language.toLowerCase().includes(search.toLowerCase()))
  );

  function handleSelectAndRepair(repo) {
    // Store selected repo in localStorage so Workspace can pick it up immediately
    try {
      localStorage.setItem("reaper_selected_repo", JSON.stringify(repo));
    } catch {}
    if (onNavigate) {
      onNavigate("Workspace");
    }
  }

  return (
    <div className="overview-page repositories-page animate-page">
      {/* Welcome Header */}
      <section className="welcome-section">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <ReaperMascotLogo size={46} glow={true} float={false} />
          <div>
            <span className="eyebrow">SOURCE CONTROL REPOSITORIES</span>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Your Projects<span className="accent">.</span>
            </h2>
            <p>
              Choose any project for REAPER to inspect, find what went wrong, and test fixes safely.
            </p>
          </div>
        </div>
        <button
          className="action-btn emerald-btn"
          onClick={() => setIsModalOpen(true)}
          style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          <GitHubIcon size={16} />
          <span>{authStatus.isConnected ? "Manage GitHub" : "Connect GitHub"}</span>
        </button>
      </section>

      {/* KPI Metric Cards */}
      <section className="repository-summary">
        <div className="panel repo-summary-card hover-lift">
          <div className="stat-icon">
            <IconRepo size={20} />
          </div>
          <div>
            <strong>{repositories.length}</strong>
            <span>Available Projects</span>
          </div>
        </div>

        <div className="panel repo-summary-card hover-lift">
          <div className="stat-icon">
            <IconAnalyse size={20} />
          </div>
          <div>
            <strong>{authStatus.isConnected ? "Ready" : "Waiting"}</strong>
            <span>Project Status</span>
          </div>
        </div>

        <div className="panel repo-summary-card hover-lift">
          <div className="stat-icon">
            <IconSafetyCenter size={20} />
          </div>
          <div>
            <strong>{authStatus.isConnected ? "Protected" : "—"}</strong>
            <span>Branch Protection</span>
          </div>
        </div>
      </section>

      {/* Main Repository Explorer Panel */}
      <section className="panel repository-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">ACCESSIBLE CODEBASES</span>
            <h3>Connected Projects</h3>
          </div>
          <span className="repo-count">{repositories.length} total</span>
        </div>

        {/* Search Bar */}
        <div className="repo-search">
          <Search size={17} style={{ color: "var(--text-sage)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name, owner or language (e.g. Python, TypeScript)..."
            aria-label="Search repositories"
          />
        </div>

        {!authStatus.isConnected ? (
          <div className="repo-empty">
            <div className="github-icon">
              <GitHubIcon size={34} />
            </div>

            <h3 style={{ color: "var(--text-ivory)", margin: "14px 0 6px" }}>No projects connected yet</h3>
            <p style={{ color: "var(--text-sage)", maxWidth: "460px", margin: "0 auto 16px" }}>
              Connect your GitHub account or enable Preview Demo Mode to let REAPER safely inspect your code.
            </p>

            <div className="repo-requirements" style={{ marginBottom: 20 }}>
              <div><IconSafetyCenter size={15} /> Read-only code inspection</div>
              <div><IconSafetyCenter size={15} /> All tests run in isolated sandboxes</div>
              <div><IconRepo size={15} /> Creates PR branches without touching main</div>
            </div>

            <button
              className="action-btn emerald-btn"
              onClick={() => setIsModalOpen(true)}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, margin: "0 auto" }}
            >
              <GitHubIcon size={16} />
              <span>Connect GitHub</span>
            </button>
          </div>
        ) : loading ? (
          <div className="repo-loading-box" style={{ margin: "32px 0", textAlign: "center" }}>
            <RefreshCw size={24} className="spinning" style={{ color: "var(--accent-emerald)", margin: "0 auto 12px" }} />
            <p style={{ color: "var(--text-sage)", margin: 0 }}>Checking accessible projects...</p>
          </div>
        ) : filteredRepos.length === 0 ? (
          <div className="repo-empty">
            <p style={{ color: "var(--text-sage)" }}>No matching projects found for "{search}".</p>
          </div>
        ) : (
          <div className="activity-table-wrap">
            <table className="activity-table">
              <thead>
                <tr>
                  <th>PROJECT NAME</th>
                  <th>VISIBILITY</th>
                  <th>DEFAULT BRANCH</th>
                  <th>LANGUAGE</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredRepos.map((repo) => (
                  <tr key={repo.id}>
                    <td>
                      <div className="repo-name">
                        <IconRepo size={16} />
                        <strong style={{ color: "var(--text-ivory)" }}>{repo.fullName}</strong>
                        {repo.isDemo && (
                          <span className="demo-tag" style={{ background: "rgba(201, 169, 110, 0.15)", color: "var(--accent-champagne)" }}>
                            DEMO
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="status-pill status-completed">
                        {repo.visibility === "private" ? "Private" : "Public"}
                      </span>
                    </td>
                    <td>
                      <span className="branch-badge">
                        <GitBranch size={12} /> {repo.defaultBranch || "main"}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: "var(--text-sage)" }}>{repo.language || "Multi-language"}</span>
                    </td>
                    <td>
                      <span style={{ color: "var(--accent-emerald)", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <ShieldCheck size={13} />
                        Ready to repair
                      </span>
                    </td>
                    <td>
                      <button
                        className="secondary-btn"
                        style={{ padding: "6px 12px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: 6 }}
                        onClick={() => handleSelectAndRepair(repo)}
                        title="Start repair with this project"
                      >
                        <IconStartRepair size={13} />
                        <span>Repair Project</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Helpful Safety Note Footer */}
      <div className="repo-note">
        <IconSafetyCenter size={16} />
        <span>
          {authStatus.isConnected
            ? authStatus.isDemo
              ? "Preview Demo Mode active. Repositories shown are verified open-source projects."
              : "Connected securely. REAPER never commits directly to your production branch."
            : "GitHub is not connected. Connect above to allow REAPER to inspect your code."}
        </span>
      </div>

      <GitHubConnectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStatusChange={() => {
          setAuthStatus(githubService.getStatus());
          loadRepos();
        }}
      />
    </div>
  );
}
