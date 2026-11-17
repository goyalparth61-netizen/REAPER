import { useState, useEffect } from "react";
import {
  Menu,
  ChevronDown,
  LogOut
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ReaperMascotLogo from "./branding/ReaperMascotLogo";
import {
  IconRepo,
  IconSafetyCenter,
  IconSettings,
  IconUserProfile
} from "./icons/ReaperIcons";
import GitHubIcon from "./GitHubIcon";
import { githubService } from "../services/githubService";
import { apiService } from "../services/apiService";
import GitHubConnectModal from "./GitHubConnectModal";
import DocumentationModal from "./DocumentationModal";

export default function Header({
  activePage,
  setActivePage,
  sidebarCollapsed,
  setSidebarCollapsed,
  mobileOpen,
  setMobileOpen
}) {
  const { user, logout } = useAuth();
  const [authStatus, setAuthStatus] = useState(githubService.getStatus());
  const [backendStatus, setBackendStatus] = useState({ online: false, state: "CHECKING" });
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkHealth() {
      const res = await apiService.getStatus();
      if (active) {
        setBackendStatus(res);
        setAuthStatus(githubService.getStatus());
      }
    }

    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  function handleNav(page) {
    setActivePage(page);
    setUserDropdownOpen(false);
  }

  return (
    <header className="reaper-header">
      <div className="header-inner">
        {/* Left: Mobile hamburger toggle & Brand Logo */}
        <div className="header-brand-group">
          {/* Mobile Menu Hamburger (< 1024px) */}
          <button
            className="mobile-hamburger-btn"
            onClick={() => setMobileOpen && setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation drawer"
          >
            <Menu size={20} />
          </button>

          {/* Desktop Sidebar Collapse Toggle */}
          <button
            className="sidebar-toggle-btn desktop-only"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label="Toggle sidebar width"
          >
            <Menu size={18} />
          </button>

          <div className="header-brand" onClick={() => handleNav("Workspace")}>
            <div className="brand-logo-glow reaper-header-symbol">
              <ReaperMascotLogo size={26} glow={true} float={false} />
            </div>
            <div className="brand-text">
              <span className="brand-title" style={{ fontFamily: "'Space Grotesk', 'Sora', sans-serif", fontWeight: 800, letterSpacing: "1.5px" }}>REAPER</span>
              <span className="brand-badge" style={{ color: "var(--accent-champagne)", letterSpacing: "1px", fontWeight: 700 }}>
                AI REPAIR ENGINE
              </span>
            </div>
          </div>
        </div>

        {/* Center: Top Navigation Links */}
        <nav className="header-nav" aria-label="Main Navigation">
          <button
            className={`header-nav-link ${activePage === "Workspace" || activePage === "Overview" ? "active" : ""}`}
            onClick={() => handleNav("Workspace")}
          >
            Workspace
          </button>

          <button
            className={`header-nav-link ${activePage === "Live Agent" ? "active" : ""}`}
            onClick={() => handleNav("Live Agent")}
          >
            Live Agent
          </button>

          <button
            className={`header-nav-link ${activePage === "Repair History" || activePage === "Activity" ? "active" : ""}`}
            onClick={() => handleNav("Repair History")}
          >
            Activity
          </button>

          <button
            className={`header-nav-link ${activePage === "Reports" ? "active" : ""}`}
            onClick={() => handleNav("Reports")}
          >
            Reports
          </button>

          <button
            className={`header-nav-link ${activePage === "Team" ? "active" : ""}`}
            onClick={() => handleNav("Team")}
          >
            Team CiPher
          </button>

          <button
            className="header-nav-link doc-link"
            onClick={() => setIsDocModalOpen(true)}
          >
            Docs
          </button>
        </nav>

        {/* Right: Status Pills & User Profile */}
        <div className="header-actions">
          {/* Agent Engine Status Pill */}
          <div className="header-status-pill agent-pill" title="Engine Status">
            <span className={`status-dot ${backendStatus.online ? "online" : "offline"}`} />
            <span className="status-text desktop-only">
              {backendStatus.online ? "Engine Ready" : "Standby Mode"}
            </span>
          </div>

          {/* GitHub Connection Pill */}
          {authStatus.isConnected ? (
            <button
              className="header-status-pill gh-pill connected"
              onClick={() => setIsGitHubModalOpen(true)}
              title="Manage GitHub Connection"
            >
              <GitHubIcon size={14} />
              <span className="gh-user-name">
                {authStatus.isDemo ? "Demo Sandbox" : `@${authStatus.username}`}
              </span>
            </button>
          ) : (
            <button
              className="action-btn emerald-btn header-connect-btn"
              onClick={() => setIsGitHubModalOpen(true)}
            >
              <GitHubIcon size={14} />
              <span>Connect GitHub</span>
            </button>
          )}

          {/* User Profile Menu with Dropdown */}
          <div className="header-user-wrapper">
            <button
              className="header-avatar-btn"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              aria-label="User account menu"
            >
              <IconUserProfile size={18} />
              <ChevronDown size={13} className={`avatar-chevron ${userDropdownOpen ? "open" : ""}`} />
            </button>

            {userDropdownOpen && (
              <div className="header-dropdown-menu">
                <div className="dropdown-user-header">
                  <strong>{user?.fullName || "REAPER Engineer"}</strong>
                  <small style={{ color: "var(--accent-champagne)" }}>
                    {user?.email || "Autonomous Repair Lead"}
                  </small>
                </div>

                <div className="dropdown-divider" />

                <button className="dropdown-menu-item" onClick={() => handleNav("Repositories")}>
                  <IconRepo size={15} />
                  <span>Your Projects</span>
                </button>

                <button className="dropdown-menu-item" onClick={() => handleNav("Safety Center")}>
                  <IconSafetyCenter size={15} />
                  <span>Safety Center</span>
                </button>

                <button className="dropdown-menu-item" onClick={() => handleNav("Settings")}>
                  <IconSettings size={15} />
                  <span>Settings</span>
                </button>

                <button className="dropdown-menu-item" onClick={() => handleNav("Team")}>
                  <span>Team CiPher</span>
                </button>

                <div className="dropdown-divider" />

                <button className="dropdown-menu-item" onClick={() => setIsDocModalOpen(true)}>
                  <span>Architecture & Docs</span>
                </button>

                <div className="dropdown-divider" />

                <button
                  className="dropdown-menu-item logout-item"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    logout();
                  }}
                  title="Sign out of REAPER"
                >
                  <LogOut size={15} style={{ color: "#ef4444" }} />
                  <span style={{ color: "#f87171", fontWeight: 600 }}>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <GitHubConnectModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        onStatusChange={() => setAuthStatus(githubService.getStatus())}
      />

      <DocumentationModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
      />
    </header>
  );
}
