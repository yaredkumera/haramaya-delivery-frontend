import { useState } from "react"
import type { ReactNode } from "react"
import { Eye, EyeOff } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type FieldProps = {
  id: string
  label: string
  icon: LucideIcon
  value: string
  onChange: (value: string) => void
  type?: "text" | "email" | "tel" | "password"
  placeholder?: string
  error?: string
  labelAction?: ReactNode
  autoComplete?: string
}

function Field({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
  labelAction,
  autoComplete,
}: FieldProps) {
  const [visible, setVisible] = useState(false)
  const isPassword = type === "password"

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </label>
        {labelAction}
      </div>
      <div className="relative">
        <Icon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        <input
          id={id}
          type={isPassword && visible ? "text" : type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          className={`w-full rounded-xl border bg-slate-50 py-3 pl-10 text-base text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:outline-none sm:text-sm dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-500 dark:focus:bg-slate-900 ${
            isPassword ? "pr-11" : "pr-3"
          } ${error ? "border-red-400 dark:border-red-500/60" : "border-slate-200 dark:border-slate-600"}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:hover:text-slate-200"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}

export default Field