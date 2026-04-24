import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();

  const isHome = location.pathname === "/";
  const isTransparent = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const palette = useMemo(
    () =>
      isTransparent
        ? {
            header: "bg-transparent",
            brandText: "text-white",
            subText: "text-slate-300",
            navIdle: "text-slate-200 hover:text-cyan",
            navActive: "text-cyan",
            buttonGhost: "border-white/20 bg-white/10 text-white hover:bg-white/20",
            mobileShell: "border-t border-white/10 bg-navy/95"
          }
        : {
            header:
              "border-b border-slate-200 bg-white/92 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/92",
            brandText: "text-navy dark:text-white",
            subText: "text-slate-500 dark:text-slate-400",
            navIdle: "text-slate-600 hover:text-blue dark:text-slate-300 dark:hover:text-cyan",
            navActive: "text-blue dark:text-cyan",
            buttonGhost:
              "border-slate-200 bg-white text-slate-700 hover:border-blue hover:text-blue dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:hover:border-cyan dark:hover:text-cyan",
            mobileShell: "border-t border-slate-200 bg-white/95 dark:border-slate-800 dark:bg-slate-950/95"
          },
    [isTransparent]
  );

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${palette.header}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue px-3 py-2 font-heading text-lg font-bold text-white shadow-lg shadow-blue/30">
            IT
          </div>
          <div>
            <p className={`font-heading text-xl font-bold ${palette.brandText}`}>
              <span>Intern</span>
              <span className="text-blue">Tech</span>
            </p>
            <p className={`text-[11px] uppercase tracking-[0.26em] ${palette.subText}`}>
              Learn. Intern. Succeed.
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium transition ${isActive ? palette.navActive : palette.navIdle}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            className={`rounded-full border p-2 transition ${palette.buttonGhost}`}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {!isAuthenticated ? (
            <>
              <Link to="/login" className={`rounded-full px-4 py-2 text-sm font-medium transition ${palette.buttonGhost}`}>
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-blue px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue/90"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <div
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
                  isTransparent
                    ? "border-white/10 bg-white/10 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                }`}
              >
                <Wallet className="h-4 w-4 text-gold" />
                Rs. {user?.walletBalance || 0}
              </div>
              <Link to="/dashboard" className={`rounded-full px-4 py-2 text-sm font-medium transition ${palette.buttonGhost}`}>
                {user?.name?.split(" ")[0] || "Dashboard"}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-full bg-danger px-4 py-2 text-sm font-semibold text-white transition hover:bg-danger/90"
              >
                Logout
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className={`rounded-full border p-2 md:hidden ${palette.buttonGhost}`}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className={`px-4 py-4 backdrop-blur-xl md:hidden ${palette.mobileShell}`}>
          <div className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-2xl px-4 py-3 text-sm font-medium ${
                    isActive
                      ? "bg-blue text-white"
                      : isTransparent
                        ? "text-slate-200"
                        : "text-slate-700 dark:text-slate-200"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            {!isAuthenticated ? (
              <>
                <Link to="/login" className={`block rounded-2xl px-4 py-3 text-sm font-medium ${palette.buttonGhost}`}>
                  Login
                </Link>
                <Link to="/register" className="block rounded-2xl bg-blue px-4 py-3 text-sm font-semibold text-white">
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className={`block rounded-2xl px-4 py-3 text-sm font-medium ${palette.buttonGhost}`}>
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="block w-full rounded-2xl bg-danger px-4 py-3 text-left text-sm font-semibold text-white"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
