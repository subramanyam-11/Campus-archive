'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-6 text-center shadow-2xl">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">error</span>
          </div>
          <h2 className="text-xl font-bold text-red-300 mb-2">Application Runtime Error</h2>
          <p className="text-sm text-slate-400 mb-6">
            An unhandled system error occurred. Details have been logged for institutional audit.
          </p>
          <div className="bg-slate-950 p-3 rounded-lg text-xs font-mono text-slate-500 mb-6 text-left break-all">
            {error.message || 'Unknown error'}
          </div>
          <button
            onClick={() => reset()}
            className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl transition-colors"
          >
            Attempt Recovery
          </button>
        </div>
      </body>
    </html>
  );
}
