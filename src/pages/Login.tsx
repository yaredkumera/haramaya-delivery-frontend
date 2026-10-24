import { useState } from "react"
import type { SubmitEvent } from "react"
import { Link, useNavigate } from "react-router"
import { Mail, Lock, LogIn } from "lucide-react"
import { useLoginMutation } from "../services/api"
import { getErrorMessage } from "../utils/apiError"
import AuthLayout from "../components/AuthLayout"
import Field from "../components/Field"
import FormError from "../components/FormError"
import SubmitButton from "../components/SubmitButton"
import GoogleIcon from "../components/GoogleIcon"

type LoginProps = {
  onForgotPassword?: () => void
  onGoogleSignIn?: () => void
}

function Login({ onForgotPassword, onGoogleSignIn }: LoginProps) {
  const navigate = useNavigate()
  const [login, { isLoading }] = useLoginMutation()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    setError(null)
    try {
      await login({ email, password }).unwrap()
      navigate("/")
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to order from Harar and Dire Dawa markets"
      heroTitle="Your campus feast, delivered."
      heroText="Order food and goods from the Harar and Dire Dawa markets, and collect them at one easy pickup address near campus."
    >
      <button
        type="button"
        onClick={() => onGoogleSignIn?.()}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-400">or sign in with email</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          id="email"
          label="Email"
          icon={Mail}
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="student@gmail.com"
        />
        <Field
          id="password"
          label="Password"
          icon={Lock}
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          labelAction={
            <button
              type="button"
              onClick={() => onForgotPassword?.()}
              className="text-xs font-medium text-teal-700 hover:underline"
            >
              Forgot password?
            </button>
          }
        />

        <FormError message={error} />

        <SubmitButton loading={isLoading} loadingText="Signing in..." icon={LogIn}>
          Sign in
        </SubmitButton>
      </form>

      <p className="mt-6 border-t border-slate-100 pt-4 text-sm text-slate-500">
        New to Haramaya Delivery?{" "}
        <Link to="/register" className="font-semibold text-teal-700 hover:underline">
          Create account
        </Link>
      </p>
    </AuthLayout>
  )
}

export default Login