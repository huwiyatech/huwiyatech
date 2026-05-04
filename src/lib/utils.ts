// ─── Class names helper ───────────────────────────────────────────────────────
export function cn(...inputs: (string | undefined | null | false | 0)[]) {
  return inputs.filter(Boolean).join(" ");
}

// ─── Username validation ──────────────────────────────────────────────────────
export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_-]{3,30}$/.test(username);
}

// ─── URL validation ───────────────────────────────────────────────────────────
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ─── Slug generation ──────────────────────────────────────────────────────────
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Truncate ─────────────────────────────────────────────────────────────────
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + "…";
}

// ─── Format numbers ───────────────────────────────────────────────────────────
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

export function startOfDay(date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ─── vCard generator ──────────────────────────────────────────────────────────
export function generateVCard(options: {
  name:     string;
  email?:    string;
  phone?:    string;
  whatsapp?: string;
  website?:  string;
  jobTitle?: string;
  company?:  string;
  location?: string;
  bio?:      string;
}): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${options.name}`,
    `N:${options.name};;;;`,
  ];
  if (options.jobTitle) lines.push(`TITLE:${options.jobTitle}`);
  if (options.company)  lines.push(`ORG:${options.company}`);
  if (options.email)    lines.push(`EMAIL;TYPE=INTERNET:${options.email}`);
  if (options.phone)    lines.push(`TEL;TYPE=CELL:${options.phone}`);
  if (options.whatsapp) lines.push(`TEL;TYPE=WORK:${options.whatsapp}`);
  if (options.website)  lines.push(`URL:${options.website}`);
  if (options.location) lines.push(`ADR:;;${options.location};;;;`);
  if (options.bio)      lines.push(`NOTE:${options.bio.replace(/\n/g, "\\n")}`);
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

// ─── IP extraction from NextRequest ──────────────────────────────────────────
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

// ─── Parse multipart form bytes to Buffer ─────────────────────────────────────
export async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
