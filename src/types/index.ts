import type { User, Profile, SocialLink, CustomLink, GalleryItem, NfcTag, Scan } from "@prisma/client";

export type { User, Profile, SocialLink, CustomLink, GalleryItem, NfcTag, Scan };

// Role and ScanSource are plain strings in SQLite mode
export type Role       = "USER" | "ADMIN";
export type ScanSource = "NFC"  | "QR" | "DIRECT" | "LINK";

// ─── Extended / composed types ────────────────────────────────────────────────

export type ProfileWithRelations = Profile & {
  socialLinks: SocialLink[];
  customLinks: CustomLink[];
  gallery: GalleryItem[];
  user: Pick<User, "id" | "username" | "email">;
};

export type UserWithProfile = User & {
  profile: Profile | null;
  nfcTag: NfcTag | null;
};

// ─── API response shape ───────────────────────────────────────────────────────

export type ApiResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── Form / input types ───────────────────────────────────────────────────────

export interface RegisterInput {
  email: string;
  password: string;
  username: string;
}

export interface ProfileUpdateInput {
  displayName?: string;
  bio?: string;
  website?: string;
  location?: string;
  jobTitle?: string;
  primaryColor?: string;
  theme?: string;
  darkMode?: boolean;
  bgGradient?: string;
  isPublic?: boolean;
}

export interface SocialLinkInput {
  platform: string;
  url: string;
  order?: number;
}

export interface CustomLinkInput {
  title: string;
  url: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface AnalyticsSummary {
  totalScans: number;
  todayScans: number;
  weekScans: number;
  monthScans: number;
  bySource: Record<string, number>;
  byDay: { date: string; count: number }[];
}

// ─── Social platform config ───────────────────────────────────────────────────

export interface SocialPlatform {
  id: string;
  label: string;
  color: string;
  placeholder: string;
  icon: string; // SVG path or emoji
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { id: "instagram",  label: "Instagram",  color: "#E1306C", placeholder: "https://instagram.com/username",  icon: "instagram"  },
  { id: "linkedin",   label: "LinkedIn",   color: "#0077B5", placeholder: "https://linkedin.com/in/username", icon: "linkedin"   },
  { id: "twitter",    label: "X / Twitter",color: "#1DA1F2", placeholder: "https://x.com/username",          icon: "twitter"    },
  { id: "facebook",   label: "Facebook",   color: "#1877F2", placeholder: "https://facebook.com/username",   icon: "facebook"   },
  { id: "tiktok",     label: "TikTok",     color: "#010101", placeholder: "https://tiktok.com/@username",    icon: "tiktok"     },
  { id: "youtube",    label: "YouTube",    color: "#FF0000", placeholder: "https://youtube.com/@channel",    icon: "youtube"    },
  { id: "github",     label: "GitHub",     color: "#181717", placeholder: "https://github.com/username",     icon: "github"     },
  { id: "snapchat",   label: "Snapchat",   color: "#FFFC00", placeholder: "https://snapchat.com/add/user",   icon: "snapchat"   },
  { id: "email",      label: "Email",      color: "#EA4335", placeholder: "mailto:you@example.com",          icon: "email"      },
  { id: "phone",      label: "Phone",      color: "#34C759", placeholder: "tel:+1234567890",                 icon: "phone"      },
  { id: "whatsapp",   label: "WhatsApp",   color: "#25D366", placeholder: "https://wa.me/1234567890",        icon: "whatsapp"   },
  { id: "telegram",   label: "Telegram",   color: "#2CA5E0", placeholder: "https://t.me/username",           icon: "telegram"   },
];

// ─── Theme definitions ────────────────────────────────────────────────────────

export interface ThemeConfig {
  id: string;
  label: string;
  preview: string; // CSS gradient or color
}

export const THEMES: ThemeConfig[] = [
  { id: "default", label: "Default",  preview: "linear-gradient(135deg, #3b63f6, #8b5cf6)" },
  { id: "minimal", label: "Minimal",  preview: "linear-gradient(135deg, #f8f9fa, #e9ecef)" },
  { id: "bold",    label: "Bold",     preview: "linear-gradient(135deg, #ff006e, #8338ec)" },
  { id: "glass",   label: "Glass",    preview: "linear-gradient(135deg, #667eea, #764ba2)" },
  { id: "nature",  label: "Nature",   preview: "linear-gradient(135deg, #56ab2f, #a8e063)" },
  { id: "sunset",  label: "Sunset",   preview: "linear-gradient(135deg, #f9a825, #e64a19)" },
  { id: "ocean",   label: "Ocean",    preview: "linear-gradient(135deg, #0096c7, #023e8a)" },
  { id: "dark",    label: "Dark Pro", preview: "linear-gradient(135deg, #1a1a2e, #16213e)"  },
];
