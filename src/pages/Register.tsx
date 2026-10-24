import { useState } from "react"
import type { SubmitEvent } from "react"
import { Link, useNavigate } from "react-router"
import { User, Phone, Mail, Lock, UserPlus } from "lucide-react"
import { useRegisterMutation } from "../services/api"
import { getErrorMessage, getFieldErrors } from "../utils/apiError"
import AuthLayout from "../components/AuthLayout"
import Field from "../components/Field"
import FormError from "../components/FormError"
import SubmitButton from "../components/SubmitButton"

function Register() {
  const navigate = useNavigate()
  const [register, { isLoading }] = useRegisterMutation()

  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()

    const cleanPhone = phone.replace(/[\s-]/g, "")

    if (!fullName.trim() || !cleanPhone || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }
    if (fullName.trim().length < 2) {
      setError("Please enter your full name")
      return
    }
    if (!/^(\+251|251|0)?[79]\d{8}$/.test(cleanPhone)) {
      setError("Enter a valid Ethiopian phone number, like 0912345678")
      return
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setError(null)
    setFieldErrors({})
    try {
      await register({ fullName, phone: cleanPhone, email, password }).unwrap()
      navigate("/")
    } catch (err) {
      setFieldErrors(getFieldErrors(err))
      setError(getErrorMessage(err))
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Fast, reliable, easy pickup."
      heroTitle="Join Haramaya Delivery."
      heroText="Create a free account to start ordering. It takes less than a minute."
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Field
          id="fullName"
          label="Full Name"
          icon={User}
          value={fullName}
          onChange={setFullName}
          placeholder="Abebe Bikila"
          error={fieldErrors.fullName}
        />
        <Field
          id="phone"
          label="Phone Number"
          icon={Phone}
          type="tel"
          value={phone}
          onChange={setPhone}
          placeholder="0912345678"
          error={fieldErrors.phone}
        />
        <Field
          id="email"
          label="Email"
          icon={Mail}
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="student@gmail.com"
          error={fieldErrors.email}
        />
        <Field
          id="password"
          label="Password"
          icon={Lock}
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="At least 8 characters"
          error={fieldErrors.password}
        />
        <Field
          id="confirmPassword"
          label="Confirm Password"
          icon={Lock}
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Repeat your password"
        />

        <FormError message={error} />

        <SubmitButton loading={isLoading} loadingText="Creating account..." icon={UserPlus}>
          Register Now &amp; Start Ordering
        </SubmitButton>

        <p className="pt-2 text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-teal-700 hover:underline">
            Sign in
          </Link>
        </p>
        <p className="text-xs text-slate-400">
          By registering, you agree to our <span className="underline">Terms &amp; Conditions</span>.
        </p>
      </form>
    </AuthLayout>
  )
}

export default Register