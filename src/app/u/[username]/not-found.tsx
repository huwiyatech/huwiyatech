import Link from "next/link";

export default function ProfileNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white px-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-2xl font-bold mb-2">Profile not found</h1>
        <p className="text-slate-400 mb-8">
          This profile doesn't exist, has been deactivated, or is currently private.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-colors"
        >
          Create your own profile →
        </Link>
      </div>
    </div>
  );
}
