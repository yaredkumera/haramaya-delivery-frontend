import { useState } from "react"
import type { SubmitEvent } from "react"
import { Link, useNavigate, useParams } from "react-router"
import toast from "react-hot-toast"
import { Lock, KeyRound } from "lucide-react"
import AuthLayout from "../components/AuthLayout"
import Field from "../components/Field"
import FormError from "../components/FormError"
import SubmitButton from "../components/SubmitButton"
import { useResetPasswordMutation } from "../services/api"
import { getErrorMessage } from "../utils/apiError"

function ResetPassword() {
  const { token = "" } = useParams()
  const navigate = useNavigate()
  const [reset, { isLoading }] = useResetPasswordMutation()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (password.length < 8) return setError("Password must be at least 8 characters")
    if (password !== confirm) return setError("Passwords do not match")
    setError(null)
    try {
      await reset({ token, password }).unwrap()
      toast.success("Password changed. Please sign in.")
      navigate("/login", { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="Use at least 8 characters."
      heroTitle="Almost done."
      heroText="After this, you will be signed out everywhere and can sign in with your new password."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field id="password" label="New password" icon={Lock} type="password" value={password} onChange={setPassword} />
        <Field id="confirm" label="Confirm password" icon={Lock} type="password" value={confirm} onChange={setConfirm} />
        <FormError message={error} />
        <SubmitButton loading={isLoading} loadingText="Saving..." icon={KeyRound}>Change password</SubmitButton>
        <Link to="/forgot-password" className="block text-center text-sm font-semibold text-teal-700 hover:underline">Need a new link?</Link>
      </form>
    </AuthLayout>
  )
}

export default ResetPassword