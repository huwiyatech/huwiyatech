"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { useState } from "react";

interface Props {
  session: Session;
}

const navItems = [
  { href: "/dashboard",            label: "Home",      icon: "🏠" },
  { href: "/dashboard/edit",       label: "Edit profile", icon: "✏️" },
  { href: "/dashboard/analytics",  label: "Analytics", icon: "📊" },
];

const adminItems = [
  { href: "/admin",     label: "Users",    icon: "👥" },
  { href: "/admin/nfc", label: "NFC Tags", icon: "📡" },
];

export function DashboardSidebar({ session }: Props) {
  const pathname = usePathname();
  const isAdmin  = (session.user as any).role === "ADMIN";
  const [mobileOpen, setMobileOpen] = useState(false);

  const profileUrl = `/u/${session.user.username}`;

  return (
    <>
      {/* ── Mobile top bar ──────────────────────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-slate-900 flex items-center gap-1.5">
          <span className="text-xl">⬡</span> HuwiyaTech
        </Link>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Toggle menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>
      {/* Spacer for fixed top bar on mobile */}
      <div className="md:hidden h-14" />

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-30
          flex flex-col py-6 px-4
          transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 font-bold text-xl text-slate-900 px-2 mb-8">
          <span className="text-2xl">⬡</span> HuwiyaTech
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 mb-6">
          <div className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center font-semibold text-sm">
            {session.user.name?.charAt(0)?.toUpperCase() ?? session.user.username.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {session.user.name ?? session.user.username}
            </p>
            <p className="text-xs text-slate-500 truncate">@{session.user.username}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              active={pathname === item.href}
              onClick={() => setMobileOpen(false)}
            />
          ))}

          {isAdmin && (
            <>
              <div className="pt-4 pb-1 px-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin</p>
              </div>
              {adminItems.map((item) => (
                <NavItem
                  key={item.href}
                  {...item}
                  active={pathname.startsWith(item.href)}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </>
          )}
        </nav>

        {/* Bottom actions */}
        <div className="space-y-1 pt-4 border-t border-slate-200">
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <span>👁️</span> View public profile
          </a>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <span>🚪</span> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-20 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}

function NavItem({
  href, label, icon, active, onClick,
}: {
  href: string; label: string; icon: string; active: boolean; onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        active
          ? "bg-brand-50 text-brand-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <span>{icon}</span>
      {label}
    </Link>
  );
}
