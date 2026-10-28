type PaginationProps = { page: number; totalPages: number; onChange: (page: number) => void }

function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null
  const button = "rounded-lg bg-white px-4 py-2 font-medium ring-1 ring-slate-200 disabled:opacity-40"

  return (
    <div className="mt-8 flex items-center justify-center gap-4 text-sm">
      <button className={button} disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button>
      <span className="text-slate-500">Page {page} of {totalPages}</span>
      <button className={button} disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Next</button>
    </div>
  )
}

export default Pagination