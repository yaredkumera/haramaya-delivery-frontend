import { useState } from "react"
import { Phone } from "lucide-react"
import Field from "./Field"
import { useUpdatePhoneMutation } from "../services/api"
import { getErrorMessage } from "../utils/apiError"

function AddPhone() {
  const [save, { isLoading }] = useUpdatePhoneMutation()
  const [phone, setPhone] = useState("")
  const [error, setError] = useState<string | undefined>()

  async function submit() {
    setError(undefined)
    try {
      await save({ phone }).unwrap()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="mb-6 space-y-3 rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
      <p className="text-sm font-semibold text-amber-900">Add your phone number so we can reach you about your order.</p>
      <Field id="phone" label="Phone number" icon={Phone} type="tel" value={phone} onChange={setPhone} placeholder="0912345678" error={error} />
      <button type="button" disabled={isLoading || !phone.trim()} onClick={submit} className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
        {isLoading ? "Saving..." : "Save phone number"}
      </button>
    </div>
  )
}

export default AddPhone