export default function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}
