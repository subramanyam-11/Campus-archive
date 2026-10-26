'use client';

import React, { useEffect } from 'react';

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Portal module error:', error);
  }, [error]);

  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-error-container text-on-error-container flex items-center justify-center mb-3">
        <span className="material-symbols-outlined text-2xl">warning</span>
      </div>
      <h2 className="text-headline-sm font-semibold text-on-surface mb-1">
        Record Failed to Load
      </h2>
      <p className="text-body-sm text-on-surface-variant max-w-md mb-6">
        An error occurred while rendering this institutional view.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-primary text-on-primary rounded-lg text-label-md font-medium hover:bg-primary-container transition-colors shadow-sm"
        >
          Retry View
        </button>
        <a
          href="/dashboard"
          className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg text-label-md font-medium transition-colors"
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  );
}
