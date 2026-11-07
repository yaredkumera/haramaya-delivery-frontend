import { useEffect, useMemo, useState } from "react"
import type { ReactNode, SubmitEvent } from "react"
import { Camera, KeyRound, Lock, Mail, Phone, Save, Trash2, User as UserIcon } from "lucide-react"
import toast from "react-hot-toast"
import Header from "../components/Header"
import Avatar from "../components/Avatar"
import Field from "../components/Field"
import FormError from "../components/FormError"
import SubmitButton from "../components/SubmitButton"
import { useAppSelector } from "../context/hooks"
import {
  useChangePasswordMutation,
  useRemoveAvatarMutation,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
} from "../services/api"
import { getErrorMessage, getFieldErrors } from "../utils/apiError"
import { formatDate } from "../utils/format"
import type { User } from "../types"

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_IMAGE_BYTES = 3 * 1024 * 1024

const card = "rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6 dark:bg-slate-800 dark:ring-slate-700"
const buttonBase =
  "inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50"

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className={card}>
      <h2 className="font-bold text-slate-800 dark:text-slate-100">{title}</h2>
      {hint && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{hint}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  )
}

function PhotoSection({ user }: { user: User }) {
  const [upload, { isLoading: uploading }] = useUploadAvatarMutation()
  const [remove, { isLoading: removing }] = useRemoveAvatarMutation()
  const [file, setFile] = useState<File | null>(null)
  const [fileKey, setFileKey] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  function choose(selected: File | null) {
    setError(null)
    if (selected && !IMAGE_TYPES.includes(selected.type)) {
      setError("Choose a JPG, PNG or WebP image")
      setFile(null)
      setFileKey((k) => k + 1)
      return
    }
    if (selected && selected.size > MAX_IMAGE_BYTES) {
      setError("The image must be 3 MB or smaller")
      setFile(null)
      setFileKey((k) => k + 1)
      return
    }
    setFile(selected)
  }

  async function save() {
    if (!file) return
    const body = new FormData()
    body.append("image", file)
    try {
      await upload(body).unwrap()
      toast.success("Photo updated")
      setFile(null)
      setFileKey((k) => k + 1)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function removePhoto() {
    setError(null)
    try {
      await remove().unwrap()
      toast.success("Photo removed")
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <Section title="Profile photo" hint="JPG, PNG or WebP, up to 3 MB.">
      <div className="flex items-center gap-4">
        {preview ? (
          <img src={preview} alt="Preview" className="h-20 w-20 shrink-0 rounded-full object-cover" />
        ) : (
          <Avatar name={user.fullName} url={user.avatarUrl} size={80} />
        )}
        <input
          key={fileKey}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => choose(e.target.files?.[0] ?? null)}
          className="block min-w-0 flex-1 text-xs text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-teal-700 dark:text-slate-300 dark:file:bg-teal-500/15 dark:file:text-teal-300"
        />
      </div>

      <FormError message={error} />

      <div className="flex flex-wrap gap-2">
        {file && (
          <button type="button" disabled={uploading} onClick={save} className={`${buttonBase} bg-teal-700 text-white hover:bg-teal-800`}>
            <Camera className="h-4 w-4" />
            {uploading ? "Uploading..." : "Save photo"}
          </button>
        )}
        {user.avatarSource === "uploaded" && !file && (
          <button
            type="button"
            disabled={removing}
            onClick={removePhoto}
            className={`${buttonBase} bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-300`}
          >
            <Trash2 className="h-4 w-4" />
            {removing ? "Removing..." : "Remove my photo"}
          </button>
        )}
      </div>
      {user.avatarSource === "google" && (
        <p className="text-xs text-slate-500 dark:text-slate-400">This photo comes from your Google account. Upload one to replace it.</p>
      )}
    </Section>
  )
}

function DetailsSection({ user }: { user: User }) {
  const [save, { isLoading }] = useUpdateProfileMutation()
  const [fullName, setFullName] = useState(user.fullName)
  const [phone, setPhone] = useState(user.phone ?? "")
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  async function submit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    const changes: { fullName?: string; phone?: string } = {}
    if (fullName.trim() && fullName.trim() !== user.fullName) changes.fullName = fullName.trim()
    if (phone.trim() && phone.trim() !== (user.phone ?? "")) changes.phone = phone.trim()
    if (Object.keys(changes).length === 0) {
      toast("Nothing to save")
      return
    }

    try {
      const saved = await save(changes).unwrap()
      setFullName(saved.fullName)
      setPhone(saved.phone ?? "")
      toast.success("Saved")
    } catch (err) {
      setFieldErrors(getFieldErrors(err))
      setError(getErrorMessage(err))
    }
  }

  return (
    <Section title="Your details" hint={user.phone ? undefined : "Add a phone number so we can reach you about your orders."}>
      <form onSubmit={submit} className="space-y-4">
        <Field id="fullName" label="Full name" icon={UserIcon} value={fullName} onChange={setFullName} error={fieldErrors.fullName} />

        <div>
          <p className="mb-1 text-xs font-semibold text-slate-600 dark:text-slate-300">Email</p>
          <p className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-700 dark:bg-slate-900/40 dark:text-slate-200">
            <Mail className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="min-w-0 break-all">{user.email}</span>
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">To change your email address, contact support.</p>
        </div>

        <Field
          id="phone"
          label="Phone number"
          icon={Phone}
          type="tel"
          value={phone}
          onChange={setPhone}
          placeholder="0912345678"
          error={fieldErrors.phone}
        />

        <FormError message={error} />
        <SubmitButton loading={isLoading} loadingText="Saving..." icon={Save}>
          Save changes
        </SubmitButton>
      </form>
    </Section>
  )
}

function PasswordSection({ user }: { user: User }) {
  const [change, { isLoading }] = useChangePasswordMutation()
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  async function submit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    if (!current || !next) return setError("Fill in all the password fields")
    if (next.length < 8) return setError("The new password must be at least 8 characters")
    if (next !== confirm) return setError("The new passwords do not match")

    try {
      await change({ currentPassword: current, newPassword: next }).unwrap()
      setCurrent("")
      setNext("")
      setConfirm("")
      toast.success("Password changed. Other devices were signed out.")
    } catch (err) {
      setFieldErrors(getFieldErrors(err))
      setError(getErrorMessage(err))
    }
  }

  if (!user.hasPassword) {
    return (
      <Section title="Password">
        <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900/40 dark:text-slate-300">
          You sign in with Google, so this account has no password. If you also want one, use{" "}
          <b>Forgot password</b> on the sign-in page.
        </p>
      </Section>
    )
  }

  return (
    <Section title="Change password" hint="Changing it signs you out on your other devices.">
      <form onSubmit={submit} className="space-y-4">
        <Field id="current" label="Current password" icon={Lock} type="password" value={current} onChange={setCurrent} error={fieldErrors.currentPassword} />
        <Field id="next" label="New password" icon={Lock} type="password" value={next} onChange={setNext} placeholder="At least 8 characters" error={fieldErrors.newPassword} />
        <Field id="confirm" label="Confirm new password" icon={Lock} type="password" value={confirm} onChange={setConfirm} />
        <FormError message={error} />
        <SubmitButton loading={isLoading} loadingText="Changing..." icon={KeyRound}>
          Change password
        </SubmitButton>
      </form>
    </Section>
  )
}

function AccountPage() {
  const user = useAppSelector((s) => s.auth.user)
  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="mx-auto max-w-2xl space-y-5 px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex items-center gap-4">
          <Avatar name={user.fullName} url={user.avatarUrl} size={64} />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold text-slate-800 dark:text-slate-100">{user.fullName}</h1>
            <p className="truncate text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
            {user.createdAt && (
              <p className="text-xs text-slate-400 dark:text-slate-500">Member since {formatDate(user.createdAt)}</p>
            )}
          </div>
        </div>

        <PhotoSection key={`photo-${user.id}`} user={user} />
        <DetailsSection key={`details-${user.id}`} user={user} />
        <PasswordSection key={`password-${user.id}`} user={user} />
      </main>
    </div>
  )
}

export default AccountPage