import { useState } from "react"
import type { SubmitEvent } from "react"
import { Link } from "react-router"
import { Mail, Send } from "lucide-react"
import AuthLayout from "../components/AuthLayout"
import Field from "../components/Field"
import FormError from "../components/FormError"
import SubmitButton from "../components/SubmitButton"
import { useForgotPasswordMutation } from "../services/api"
import { getErrorMessage } from "../utils/apiError"

function ForgotPassword() {
  const [forgot, { isLoading }] = useForgotPasswordMutation()
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }
    setError(null)
    try {
      await forgot({ email }).unwrap()
      setSent(true)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your email and we will send you a reset link."
      heroTitle="We will get you back in."
      heroText="Reset links expire after one hour and work only once."
    >
      {sent ? (
        <div className="space-y-4 text-sm text-slate-600">
          <p className="rounded-xl bg-emerald-50 p-4 text-emerald-800">
            If an account exists for this email, a reset link has been sent. Check your inbox and spam folder.
          </p>
          <p>
            No email? Ask the shop to send you a reset link. <Link to="/login" className="font-semibold text-teal-700 hover:underline">Back to sign in</Link>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field id="email" label="Email" icon={Mail} type="email" value={email} onChange={setEmail} placeholder="student@gmail.com" />
          <FormError message={error} />
          <SubmitButton loading={isLoading} loadingText="Sending..." icon={Send}>Send reset link</SubmitButton>
          <Link to="/login" className="block text-center text-sm font-semibold text-teal-700 hover:underline">Back to sign in</Link>
        </form>
      )}
    </AuthLayout>
  )
}

export default ForgotPassword