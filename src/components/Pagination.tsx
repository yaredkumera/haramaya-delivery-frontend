import { ChevronLeft, ChevronRight } from "lucide-react"

type PaginationProps = { page: number; totalPages: number; onChange: (page: number) => void }

function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null
  const button =
    "inline-flex min-h-11 items-center gap-1 rounded-xl bg-white px-4 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700"

  return (
    <nav className="mt-8 flex items-center justify-between gap-3 text-sm sm:justify-center sm:gap-6" aria-label="Pages">
      <button type="button" className={button} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>
      <span className="text-slate-500 dark:text-slate-400">
        Page {page} of {totalPages}
      </span>
      <button type="button" className={button} disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}

export default Pagination