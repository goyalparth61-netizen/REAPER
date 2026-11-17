import { useState } from "react";
import {
  Save,
  Check,
  Sliders,
  Terminal
} from "lucide-react";
import { IconSafetyCenter, IconRepo } from "../components/icons/ReaperIcons";
import ReaperMascotLogo from "../components/branding/ReaperMascotLogo";
import { githubService } from "../services/githubService";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [saved, setSaved] = useState(false);

  // User-configurable settings
  const [strategy, setStrategy] = useState("cautious");
  const [branchPrefix, setBranchPrefix] = useState("reaper/fix-");
  const [notifyOnComplete, setNotifyOnComplete] = useState(true);
  const [requireApproval, setRequireApproval] = useState(true);
  const [autoAbortOnFail, setAutoAbortOnFail] = useState(true);
  const [sandboxMemory, setSandboxMemory] = useState("4GB");
  const [timeoutSecs, setTimeoutSecs] = useState("600");
  const [apiEndpoint, setApiEndpoint] = useState("http://127.0.0.1:8000");

  const authStatus = githubService.getStatus();

  function handleSave(e) {
    if (e) e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  }

  return (
    <div className="overview-page animate-page">
      {/* Page Header */}
      <section className="welcome-section">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <ReaperMascotLogo size={46} glow={true} float={false} />
          <div>
            <span className="eyebrow">SYSTEM CONFIGURATION</span>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Settings<span className="accent">.</span>
            </h2>
            <p>
              Customize how REAPER investigates problems, names branches, and tests fixes safely.
            </p>
          </div>
        </div>
      </section>

      {/* Settings Navigation Tabs */}
      <div className="settings-tabs-bar">
        <button
          className={`settings-tab-btn ${activeTab === "general" ? "active" : ""}`}
          onClick={() => setActiveTab("general")}
        >
          <Sliders size={15} />
          <span>General Preferences</span>
        </button>

        <button
          className={`settings-tab-btn ${activeTab === "github" ? "active" : ""}`}
          onClick={() => setActiveTab("github")}
        >
          <IconRepo size={15} />
          <span>GitHub & Projects</span>
        </button>

        <button
          className={`settings-tab-btn ${activeTab === "safety" ? "active" : ""}`}
          onClick={() => setActiveTab("safety")}
        >
          <IconSafetyCenter size={15} />
          <span>Safety & Review</span>
        </button>

        <button
          className={`settings-tab-btn ${activeTab === "sandbox" ? "active" : ""}`}
          onClick={() => setActiveTab("sandbox")}
        >
          <Terminal size={15} />
          <span>Test Environment</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="panel settings-content-panel">
        {/* Tab 1: General Preferences */}
        {activeTab === "general" && (
          <div className="settings-section-content">
            <h3 style={{ fontSize: "17px", color: "var(--text-ivory)", margin: "0 0 4px" }}>
              Repair Preferences
            </h3>
            <p style={{ color: "var(--text-sage)", fontSize: "13px", margin: "0 0 24px" }}>
              Choose how carefully REAPER plans and prepares code fixes.
            </p>

            <div className="setting-field-group">
              <label className="setting-label">Repair Approach</label>
              <div className="setting-options-grid">
                <label className={`setting-radio-card ${strategy === "cautious" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="strategy"
                    value="cautious"
                    checked={strategy === "cautious"}
                    onChange={() => setStrategy("cautious")}
                  />
                  <div>
                    <strong>Cautious Fix (Recommended)</strong>
                    <p>Makes the smallest possible code edit to fix the issue without modifying unrelated logic.</p>
                  </div>
                </label>

                <label className={`setting-radio-card ${strategy === "comprehensive" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="strategy"
                    value="comprehensive"
                    checked={strategy === "comprehensive"}
                    onChange={() => setStrategy("comprehensive")}
                  />
                  <div>
                    <strong>Comprehensive Refactor</strong>
                    <p>Addresses root architectural causes and adds extra unit test suites where feasible.</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="setting-field-group" style={{ marginTop: 24 }}>
              <label className="setting-label" htmlFor="branchPrefix">
                Branch Naming Format
              </label>
              <p className="setting-help">
                REAPER creates a dedicated branch with this prefix before suggesting code changes.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10, maxWidth: 360 }}>
                <input
                  id="branchPrefix"
                  type="text"
                  className="reaper-input"
                  value={branchPrefix}
                  onChange={(e) => setBranchPrefix(e.target.value)}
                  placeholder="reaper/fix-"
                />
              </div>
              <small style={{ color: "var(--text-sage)", fontSize: "11px", marginTop: 4, display: "block" }}>
                Preview: <code>{branchPrefix}auth-null-check</code>
              </small>
            </div>

            <div className="setting-field-group" style={{ marginTop: 24 }}>
              <label className="setting-toggle-row">
                <div>
                  <strong>Desktop Notifications</strong>
                  <p>Notify you with a chime when REAPER finishes checking and repairing your project.</p>
                </div>
                <input
                  type="checkbox"
                  className="reaper-checkbox"
                  checked={notifyOnComplete}
                  onChange={(e) => setNotifyOnComplete(e.target.checked)}
                />
              </label>
            </div>
          </div>
        )}

        {/* Tab 2: GitHub & Projects */}
        {activeTab === "github" && (
          <div className="settings-section-content">
            <h3 style={{ fontSize: "17px", color: "var(--text-ivory)", margin: "0 0 4px" }}>
              GitHub Connection & Access
            </h3>
            <p style={{ color: "var(--text-sage)", fontSize: "13px", margin: "0 0 24px" }}>
              Manage how REAPER connects to your source control repositories.
            </p>

            <div className="connection-summary-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <span className="status-pill status-completed">
                    {authStatus.isConnected ? (authStatus.isDemo ? "Demo Mode Active" : "Connected") : "Disconnected"}
                  </span>
                  <h4 style={{ margin: "8px 0 4px", color: "var(--text-ivory)" }}>
                    {authStatus.user ? authStatus.user.login : "Default Developer Account"}
                  </h4>
                  <p style={{ margin: 0, color: "var(--text-sage)", fontSize: "13px" }}>
                    {authStatus.isDemo ? "Running with sample repositories for instant testing." : "Direct GitHub API token linked."}
                  </p>
                </div>
              </div>
            </div>

            <div className="setting-field-group" style={{ marginTop: 20 }}>
              <label className="setting-label">Permissions Transparency</label>
              <ul className="safety-bullets-list" style={{ marginTop: 8 }}>
                <li>Read repository files, tests, and configuration.</li>
                <li>Create new proposed branches (e.g., <code>reaper/fix-...</code>).</li>
                <li><strong>Never</strong> push directly to your default branch (<code>main</code> or <code>master</code>).</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 3: Safety & Review */}
        {activeTab === "safety" && (
          <div className="settings-section-content">
            <h3 style={{ fontSize: "17px", color: "var(--text-ivory)", margin: "0 0 4px" }}>
              Safety & Human Review
            </h3>
            <p style={{ color: "var(--text-sage)", fontSize: "13px", margin: "0 0 24px" }}>
              Rules to ensure you remain in complete control of all code changes.
            </p>

            <div className="setting-toggle-row">
              <div>
                <strong>Require Confirmation Before Opening Pull Requests</strong>
                <p>REAPER will show you the exact code changes and wait for your approval before proposing a pull request.</p>
              </div>
              <input
                type="checkbox"
                className="reaper-checkbox"
                checked={requireApproval}
                onChange={(e) => setRequireApproval(e.target.checked)}
              />
            </div>

            <div className="setting-toggle-row" style={{ marginTop: 18 }}>
              <div>
                <strong>Stop Automatically If Any Test Fails</strong>
                <p>If any existing test fails after a patch is applied, REAPER discards the patch to prevent regressions.</p>
              </div>
              <input
                type="checkbox"
                className="reaper-checkbox"
                checked={autoAbortOnFail}
                onChange={(e) => setAutoAbortOnFail(e.target.checked)}
              />
            </div>

            <div className="setting-toggle-row disabled" style={{ marginTop: 18, opacity: 0.85 }}>
              <div>
                <strong>Hermetic Sandbox Isolation (Always Active)</strong>
                <p>Every test is locked in a sealed environment with zero network access and zero risk to production data.</p>
              </div>
              <span className="status-pill status-completed">Enforced</span>
            </div>
          </div>
        )}

        {/* Tab 4: Test Environment */}
        {activeTab === "sandbox" && (
          <div className="settings-section-content">
            <h3 style={{ fontSize: "17px", color: "var(--text-ivory)", margin: "0 0 4px" }}>
              Test Sandbox Environment
            </h3>
            <p style={{ color: "var(--text-sage)", fontSize: "13px", margin: "0 0 24px" }}>
              Resource limits and backend API connectivity for the repair engine.
            </p>

            <div className="setting-field-group">
              <label className="setting-label" htmlFor="apiEndpoint">
                Engine Backend API URL
              </label>
              <input
                id="apiEndpoint"
                type="text"
                className="reaper-input"
                style={{ maxWidth: 360 }}
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
              />
              <p className="setting-help">FastAPI agent endpoint running on localhost.</p>
            </div>

            <div className="setting-field-group" style={{ marginTop: 20 }}>
              <label className="setting-label" htmlFor="sandboxMemory">
                Container Memory Limit
              </label>
              <select
                id="sandboxMemory"
                className="reaper-select"
                style={{ maxWidth: 200 }}
                value={sandboxMemory}
                onChange={(e) => setSandboxMemory(e.target.value)}
              >
                <option value="2GB">2 GB RAM</option>
                <option value="4GB">4 GB RAM (Recommended)</option>
                <option value="8GB">8 GB RAM</option>
              </select>
            </div>

            <div className="setting-field-group" style={{ marginTop: 20 }}>
              <label className="setting-label" htmlFor="timeoutSecs">
                Execution Timeout
              </label>
              <select
                id="timeoutSecs"
                className="reaper-select"
                style={{ maxWidth: 200 }}
                value={timeoutSecs}
                onChange={(e) => setTimeoutSecs(e.target.value)}
              >
                <option value="300">5 Minutes (300s)</option>
                <option value="600">10 Minutes (600s - Standard)</option>
                <option value="1200">20 Minutes (1200s)</option>
              </select>
            </div>
          </div>
        )}

        {/* Save Bar */}
        <div className="settings-save-bar">
          <button type="submit" className="action-btn emerald-btn" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            {saved ? <Check size={16} /> : <Save size={16} />}
            <span>{saved ? "Preferences Saved!" : "Save Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
