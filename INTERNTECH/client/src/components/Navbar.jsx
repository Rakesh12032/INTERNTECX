import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, Moon, Sun, Wallet, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Courses", to: "/courses" },
  { label: "Internship", to: "/internship" },
  { label: "Jobs", to: "/jobs" },
  { label: "Ambassador", to: "/ambassador" }
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-slate-200/10 bg-navy/90 backdrop-blur-xl" : "bg-transparent"}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="rounded-2xl bg-blue px-3 py-2 font-heading text-lg font-bold text-white shadow-lg shadow-blue/30">IT</div>
          <div>
            <p className="font-heading text-xl font-bold text-white">
              <span>Intern</span>
              <span className="text-blue">Tech</span>
            </p>
            <p className="text-[11px] uppercase tracking-[0.26em] text-slate-300">Learn. Intern. Succeed.</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `text-sm font-medium transition hover:text-cyan ${isActive ? "text-blue" : "text-slate-200"}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button type="button" onClick={toggleTheme} className="rounded-full border border-white/10 bg-white/10 p-2 text-white transition hover:bg-white/20">
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10">Login</Link>
              <Link to="/register" className="rounded-full bg-blue px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue/90">Register</Link>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white">
                <Wallet className="h-4 w-4 text-gold" />
                ₹{user?.walletBalance || 0}
              </div>
              <Link to="/dashboard" className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10">
                {user?.name?.split(" ")[0] || "Dashboard"}
              </Link>
              <button type="button" onClick={logout} className="rounded-full bg-danger px-4 py-2 text-sm font-semibold text-white transition hover:bg-danger/90">
                Logout
              </button>
            </>
          )}
        </div>

        <button type="button" onClick={() => setMobileOpen((prev) => !prev)} className="rounded-full border border-white/15 bg-white/10 p-2 text-white md:hidden">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-white/10 bg-navy/95 px-4 py-4 backdrop-blur-xl md:hidden">
          <div className="space-y-2">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setMobileOpen(false)} className={({ isActive }) => `block rounded-2xl px-4 py-3 text-sm font-medium ${isActive ? "bg-blue text-white" : "text-slate-200"}`}>
                {item.label}
              </NavLink>
            ))}
            {!isAuthenticated ? (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-white">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block rounded-2xl bg-blue px-4 py-3 text-sm font-semibold text-white">Register</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-white">Dashboard</Link>
                <button type="button" onClick={logout} className="block w-full rounded-2xl bg-danger px-4 py-3 text-left text-sm font-semibold text-white">Logout</button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
