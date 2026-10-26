export default function MainLoading() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-3 p-8">
      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-xs uppercase tracking-wider text-outline font-medium animate-pulse">
        Synchronizing Institutional Records...
      </span>
    </div>
  );
}
