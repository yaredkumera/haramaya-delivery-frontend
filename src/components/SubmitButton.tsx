import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

type SubmitButtonProps = {
  loading: boolean
  loadingText: string
  icon: LucideIcon
  children: ReactNode
}

function SubmitButton({ loading, loadingText, icon: Icon, children }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-teal-700/20 transition hover:from-teal-700 hover:to-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-slate-800"
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          {loadingText}
        </>
      ) : (
        <>
          <Icon className="h-4 w-4" />
          {children}
        </>
      )}
    </button>
  )
}

export default SubmitButton