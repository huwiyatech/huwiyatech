import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { SOCIAL_PLATFORMS } from "@/types";
import { VCardButton } from "@/components/profile/VCardButton";
import { ScanTracker } from "@/components/profile/ScanTracker";
import { QRCodeDisplay } from "@/components/profile/QRCodeDisplay";

interface PageProps {
  params: { username: string };
}

type ExtendedProfile = {
  phone?:    string | null;
  whatsapp?: string | null;
  email?:    string | null;
  company?:  string | null;
};

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const user = await getUser(params.username);
  if (!user?.profile) return { title: "Profile not found" };

  const { profile } = user;
  const name = profile.displayName ?? user.username;
  const desc = profile.bio ?? `Check out ${name}'s profile on HuwiyaTech`;

  return {
    title:       name,
    description: desc,
    openGraph: {
      title:       name,
      description: desc,
      images:      profile.avatarUrl ? [{ url: profile.avatarUrl }] : [],
      type:        "profile",
    },
  };
}

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getUser(username: string) {
  return prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    include: {
      profile: {
        include: {
          socialLinks: { orderBy: { order: "asc" } },
          customLinks: { where: { isActive: true }, orderBy: { order: "asc" } },
          gallery:     { orderBy: { order: "asc" } },
        },
      },
    },
  });
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function PublicProfilePage({ params }: PageProps) {
  const user = await getUser(params.username);

  if (!user || !user.profile || !user.profile.isPublic) {
    notFound();
  }

  const { profile } = user;
  const theme = profile.theme ?? "default";
  const name  = profile.displayName ?? user.username;

  // Map social links to their configs
  const mappedSocials = profile.socialLinks.map((link) => {
    const platform = SOCIAL_PLATFORMS.find((p) => p.id === link.platform);
    return { ...link, config: platform };
  });

  return (
    <>
      {/* Track this scan (fires in background after paint) */}
      <ScanTracker userId={user.id} />

      <div
        data-theme={theme}
        className="min-h-screen w-full flex flex-col items-center py-10 px-4"
        style={{ background: "var(--profile-bg)" }}
      >
        {/* ── Card ─────────────────────────────────────────────────────────── */}
        <div
          className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-fade-in"
          style={{
            background: "var(--profile-card)",
            border:     "1px solid var(--profile-border)",
          }}
        >
          {/* Avatar + Identity */}
          <div className="flex flex-col items-center pt-10 pb-6 px-6 text-center">
            <div className="relative mb-4">
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={name}
                  width={100}
                  height={100}
                  className="w-24 h-24 rounded-full object-cover ring-4"
                  style={{ ringColor: "var(--profile-border)" }}
                  priority
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold"
                  style={{
                    background: profile.primaryColor ?? "#3b63f6",
                    color: "#fff",
                  }}
                >
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <h1
              className="text-2xl font-bold leading-tight"
              style={{ color: "var(--profile-text)" }}
            >
              {name}
            </h1>

            {/* Job title + company */}
            {(profile.jobTitle || (profile as ExtendedProfile).company) && (
              <p className="mt-1 text-sm font-medium" style={{ color: "var(--profile-muted)" }}>
                {profile.jobTitle}
                {profile.jobTitle && (profile as ExtendedProfile).company && " · "}
                {(profile as ExtendedProfile).company}
              </p>
            )}

            {/* Location */}
            {profile.location && (
              <p className="mt-1 text-xs flex items-center gap-1" style={{ color: "var(--profile-muted)" }}>
                📍 {profile.location}
              </p>
            )}

            {/* Bio */}
            {profile.bio && (
              <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--profile-muted)" }}>
                {profile.bio}
              </p>
            )}

            {/* Contact info row */}
            {((profile as ExtendedProfile).phone || (profile as ExtendedProfile).whatsapp || (profile as ExtendedProfile).email) && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {(profile as ExtendedProfile).phone && (
                  <a
                    href={`tel:${(profile as ExtendedProfile).phone}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95"
                    style={{ background: "var(--profile-border)", color: "var(--profile-text)" }}
                  >
                    📞 {(profile as ExtendedProfile).phone}
                  </a>
                )}
                {(profile as ExtendedProfile).whatsapp && (
                  <a
                    href={`https://wa.me/${(profile as ExtendedProfile).whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95"
                    style={{ background: "#25D36622", color: "#25D366" }}
                  >
                    💬 WhatsApp
                  </a>
                )}
                {(profile as ExtendedProfile).email && (
                  <a
                    href={`mailto:${(profile as ExtendedProfile).email}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95"
                    style={{ background: "var(--profile-border)", color: "var(--profile-text)" }}
                  >
                    ✉️ {(profile as ExtendedProfile).email}
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="mx-6 h-px" style={{ background: "var(--profile-border)" }} />

          {/* ── Action buttons ─────────────────────────────────────────────── */}
          <div className="px-6 pt-5 pb-2 flex gap-2 flex-wrap justify-center">
            <VCardButton user={user} />

            {profile.cvUrl && (
              <a
                href={profile.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[120px] text-center py-3 rounded-xl text-sm font-semibold transition-all active:scale-95"
                style={{
                  background: profile.primaryColor ?? "#3b63f6",
                  color: "#fff",
                }}
              >
                📄 Download CV
              </a>
            )}
          </div>

          {/* ── Social links ──────────────────────────────────────────────── */}
          {mappedSocials.length > 0 && (
            <div className="px-6 pt-4 pb-2">
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: "var(--profile-muted)" }}
              >
                Find me on
              </p>
              <div className="flex flex-wrap gap-2">
                {mappedSocials.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 hover:opacity-90"
                    style={{
                      background: link.config?.color
                        ? link.config.color + "22"
                        : (profile.primaryColor ?? "#3b63f6") + "22",
                      color:      link.config?.color ?? (profile.primaryColor ?? "#3b63f6"),
                      border:     `1px solid ${link.config?.color ?? profile.primaryColor ?? "#3b63f6"}33`,
                    }}
                    title={link.config?.label ?? link.platform}
                  >
                    <SocialIcon platform={link.platform} />
                    {link.config?.label ?? link.platform}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ── Custom links ──────────────────────────────────────────────── */}
          {profile.customLinks.length > 0 && (
            <div className="px-6 pt-4 pb-2">
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: "var(--profile-muted)" }}
              >
                Links
              </p>
              <div className="flex flex-col gap-2">
                {profile.customLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-medium transition-all active:scale-95 hover:opacity-90 text-center justify-center"
                    style={{
                      background: "var(--profile-border)",
                      color:      "var(--profile-text)",
                      border:     "1px solid var(--profile-border)",
                    }}
                  >
                    {link.icon && <span className="text-base">{link.icon}</span>}
                    {link.title}
                    <span className="ml-auto opacity-40 text-xs">↗</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ── Gallery ───────────────────────────────────────────────────── */}
          {profile.gallery.length > 0 && (
            <div className="px-6 pt-4 pb-2">
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: "var(--profile-muted)" }}
              >
                Gallery
              </p>
              <div className="grid grid-cols-3 gap-1.5 rounded-xl overflow-hidden">
                {profile.gallery.slice(0, 6).map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-square overflow-hidden"
                  >
                    <Image
                      src={item.url}
                      alt={item.caption ?? "Gallery image"}
                      width={120}
                      height={120}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ── Website ───────────────────────────────────────────────────── */}
          {profile.website && (
            <div className="px-6 pt-4 pb-2">
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm"
                style={{ color: profile.primaryColor ?? "#3b63f6" }}
              >
                🌐 {profile.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}

          {/* ── QR code (collapsible) ─────────────────────────────────────── */}
          <div className="px-6 pt-4 pb-8">
            <QRCodeDisplay username={user.username} />
          </div>
        </div>

        {/* Powered-by footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-white/50 font-semibold tracking-wide">HuwiyaTech</p>
          <p className="text-xs text-white/30 mt-0.5">
            © {new Date().getFullYear()} — All rights reserved to Mhamed Faris
          </p>
        </div>
      </div>
    </>
  );
}

// ─── Social Icon component ────────────────────────────────────────────────────

function SocialIcon({ platform }: { platform: string }) {
  const icons: Record<string, string> = {
    instagram: "📸",
    linkedin:  "💼",
    twitter:   "🐦",
    facebook:  "👤",
    tiktok:    "🎵",
    youtube:   "▶️",
    github:    "💻",
    snapchat:  "👻",
    email:     "✉️",
    phone:     "📞",
    whatsapp:  "💬",
    telegram:  "✈️",
  };
  return <span>{icons[platform] ?? "🔗"}</span>;
}
