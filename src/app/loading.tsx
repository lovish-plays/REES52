export default function Loading() {
  return (
    <div className="flex min-h-[55vh] flex-1 items-center justify-center bg-white" role="status" aria-label="Loading">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-sky-600" />
    </div>
  );
}
