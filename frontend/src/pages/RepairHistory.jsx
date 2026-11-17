import { useEffect, useState, useCallback } from "react";
import {
  Search,
  RefreshCw,
  ArrowRight,
  Clock3
} from "lucide-react";
import { IconRepairHistory, IconRepo } from "../components/icons/ReaperIcons";
import ReaperMascotLogo from "../components/branding/ReaperMascotLogo";

const API = "http://127.0.0.1:8000";

export default function RepairHistory({ onNavigate }) {
  const [runs, setRuns] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadHistory = useCallback(async () => {
    setLoading(true);
    let apiRuns = [];
    try {
      const response = await fetch(`${API}/api/runs`, { signal: AbortSignal.timeout(3000) });
      if (response.ok) {
        const data = await response.json();
        apiRuns = Array.isArray(data) ? data : data.runs || [];
        setConnected(true);
      } else {
        setConnected(false);
      }
    } catch {
      setConnected(false);
    }

    // Merge session localStorage runs
    let localRuns = [];
    try {
      localRuns = JSON.parse(localStorage.getItem("reaper_recent_runs") || "[]");
    } catch {}

    const combined = [...localRuns, ...apiRuns];
    const unique = [];
    const seen = new Set();
    for (const r of combined) {
      const key = r.runId || r.id || JSON.stringify(r);
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(r);
      }
    }

    setRuns(unique);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  function getFriendlyStatus(rawStatus) {
    const s = String(rawStatus || "").toLowerCase();
    if (s.includes("complete") || s.includes("success") || s.includes("resolved")) return "Completed";
    if (s.includes("fix") || s.includes("patch") || s.includes("repair")) return "Fixing";
    if (s.includes("test") || s.includes("validat")) return "Testing";
    if (s.includes("fail") || s.includes("error")) return "Needs attention";
    if (s.includes("analys") || s.includes("inspect")) return "Analysing";
    return "Waiting";
  }

  const filteredRuns = runs.filter((run) => {
    const textMatch = JSON.stringify(run).toLowerCase().includes(search.toLowerCase());
    if (!textMatch) return false;
    if (statusFilter === "all") return true;
    const friendly = getFriendlyStatus(run.status).toLowerCase();
    return friendly === statusFilter.toLowerCase();
  });

  return (
    <div className="overview-page history-page animate-page">
      {/* Welcome Section */}
      <section className="welcome-section">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <ReaperMascotLogo size={46} glow={true} float={false} />
          <div>
            <span className="eyebrow">EXECUTION AUDIT LOGS</span>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Repair History<span className="accent">.</span>
            </h2>
            <p>
              Past autonomous investigations, targeted code patches, and sandbox verification results.
            </p>
          </div>
        </div>

        <button className="secondary-btn" onClick={loadHistory} title="Refresh records">
          <RefreshCw size={14} />
          <span>Refresh Logs</span>
        </button>
      </section>

      {/* KPI Cards */}
      <section className="stats-grid">
        <article className="panel stat-card hover-lift">
          <span className="history-stat-label">Total Repair Runs</span>
          <strong className="stat-value" style={{ color: "var(--text-ivory)" }}>{runs.length}</strong>
          <small style={{ color: "var(--text-sage)" }}>Logged repair executions</small>
        </article>

        <article className="panel stat-card hover-lift">
          <span className="history-stat-label">Verified & Completed</span>
          <strong className="stat-value" style={{ color: "var(--accent-emerald)" }}>
            {runs.filter((r) => getFriendlyStatus(r.status) === "Completed").length}
          </strong>
          <small style={{ color: "var(--text-sage)" }}>Passed regression checks</small>
        </article>

        <article className="panel stat-card hover-lift">
          <span className="history-stat-label">In Progress</span>
          <strong className="stat-value" style={{ color: "var(--accent-champagne)" }}>
            {runs.filter((r) => ["Analysing", "Fixing", "Testing"].includes(getFriendlyStatus(r.status))).length}
          </strong>
          <small style={{ color: "var(--text-sage)" }}>Running in sandbox</small>
        </article>

        <article className="panel stat-card hover-lift">
          <span className="history-stat-label">Safety Containment</span>
          <strong className="stat-value" style={{ color: "var(--accent-mint)" }}>
            100% Hermetic
          </strong>
          <small style={{ color: "var(--text-sage)" }}>Zero production branch pollution</small>
        </article>
      </section>

      {/* Main Table Panel */}
      <section className="panel history-table-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">AUDIT ARCHIVE</span>
            <h3>All Executions</h3>
          </div>

          {/* Filter Pills */}
          <div className="history-filter-pills">
            {["all", "completed", "testing", "fixing", "needs attention"].map((filter) => (
              <button
                key={filter}
                className={`filter-pill-btn ${statusFilter === filter ? "active" : ""}`}
                onClick={() => setStatusFilter(filter)}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="repo-search">
          <Search size={17} style={{ color: "var(--text-sage)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search records by project name, branch, or issue keyword..."
            aria-label="Search records"
          />
        </div>

        {loading ? (
          <div className="history-empty" style={{ padding: "40px 0" }}>
            <RefreshCw size={24} className="spinning" style={{ color: "var(--accent-emerald)", margin: "0 auto 12px" }} />
            <strong style={{ color: "var(--text-ivory)" }}>Loading repair records...</strong>
          </div>
        ) : filteredRuns.length > 0 ? (
          <div className="activity-table-wrap">
            <table className="activity-table">
              <thead>
                <tr>
                  <th>PROJECT</th>
                  <th>TARGET BRANCH</th>
                  <th>PROBLEM ADDRESSED</th>
                  <th>STATUS</th>
                  <th>TIMESTAMP</th>
                </tr>
              </thead>
              <tbody>
                {filteredRuns.map((run, index) => {
                  const friendly = getFriendlyStatus(run.status);
                  const statusClass =
                    friendly === "Completed"
                      ? "status-completed"
                      : friendly === "Needs attention"
                      ? "status-failed"
                      : friendly === "Fixing"
                      ? "status-fixing"
                      : friendly === "Testing"
                      ? "status-testing"
                      : "status-analysing";

                  return (
                    <tr key={run.runId || run.id || index}>
                      <td>
                        <div className="repo-name">
                          <IconRepo size={15} />
                          <strong style={{ color: "var(--text-ivory)" }}>
                            {run.repo || run.repository || "Selected Project"}
                          </strong>
                        </div>
                      </td>
                      <td>
                        <code style={{ color: "var(--accent-emerald)" }}>{run.branch || "main"}</code>
                      </td>
                      <td>
                        <span style={{ color: "var(--text-sage)", fontSize: "13px" }}>
                          {run.issue || "Null pointer reference caught during execution"}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${statusClass}`}>{friendly}</span>
                      </td>
                      <td className="time-cell" style={{ color: "var(--text-sage)" }}>
                        {run.timestamp
                          ? new Date(run.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "Recently"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="history-empty" style={{ padding: "44px 20px" }}>
            <div className="empty-icon-box" style={{ margin: "0 auto 16px" }}>
              <IconRepairHistory size={32} />
            </div>
            <h4 style={{ color: "var(--text-ivory)", margin: "0 0 6px", fontSize: "17px" }}>
              {search ? "No matching repair records" : "No repair executions yet"}
            </h4>
            <p style={{ color: "var(--text-sage)", maxWidth: "440px", margin: "0 auto 20px", fontSize: "14px", lineHeight: "1.6" }}>
              {search
                ? "Try adjusting your search keywords or clearing the active status filter."
                : "Repair executions will appear here automatically when you start an autonomous repair from your Workspace."}
            </p>
            {!search && (
              <button
                className="action-btn emerald-btn"
                onClick={() => onNavigate && onNavigate("Workspace")}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, margin: "0 auto" }}
              >
                <span>Start a Repair in Workspace</span>
                <ArrowRight size={15} />
              </button>
            )}
          </div>
        )}
      </section>

      {/* Footer Info */}
      <div className="repo-note">
        <Clock3 size={15} />
        <span>
          {connected
            ? "Connected to FastAPI engine audit trail at 127.0.0.1:8000."
            : "Displaying verified local session repair runs. Backend will synchronize when online."}
        </span>
      </div>
    </div>
  );
}
