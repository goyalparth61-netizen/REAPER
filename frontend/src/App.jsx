import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage from "./pages/auth/AuthPage";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Overview from "./pages/Overview";
import Repositories from "./pages/Repositories";
import LiveAgent from "./pages/LiveAgent";
import RepairHistory from "./pages/RepairHistory";
import Reports from "./pages/Reports";
import SafetyCenter from "./pages/SafetyCenter";
import Settings from "./pages/Settings";
import Team from "./pages/Team";
import ObsidianBackground from "./components/ObsidianBackground";
import ReaperMascotLogo from "./components/branding/ReaperMascotLogo";
import "./styles/dashboard.css";

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activePage, setActivePage] = useState("Workspace");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Splash loading screen while checking local or remote session
  if (isLoading) {
    return (
      <div className="reaper-splash-screen">
        <ObsidianBackground />
        <div className="splash-center-content animate-fadeIn">
          <div className="splash-mascot-glow">
            <ReaperMascotLogo size={90} glow={true} float={true} />
          </div>
          <h2 className="splash-title">REAPER</h2>
          <p className="splash-subtitle">INITIALIZING AUTONOMOUS REPAIR ENGINE</p>
          <div className="splash-progress-bar">
            <div className="splash-progress-fill" />
          </div>
        </div>
      </div>
    );
  }

  // Route Protection: Unauthenticated visitors redirected to AuthPage
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Authenticated Dashboard
  function renderPage() {
    switch (activePage) {
      case "Workspace":
      case "Overview":
        return <Overview onNavigate={setActivePage} />;
      case "Repositories":
        return <Repositories onNavigate={setActivePage} />;
      case "Live Agent":
        return <LiveAgent onNavigate={setActivePage} />;
      case "Activity":
      case "Repair History":
        return <RepairHistory onNavigate={setActivePage} />;
      case "Reports":
        return <Reports onNavigate={setActivePage} />;
      case "Safety Center":
        return <SafetyCenter onNavigate={setActivePage} />;
      case "Settings":
        return <Settings onNavigate={setActivePage} />;
      case "Team":
      case "About":
        return <Team onNavigate={setActivePage} />;
      default:
        return <Overview onNavigate={setActivePage} />;
    }
  }

  return (
    <div className={`app-layout ${sidebarCollapsed ? "sidebar-is-collapsed" : ""}`}>
      {/* Signature Obsidian Emerald Animated Ambient Background */}
      <ObsidianBackground />

      {/* Main Navigation Sidebar with Mobile Drawer */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileNavOpen}
        setMobileOpen={setMobileNavOpen}
      />

      {/* Main Content Viewport */}
      <div className="main-wrapper">
        <Header
          activePage={activePage}
          setActivePage={setActivePage}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          mobileOpen={mobileNavOpen}
          setMobileOpen={setMobileNavOpen}
        />
        <main className="main-area">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
