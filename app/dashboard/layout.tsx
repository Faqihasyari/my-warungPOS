"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "▦" },
    { href: "/dashboard/products", label: "Produk", icon: "📦" },
    { href: "/dashboard/products/create", label: "Tambah Produk", icon: "＋" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #f5f3ef;
          --surface: #ffffff;
          --surface2: #faf9f7;
          --border: #e8e4dd;
          --border2: #f0ece6;
          --text: #1a1814;
          --text2: #6b6560;
          --text3: #aaa49d;
          --accent: #e8500a;
          --accent-light: #fff0eb;
          --accent-border: #fbd5c2;
          --red: #d93025;
          --red-bg: #fef0ee;
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
          --shadow-md: 0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04);
          --shadow-lg: 0 8px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06);
          --radius: 12px;
          --radius-sm: 9px;
          --sidebar-width: 240px;
        }

        html, body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: var(--bg);
          color: var(--text);
          height: 100%;
        }

        /* ── ROOT LAYOUT ── */
        .layout-root {
          display: flex;
          min-height: 100vh;
          background: var(--bg);
        }

        /* ── SIDEBAR OVERLAY (mobile) ── */
        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.3);
          z-index: 40;
          backdrop-filter: blur(2px);
        }

        .sidebar-overlay.open { display: block; }

        /* ── SIDEBAR ── */
        .sidebar {
          width: var(--sidebar-width);
          flex-shrink: 0;
          background: var(--surface);
          border-right: 1.5px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 0;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
        }

        /* ── BRAND ── */
        .sidebar-brand {
          padding: 24px 20px 20px;
          border-bottom: 1.5px solid var(--border2);
        }

        .brand-name {
          font-size: 18px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.4px;
          line-height: 1.2;
        }

        .brand-name span { color: var(--accent); }

        .brand-sub {
          font-size: 11px;
          font-weight: 500;
          color: var(--text3);
          margin-top: 2px;
          letter-spacing: 0.03em;
        }

        /* ── NAV ── */
        .sidebar-nav {
          flex: 1;
          padding: 14px 12px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .nav-section-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--text3);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 6px 10px 4px;
          margin-top: 4px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          font-weight: 600;
          color: var(--text2);
          text-decoration: none;
          transition: all 0.15s ease;
          border: 1.5px solid transparent;
        }

        .nav-link:hover {
          background: var(--surface2);
          color: var(--text);
          border-color: var(--border2);
        }

        .nav-link.active {
          background: var(--accent-light);
          color: var(--accent);
          border-color: var(--accent-border);
        }

        .nav-icon {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          font-size: 14px;
          flex-shrink: 0;
          background: transparent;
          transition: background 0.15s;
        }

        .nav-link.active .nav-icon {
          background: rgba(232, 80, 10, 0.12);
        }

        /* ── SIDEBAR FOOTER ── */
        .sidebar-footer {
          padding: 16px 12px;
          border-top: 1.5px solid var(--border2);
        }

        .btn-logout {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px;
          font-weight: 700;
          background: transparent;
          color: var(--text2);
          border: 1.5px solid var(--border);
          padding: 9px 16px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-logout:hover {
          background: var(--red-bg);
          border-color: #ffc8bf;
          color: var(--red);
        }

        /* ── MAIN AREA ── */
        .layout-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow: hidden;
        }

        /* ── TOPBAR (mobile) ── */
        .topbar {
          display: none;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          background: var(--surface);
          border-bottom: 1.5px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 30;
        }

        .topbar-brand {
          font-size: 16px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.3px;
        }

        .topbar-brand span { color: var(--accent); }

        .btn-hamburger {
          background: var(--surface2);
          border: 1.5px solid var(--border);
          border-radius: 8px;
          width: 36px;
          height: 36px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          cursor: pointer;
          transition: all 0.15s;
          padding: 0;
        }

        .btn-hamburger:hover {
          background: var(--accent-light);
          border-color: var(--accent-border);
        }

        .ham-line {
          width: 16px;
          height: 2px;
          background: var(--text2);
          border-radius: 2px;
          transition: background 0.15s;
        }

        .btn-hamburger:hover .ham-line { background: var(--accent); }

        /* ── CONTENT ── */
        .layout-content {
          flex: 1;
          overflow-y: auto;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .topbar { display: flex; }

          .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            z-index: 50;
            transform: translateX(-110%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: var(--shadow-lg);
          }

          .sidebar.open { transform: translateX(0); }

          .layout-main { width: 100%; }
        }
      `}</style>

      <div className="layout-root">
        {/* Overlay (mobile) */}
        <div
          className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* ── SIDEBAR ── */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-brand">
            <div className="brand-name">My <span>Warung</span></div>
            <div className="brand-sub">Manajemen Toko</div>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section-label">Menu</div>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${pathname === item.href ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button className="btn-logout" onClick={() => signOut({ callbackUrl: "/" })}>
              <span>↩</span> Keluar
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="layout-main">
          {/* Topbar (mobile only) */}
          <div className="topbar">
            <span className="topbar-brand">My <span>Warung</span></span>
            <button className="btn-hamburger" onClick={() => setSidebarOpen(true)}>
              <span className="ham-line" />
              <span className="ham-line" />
              <span className="ham-line" />
            </button>
          </div>

          <div className="layout-content">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}