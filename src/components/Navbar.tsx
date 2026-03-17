import { useState, useEffect } from 'react';
import { Activity, Settings, Sun, Moon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';

export default function Navbar() {
  const location = useLocation();
  const { isLoggedIn, logout, selectedRegion } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b border-border bg-card px-4 py-2 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-primary tracking-wide">HEALTHCARE RESOURCE PLATFORM</h1>
            <p className="text-[10px] font-mono-code text-muted-foreground">{selectedRegion.toUpperCase()} · {time.toLocaleTimeString('en-IN', { hour12: false })}</p>
          </div>
        </Link>

        <nav className="flex items-center gap-1 ml-4">
          <Link to="/" className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${isActive('/') ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            <Activity className="w-4 h-4" /> Resource Map
          </Link>
          <Link to="/hospital" className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${isActive('/hospital') || isActive('/hospital/dashboard') ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}>
            🏥 Hospital
          </Link>
          <Link to="/admin" className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${isActive('/admin') ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            <Settings className="w-4 h-4" /> Admin
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-alert-green animate-pulse-live" />
          <span className="text-alert-green font-semibold">LIVE</span>
        </span>

        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {isLoggedIn && (
          <button onClick={logout} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            ↦ Logout
          </button>
        )}
      </div>
    </header>
  );
}
