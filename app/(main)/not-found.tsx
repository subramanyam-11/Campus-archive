export default function MainNotFound() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary mb-3">
        <span className="material-symbols-outlined text-2xl">search_off</span>
      </div>
      <h2 className="text-headline-sm font-semibold text-on-surface mb-1">
        Record Not Found
      </h2>
      <p className="text-body-sm text-on-surface-variant max-w-md mb-6">
        The requested committee, event, or institutional document does not exist in the active ledger.
      </p>
      <a
        href="/dashboard"
        className="px-4 py-2 bg-primary text-on-primary rounded-lg text-label-md font-medium hover:bg-primary-container transition-colors shadow-sm"
      >
        Go to Dashboard
      </a>
    </div>
  );
}
