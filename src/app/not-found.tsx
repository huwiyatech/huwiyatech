import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white px-4">
      <div className="text-center">
        <p className="text-8xl font-black text-brand-500 mb-4">404</p>
        <h1 className="text-2xl font-bold mb-2">Profile not found</h1>
        <p className="text-slate-400 mb-8">
          This profile doesn't exist or is currently private.
        </p>
        <Link href="/" className="btn-primary">
          Back to home
        </Link>
      </div>
    </div>
  );
}
