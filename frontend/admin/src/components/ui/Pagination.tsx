interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  const rendered: (number | '...')[] = [];
  pages.forEach((p, idx) => {
    if (idx > 0 && p - pages[idx - 1] > 1) rendered.push('...');
    rendered.push(p);
  });

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 disabled:opacity-40 hover:bg-slate-50"
      >
        Prev
      </button>
      {rendered.map((p, idx) =>
        p === '...' ? (
          <span key={`gap-${idx}`} className="px-2 text-slate-400">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`min-w-[2.25rem] rounded-md border px-3 py-1.5 text-sm ${
              p === page
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 disabled:opacity-40 hover:bg-slate-50"
      >
        Next
      </button>
    </nav>
  );
}
