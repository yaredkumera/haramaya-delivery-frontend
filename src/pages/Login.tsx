import { useState } from "react"
import type { SubmitEvent } from "react"
import { Link, useNavigate } from "react-router"
import { Mail, Lock, LogIn, HelpCircle } from "lucide-react"
import { useLoginMutation } from "../services/api"
import { getErrorMessage } from "../utils/apiError"
import AuthLayout from "../components/AuthLayout"
import Field from "../components/Field"
import FormError from "../components/FormError"
import SubmitButton from "../components/SubmitButton"
import GoogleButton from "../components/GoogleButton"

function Login() {
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
      heroText="Order  goods from  Harar and Dire Dawa markets, and collect them at one easy pickup address near Main campus, Bate."
    >
      <GoogleButton onError={setError} />

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        <span className="text-xs text-slate-400 dark:text-slate-500">or sign in with email</span>
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
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
          autoComplete="email"
        />
        <Field
          id="password"
          label="Password"
          icon={Lock}
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          autoComplete="current-password"
          labelAction={
            <Link to="/forgot-password" className="text-xs font-medium text-teal-700 hover:underline dark:text-teal-400">
              Forgot password?
            </Link>
          }
        />

        <FormError message={error} />

        <SubmitButton loading={isLoading} loadingText="Signing in..." icon={LogIn}>
          Sign in
        </SubmitButton>
      </form>

      {/* --- HELP LINK PLACED HERE AT BOTTOM --- */}
      <div className="mt-6 border-t border-slate-200 pt-4 flex items-center justify-between text-sm dark:border-slate-700">
        <p className="text-slate-500 dark:text-slate-400">
          New to Haramaya Delivery?{" "}
          <Link to="/register" className="font-semibold text-teal-700 hover:underline dark:text-teal-400">
            Create account
          </Link>
        </p>

        <Link
          to="/help"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-cyan-600 hover:text-cyan-500 dark:text-cyan-400"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Need Help?</span>
        </Link>
      </div>
    </AuthLayout>
  )
}

export default Login