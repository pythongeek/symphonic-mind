import { Link, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Music,
  Database,
  Library,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/generate", icon: Music, label: "Generate Music" },
  { path: "/training", icon: Database, label: "Training Hub" },
  { path: "/library", icon: Library, label: "My Library" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen w-screen bg-[#0a0a0f] text-[#e8e8f0] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[240px] min-w-[240px] h-full bg-[#12121a] border-r border-[#2a2a3a] flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-[#2a2a3a]">
          <img src="/logo.png" alt="YuE Studio" className="h-8 w-auto" />
          <span className="ml-2 text-xs font-medium text-[#5a5a70] tracking-[0.15em] uppercase">
            Studio
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[rgba(0,229,160,0.08)] text-[#00e5a0] border-l-[3px] border-[#00e5a0]"
                    : "text-[#8a8aa0] hover:bg-[rgba(255,255,255,0.03)] hover:text-[#e8e8f0]"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-[#2a2a3a]">
          <div className="flex items-center gap-3 mb-3">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || "User"}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#1a1a25] flex items-center justify-center text-[#00e5a0] font-semibold">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#e8e8f0] truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-[#5a5a70] truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 px-3 py-2 text-sm text-[#8a8aa0] hover:text-[#ef4444] hover:bg-[rgba(239,68,68,0.08)] rounded-lg transition-all w-full"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 bg-[#12121a] border-b border-[#2a2a3a] flex items-center justify-between px-6 shrink-0">
          <div>
            <h1 className="text-lg font-bold text-[#e8e8f0]">
              {navItems.find((n) => n.path === location.pathname)?.label ||
                "YuE Studio"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {location.pathname === "/" && (
              <Link
                to="/generate"
                className="flex items-center gap-2 px-4 py-2 bg-[#00e5a0] text-[#0a0a0f] rounded-lg text-sm font-semibold hover:bg-[#00c48c] transition-colors"
              >
                <Sparkles size={16} />
                New Project
              </Link>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
