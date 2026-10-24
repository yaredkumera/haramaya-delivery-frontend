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
}: FieldProps) {
  const [visible, setVisible] = useState(false)
  const isPassword = type === "password"

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-semibold text-slate-600">
          {label}
        </label>
        {labelAction}
      </div>
      <div className="relative">
        <Icon className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id={id}
          type={isPassword && visible ? "text" : type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          className={`w-full rounded-xl border bg-slate-50 py-2.5 pr-11 pl-10 text-sm text-slate-800 transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:outline-none ${
            error ? "border-red-400" : "border-slate-200"
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute top-1/2 right-3.5 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default Field