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

const tidyName = (text: string) => text.replace(/\s+/g, " ").trim()

function Register() {
  const navigate = useNavigate()
  const [register, { isLoading }] = useRegisterMutation()

  const [firstName, setFirstName] = useState("")
  const [middleName, setMiddleName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()

    const first = tidyName(firstName)
    const middle = tidyName(middleName)
    const last = tidyName(lastName)
    const cleanPhone = phone.replace(/[\s-]/g, "")

    if (!first || !middle || !last || !cleanPhone || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }
    if (first.length < 2 || middle.length < 2 || last.length < 2) {
      setError("Each name must have at least 2 letters")
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

    // The three names are joined into one full name before reaching the server
    const fullName = [first, middle, last].join(" ")

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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="firstName"
            label="First name"
            icon={User}
            value={firstName}
            onChange={setFirstName}
            placeholder="Abebe"
            autoComplete="given-name"
          />
          <Field
            id="middleName"
            label="Middle name"
            icon={User}
            value={middleName}
            onChange={setMiddleName}
            placeholder="Bikila"
            autoComplete="additional-name"
          />
          <div className="sm:col-span-2">
            <Field
              id="lastName"
              label="Last name"
              icon={User}
              value={lastName}
              onChange={setLastName}
              placeholder="Kebede"
              autoComplete="family-name"
              error={fieldErrors.fullName}
            />
          </div>
        </div>

        <Field
          id="phone"
          label="Phone Number"
          icon={Phone}
          type="tel"
          value={phone}
          onChange={setPhone}
          placeholder="0912345678"
          autoComplete="tel"
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
          autoComplete="email"
          error={fieldErrors.email}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="password"
            label="Password"
            icon={Lock}
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="At least 8 characters"
            autoComplete="new-password"
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
            autoComplete="new-password"
          />
        </div>

        <FormError message={error} />

        <SubmitButton loading={isLoading} loadingText="Creating account..." icon={UserPlus}>
          Register Now &amp; Start Ordering
        </SubmitButton>

        <p className="pt-2 text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-teal-700 hover:underline dark:text-teal-400">
            Sign in
          </Link>
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          By registering, you agree to our <span className="underline">Terms &amp; Conditions</span>.
        </p>
      </form>
    </AuthLayout>
  )
}

export default Register