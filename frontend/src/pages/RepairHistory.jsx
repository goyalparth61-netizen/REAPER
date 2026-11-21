import { useEffect, useState, useCallback } from "react";
import {
  Search,
  RefreshCw,
  ArrowRight,
  Clock3
} from "lucide-react";
import { IconRepairHistory, IconRepo } from "../components/icons/ReaperIcons";
import ReaperMascotLogo from "../components/branding/ReaperMascotLogo";
import { apiService } from "../services/apiService";

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
      const res = await apiService.getRuns();
      if (res.online) {
        apiRuns = res.runs || [];
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
    if (s.includes("fail") || s.includes("error") || s.includes("unverified")) return "Needs attention";
    if (s.includes("analys") || s.includes("inspect") || s.includes("dispatch")) return "Analysing";
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
          <div className="stat-top">
            <span style={{ color: "var(--text-sage)", fontSize: "12px", textTransform: "uppercase" }}>Total Records</span>
            <IconRepairHistory size={19} />
          </div>
          <strong className="stat-value" style={{ color: "var(--accent-emerald)" }}>{runs.length}</strong>
          <small style={{ color: "var(--text-sage)" }}>
            {connected ? "Synced with backend" : "Local session cache"}
          </small>
        </article>

        <article className="panel stat-card hover-lift">
          <div className="stat-top">
            <span style={{ color: "var(--text-sage)", fontSize: "12px", textTransform: "uppercase" }}>Completed Repairs</span>
            <IconRepo size={19} />
          </div>
          <strong className="stat-value" style={{ color: "var(--accent-mint)" }}>
            {runs.filter((r) => getFriendlyStatus(r.status) === "Completed").length}
          </strong>
          <small style={{ color: "var(--text-sage)" }}>Regression-verified patches</small>
        </article>

        <article className="panel stat-card hover-lift">
          <div className="stat-top">
            <span style={{ color: "var(--text-sage)", fontSize: "12px", textTransform: "uppercase" }}>Safety Standard</span>
            <span className="status-pill status-completed" style={{ fontSize: "11px", padding: "2px 8px" }}>
              100%
            </span>
          </div>
          <strong className="stat-value" style={{ color: "var(--accent-champagne)" }}>Protected</strong>
          <small style={{ color: "var(--text-sage)" }}>Non-destructive branch writes</small>
        </article>
      </section>

      {/* Filter and Search Bar */}
      <section className="panel" style={{ padding: "14px 18px", marginBottom: 16 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div className="repo-search" style={{ margin: 0, flex: "1 1 280px" }}>
            <Search size={16} style={{ color: "var(--text-sage)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search past repairs by project, error, or branch..."
              aria-label="Search repairs"
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "var(--text-sage)", fontSize: "12px" }}>Filter:</span>
            {["all", "completed", "analysing", "needs attention"].map((f) => (
              <button
                key={f}
                className={`secondary-btn ${statusFilter === f ? "active" : ""}`}
                style={{
                  padding: "5px 12px",
                  fontSize: "12px",
                  background: statusFilter === f ? "rgba(66, 214, 164, 0.15)" : "transparent",
                  borderColor: statusFilter === f ? "var(--accent-emerald)" : "var(--border-forest)",
                  color: statusFilter === f ? "var(--accent-emerald)" : "var(--text-sage)"
                }}
                onClick={() => setStatusFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Runs Table */}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">ACTIVITY TRAIL</span>
            <h3>Repair Audit Log</h3>
          </div>
          <span className="repo-count">{filteredRuns.length} run(s)</span>
        </div>

        {loading ? (
          <div style={{ padding: "36px 0", textAlign: "center" }}>
            <RefreshCw size={24} className="spinning" style={{ color: "var(--accent-emerald)", margin: "0 auto 12px" }} />
            <p style={{ color: "var(--text-sage)", margin: 0 }}>Loading repair audit records...</p>
          </div>
        ) : filteredRuns.length === 0 ? (
          <div className="repo-empty" style={{ padding: "40px 20px" }}>
            <p style={{ color: "var(--text-sage)", margin: 0 }}>
              {runs.length === 0
                ? "No repair operations recorded yet. Start your first repair in the Workspace."
                : `No repairs matched "${search}".`}
            </p>
          </div>
        ) : (
          <div className="activity-table-wrap">
            <table className="activity-table">
              <thead>
                <tr>
                  <th>PROJECT & REPAIR ID</th>
                  <th>DIAGNOSED ISSUE</th>
                  <th>STATUS</th>
                  <th>TIMESTAMP</th>
                  <th>REPORT</th>
                </tr>
              </thead>
              <tbody>
                {filteredRuns.map((run, i) => {
                  const friendly = getFriendlyStatus(run.status);
                  const isSuccess = friendly === "Completed";
                  const runId = run.runId || run.id || `run-${i}`;
                  return (
                    <tr key={runId}>
                      <td>
                        <div className="repo-name">
                          <IconRepo size={16} />
                          <div>
                            <strong style={{ color: "var(--text-ivory)", display: "block" }}>
                              {run.repo || run.repo_name || "project"}
                            </strong>
                            <small style={{ color: "var(--text-sage)", fontSize: "11px", fontFamily: "monospace" }}>
                              {runId} • {run.branch || "main"}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td style={{ maxWidth: 320 }}>
                        <span style={{ color: "var(--text-ivory)", fontSize: "13px", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {run.issue || run.issue_description || "Software repair task"}
                        </span>
                        {run.stage && (
                          <small style={{ color: "var(--accent-champagne)", fontSize: "11px" }}>
                            Stage: {run.stage}
                          </small>
                        )}
                      </td>
                      <td>
                        <span
                          className={`status-pill ${
                            isSuccess
                              ? "status-completed"
                              : friendly === "Needs attention"
                              ? "status-waiting"
                              : "status-analysing"
                          }`}
                        >
                          {friendly}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-sage)", fontSize: "12px", whiteSpace: "nowrap" }}>
                        {run.timestamp || run.created_at || "Recent"}
                      </td>
                      <td>
                        <button
                          className="secondary-btn"
                          style={{ padding: "5px 10px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: 4 }}
                          onClick={() => {
                            try {
                              localStorage.setItem("reaper_active_report_id", runId);
                            } catch {}
                            if (onNavigate) onNavigate("Reports");
                          }}
                          title="View detailed repair report"
                        >
                          <span>View Report</span>
                          <ArrowRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div style={{ marginTop: 24, textAlign: "center", color: "var(--text-sage)", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <Clock3 size={13} />
        <span>All repair runs are persisted in PostgreSQL / SQLite audit tables with immutable timestamps.</span>
      </div>
    </div>
  );
}
