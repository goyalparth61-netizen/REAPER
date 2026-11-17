
import { Search, Bell, Command, Menu } from "lucide-react";

export default function Topbar({ activePage, onMenuClick }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="mobile-menu" onClick={onMenuClick}>
          <Menu size={21} />
        </button>

        <div>
          <div className="breadcrumb">REAPER / Workspace</div>
          <h1>{activePage}</h1>
        </div>
      </div>

      <div className="topbar-actions">
        <div className="search-box">
          <Search size={17} />
          <input placeholder="Search anything..." />
          <span><Command size={12} /> K</span>
        </div>

        <button className="icon-button" aria-label="Notifications">
          <Bell size={19} />
          <i />
        </button>

        <div className="topbar-avatar">R</div>
      </div>
    </header>
  );
}
