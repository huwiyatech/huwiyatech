# HuwiyaTech Platform

A full-stack SaaS platform for NFC smart bracelets — each bracelet contains a unique URL that opens a beautiful, personalized profile page when tapped by a smartphone.

---

## Tech Stack

| Layer      | Technology                                          |
|------------|-----------------------------------------------------|
| Frontend   | Next.js 14 (App Router, Server Components)          |
| Styling    | Tailwind CSS (mobile-first, custom design system)   |
| Auth       | NextAuth.js v4 (Credentials + Google OAuth)         |
| Database   | PostgreSQL + Prisma ORM                             |
| File store | Cloudinary (avatar, CV, gallery)                    |
| Validation | Zod + React Hook Form                               |
| Hosting    | Vercel (frontend + API) + Railway/Neon (DB)         |

---

## Project Structure

```
huwiyatech/
├── prisma/
│   └── schema.prisma          ← Full DB schema (User, Profile, Links, NFC, Analytics)
├── src/
│   ├── app/
│   │   ├── (auth)/            ← Login / Register pages
│   │   ├── (dashboard)/       ← Protected dashboard + admin pages
│   │   ├── u/[username]/      ← Public profile page (mobile-first)
│   │   └── api/               ← All API routes
│   ├── components/
│   │   ├── dashboard/         ← Dashboard UI components
│   │   ├── profile/           ← Public profile components
│   │   └── admin/             ← Admin UI components
│   ├── lib/
│   │   ├── auth.ts            ← NextAuth config
│   │   ├── db.ts              ← Prisma singleton
│   │   ├── cloudinary.ts      ← Upload helpers
│   │   └── utils.ts           ← vCard, date, formatting helpers
│   └── types/index.ts         ← Shared types + platform/theme configs
└── ...
```

---

## Database Schema

```
User           → has Profile, NfcTag, Scans
Profile        → has SocialLinks, CustomLinks, Gallery
SocialLink     → Instagram, LinkedIn, Twitter, etc.
CustomLink     → Any URL with title + emoji icon
GalleryItem    → Cloudinary images
NfcTag         → Physical NFC UID → assigned to User
Scan           → Analytics: source (NFC/QR/Direct), IP, userAgent
```

---

## API Routes

| Method | Route                        | Description                      | Auth     |
|--------|------------------------------|----------------------------------|----------|
| POST   | `/api/auth/register`         | Create account                   | Public   |
| GET    | `/api/profile`               | Get own profile                  | Required |
| PATCH  | `/api/profile`               | Update profile info / theme      | Required |
| POST   | `/api/profile/upload`        | Upload avatar (image) or CV (PDF)| Required |
| POST   | `/api/links`                 | Add social or custom link        | Required |
| PATCH  | `/api/links/[id]`            | Update a link                    | Required |
| DELETE | `/api/links/[id]`            | Delete a link                    | Required |
| GET    | `/api/analytics`             | Get scan analytics               | Required |
| POST   | `/api/analytics/scan`        | Record a profile scan            | Public   |
| GET    | `/api/admin/users`           | List all users                   | Admin    |
| PATCH  | `/api/admin/users`           | Change user role                 | Admin    |
| DELETE | `/api/admin/users`           | Delete user                      | Admin    |
| GET    | `/api/admin/nfc`             | List all NFC tags                | Admin    |
| POST   | `/api/admin/nfc`             | Register NFC tag                 | Admin    |
| PATCH  | `/api/admin/nfc`             | Assign/unassign tag              | Admin    |

---

## Local Setup

### 1. Prerequisites
- Node.js 18+
- PostgreSQL (local or [Neon](https://neon.tech) free tier)
- [Cloudinary](https://cloudinary.com) free account

### 2. Clone & Install
```bash
git clone https://github.com/yourusername/huwiyatech
cd huwiyatech
npm install
```

### 3. Environment Variables
```bash
cp .env.example .env
```

Fill in `.env`:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/nfc_platform"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run: openssl rand -base64 32"

# Cloudinary (from cloudinary.com/console)
CLOUDINARY_CLOUD_NAME="yourcloud"
CLOUDINARY_API_KEY="your_key"
CLOUDINARY_API_SECRET="your_secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="yourcloud"

NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="HuwiyaTech"

# Optional: Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### 4. Database setup
```bash
# Generate Prisma client
npm run db:generate

# Push schema to DB (dev — no migration files)
npm run db:push

# Or use migrations (recommended for production)
npm run db:migrate

# Open Prisma Studio to inspect data
npm run db:studio
```

### 5. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## NFC Integration

### How it works
1. Admin registers an NFC tag in the admin panel (`/admin/nfc`) with its physical UID.
2. Admin assigns it to a user.
3. The physical bracelet is programmed to open: `https://yourdomain.com/u/<username>?src=nfc`
4. When scanned → the profile page records a scan with `source: NFC`.

### Programming NFC tags
Use any NFC writing app (e.g. **NFC Tools** on iOS/Android):
- Record type: **URL**
- URL: `https://yourdomain.com/u/username?src=nfc`

### QR Code
Each profile page has a built-in QR code button that generates the profile URL with `?src=qr`.

---

## Profile Themes

8 built-in themes selectable from the dashboard:
- **Default** — Purple/indigo gradient
- **Minimal** — Clean white/light
- **Bold** — Pink/purple gradient, glass card
- **Glass** — Frosted glass effect
- **Nature** — Green gradient
- **Sunset** — Orange/red gradient
- **Ocean** — Blue gradient
- **Dark Pro** — Dark mode

Each theme exposes CSS custom properties (`--profile-bg`, `--profile-card`, `--profile-text`, etc.) used by the public profile page.

---

## Making the First Admin

After registering your first account, run this in Prisma Studio or directly via psql:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

Or with Prisma:
```bash
npm run db:studio
# Navigate to User table → update role field to ADMIN
```

---

## Deployment

### Vercel (recommended)
```bash
npm i -g vercel
vercel
```
Set all environment variables in the Vercel dashboard.

### Railway (database)
1. Create a PostgreSQL service on [Railway](https://railway.app)
2. Copy the connection string to `DATABASE_URL`
3. Run `npm run db:migrate` with the production DATABASE_URL

### Post-deployment checklist
- [ ] Set `NEXTAUTH_URL` to your production domain
- [ ] Set `NEXTAUTH_SECRET` to a strong random secret
- [ ] Add your domain to Cloudinary's allowed upload origins
- [ ] Run `prisma migrate deploy` on first deploy
- [ ] Set first admin user via DB

---

## Features Summary

| Feature                    | Status |
|----------------------------|--------|
| Email/password auth        | ✅     |
| Google OAuth               | ✅ (optional) |
| Public profile page        | ✅ Mobile-first |
| 8 visual themes            | ✅     |
| Avatar upload (Cloudinary) | ✅     |
| CV/PDF upload              | ✅     |
| Social links manager       | ✅     |
| Custom links manager       | ✅     |
| vCard download button      | ✅     |
| QR code generation         | ✅     |
| NFC scan analytics         | ✅     |
| Admin user management      | ✅     |
| Admin NFC tag management   | ✅     |
| Dark mode (per theme)      | ✅     |

---

## Security

- Passwords hashed with bcrypt (cost factor 12)
- JWT-based sessions (NextAuth)
- All mutations require authenticated session
- Users can only modify their own data
- Admin routes protected by role check
- File uploads validated (type + size) before Cloudinary
- Zod validation on all API inputs
- No raw SQL — Prisma parameterizes all queries

---

## License

MIT
