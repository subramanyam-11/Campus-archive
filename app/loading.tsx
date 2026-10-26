export default function RootLoading() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3 text-white">
      <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold animate-pulse">
        Loading CampusArchive...
      </div>
    </div>
  );
}
