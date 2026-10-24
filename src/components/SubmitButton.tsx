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
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-teal-700/20 transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
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