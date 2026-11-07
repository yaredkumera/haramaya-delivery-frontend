import { useState } from "react"
import { Phone, AlertTriangle, CheckCircle2 } from "lucide-react"
import Field from "./Field"
import { useUpdateProfileMutation } from "../services/api"
import { getErrorMessage } from "../utils/apiError"

function AddPhone() {
  const [save, { isLoading }] = useUpdateProfileMutation()
  const [phone, setPhone] = useState("")
  const [error, setError] = useState<string | undefined>()

  const cleanPhone = phone.replace(/[\s-]/g, "")
  const isValidEthPhone = /^(\+251|251|0)?[79]\d{8}$/.test(cleanPhone)

  async function submit() {
    setError(undefined)

    if (!phone.trim()) {
      setError("Please enter your phone number")
      return
    }

    if (!isValidEthPhone) {
      setError("Enter a valid Ethiopian phone number (e.g., 0912345678 or 0712345678)")
      return
    }

    try {
      await save({ phone: cleanPhone }).unwrap()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="mt-6 mb-6 rounded-2xl border border-amber-500/30 bg-amber-50/90 p-5 shadow-lg backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-black/40">
      <div className="flex items-start gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-amber-950 dark:text-amber-300">
            Phone Number Required for SMS Notifications
          </h3>
          <p className="mt-0.5 text-xs text-amber-800/90 dark:text-slate-300 leading-relaxed">
            Please add your active mobile number so we can send you pickup alerts and delivery updates via SMS & Gmail.
          </p>
        </div>
      </div>

      <div className="mt-4 max-w-md space-y-3.5">
        <Field
          id="phone"
          label="Mobile Phone Number"
          icon={Phone}
          type="tel"
          value={phone}
          onChange={(val) => {
            setPhone(val)
            if (error) setError(undefined)
          }}
          placeholder="0912345678"
          error={error}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Format: <code className="font-mono font-semibold text-teal-700 dark:text-teal-400">09...</code> or <code className="font-mono font-semibold text-teal-700 dark:text-teal-400">07...</code>
          </p>

          <button
            type="button"
            disabled={isLoading || !phone.trim()}
            onClick={submit}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-teal-900/20 transition hover:from-teal-700 hover:to-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-slate-900"
          >
            <CheckCircle2 className="h-4 w-4" />
            {isLoading ? "Saving..." : "Save Phone Number"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddPhone