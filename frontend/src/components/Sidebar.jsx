import { useState, useEffect } from "react";
import { X, Users, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ReaperMascotLogo from "./branding/ReaperMascotLogo";
import {
  IconWorkspace,
  IconLiveAgent,
  IconRepairHistory,
  IconRepo,
  IconSafetyCenter,
  IconReports,
  IconSettings
} from "./icons/ReaperIcons";
import { apiService } from "../services/apiService";

const menuItems = [
  { label: "Workspace", pageKey: "Workspace", icon: IconWorkspace },
  { label: "Live Agent", pageKey: "Live Agent", icon: IconLiveAgent },
  { label: "Repair History", pageKey: "Repair History", icon: IconRepairHistory },
  { label: "Repositories", pageKey: "Repositories", icon: IconRepo },
  { label: "Reports", pageKey: "Reports", icon: IconReports },
  { label: "Safety Center", pageKey: "Safety Center", icon: IconSafetyCenter },
  { label: "Settings", pageKey: "Settings", icon: IconSettings },
  { label: "Team CiPher", pageKey: "Team", icon: Users }
];

export default function Sidebar({
  activePage,
  setActivePage,
  collapsed,
  mobileOpen,
  setMobileOpen
}) {
  const { user, logout } = useAuth();
  const [backendState, setBackendState] = useState({ online: false, state: "IDLE" });

  useEffect(() => {
    let active = true;
    async function loadStatus() {
      const res = await apiService.getStatus();
      if (active) setBackendState(res);
    }
    loadStatus();
    const timer = setInterval(loadStatus, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const isCurrentActive = (key) => {
    if (key === "Workspace") {
      return activePage === "Workspace" || activePage === "Overview";
    }
    if (key === "Repair History") {
      return activePage === "Repair History" || activePage === "Activity";
    }
    return activePage === key;
  };

  function handleNav(pageKey) {
    setActivePage(pageKey);
    if (setMobileOpen) setMobileOpen(false);
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        {/* Brand Header with Official REAPER Mascot */}
        <div className="brand" onClick={() => handleNav("Workspace")}>
          <div className="brand-icon reaper-brand-badge">
            <ReaperMascotLogo size={32} glow={true} float={false} />
          </div>
          {!collapsed && (
            <div className="brand-copy">
              <h2>REAPER</h2>
              <span style={{ color: "var(--accent-champagne)" }}>AUTONOMOUS REPAIR</span>
            </div>
          )}
          {mobileOpen && (
            <button
              className="sidebar-mobile-close"
              onClick={(e) => {
                e.stopPropagation();
                setMobileOpen(false);
              }}
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {!collapsed && <div className="workspace-label">REPAIR CONSOLE</div>}

        {/* Navigation Links with Smooth Animated Active Pill */}
        <nav className="sidebar-nav">
          {menuItems.map(({ label, pageKey, icon: Icon }) => {
            const active = isCurrentActive(pageKey);
            return (
              <button
                key={pageKey}
                className={`nav-item ${active ? "active" : ""}`}
                onClick={() => handleNav(pageKey)}
                title={collapsed ? label : undefined}
              >
                <Icon size={18} />
                {!collapsed && <span>{label}</span>}
                {active && !collapsed && <div className="nav-active-pip" />}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-bottom">
          <div className="system-card hover-lift" title="Live Agent & Sandbox Status">
            <span className={`system-indicator ${backendState.online ? "online" : "offline"}`} />
            {!collapsed && (
              <div>
                <strong>{backendState.online ? "Engine Active" : "Backend Standby"}</strong>
                <small>{backendState.online ? `State: ${backendState.state}` : "127.0.0.1:8000"}</small>
              </div>
            )}
          </div>

          <div className="sidebar-profile-container">
            <div className="profile" onClick={() => handleNav("Team")} title="Built by Team CiPher" style={{ cursor: "pointer", flex: 1 }}>
              <div className="avatar reaper-avatar-badge">
                <ReaperMascotLogo size={24} glow={false} />
              </div>
              {!collapsed && (
                <div style={{ overflow: "hidden" }}>
                  <strong style={{ display: "block", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                    {user?.fullName || "Team CiPher"}
                  </strong>
                  <small style={{ color: "var(--accent-champagne)" }}>
                    {user?.email ? "REAPER Engineer" : "Archi & Parth"}
                  </small>
                </div>
              )}
            </div>
            {!collapsed && (
              <button
                className="sidebar-logout-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  logout();
                }}
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
