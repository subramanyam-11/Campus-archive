import Link from 'next/link';

export default function RootNotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl font-extrabold text-blue-500 mb-2">404</div>
        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        <p className="text-slate-400 text-sm mb-6">
          The requested institutional record or portal view does not exist or has been archived.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors shadow-lg shadow-blue-600/30 text-sm"
        >
          Return to Institutional Dashboard
        </Link>
      </div>
    </div>
  );
}
