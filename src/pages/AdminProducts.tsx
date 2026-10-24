import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import type { SubmitEvent } from "react"
import { PlusCircle } from "lucide-react"
import Header from "../components/Header"
import FormError from "../components/FormError"
import SubmitButton from "../components/SubmitButton"
import {
  useCreateProductMutation,
  useGetAdminProductsQuery,
  useUpdateProductMutation,
} from "../services/api"
import { getErrorMessage, getFieldErrors } from "../utils/apiError"
import { formatPrice, optimizeImage } from "../utils/format"
import { categories, categoryLabels, markets, marketLabels } from "../types"
import type { Category, Market } from "../types"

type FormState = {
  name: string
  description: string
  price: string
  category: Category
  market: Market
  badge: string
  available: boolean
}

const emptyForm: FormState = {
  name: "",
  description: "",
  price: "",
  category: categories[0],
  market: markets[0],
  badge: "",
  available: true,
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:outline-none"

function Labeled({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-600">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}

function AdminProducts() {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [file, setFile] = useState<File | null>(null)
  const [fileKey, setFileKey] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)

  const [createProduct, { isLoading: creating }] = useCreateProductMutation()
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation()
  const { data } = useGetAdminProductsQuery({ limit: 50 })

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setSaved(false)

    if (!file) {
      setError("Please choose a product image")
      return
    }

    const body = new FormData()
    body.append("name", form.name)
    body.append("description", form.description)
    body.append("price", form.price)
    body.append("category", form.category)
    body.append("market", form.market)
    if (form.badge.trim()) body.append("badge", form.badge.trim())
    body.append("available", String(form.available))
    body.append("image", file)

    try {
      await createProduct(body).unwrap()
      setForm(emptyForm)
      setFile(null)
      setFileKey((k) => k + 1)
      setSaved(true)
    } catch (err) {
      setFieldErrors(getFieldErrors(err))
      setError(getErrorMessage(err))
    }
  }

  async function toggleAvailable(id: string, available: boolean) {
    const body = new FormData()
    body.append("available", String(!available))
    try {
      await updateProduct({ id, body }).unwrap()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[400px_1fr]">
        <section>
          <h1 className="mb-4 text-2xl font-bold text-slate-800">Add a product</h1>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100"
          >
            <Labeled label="Name" error={fieldErrors.name}>
              <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} />
            </Labeled>

            <Labeled label="Description" error={fieldErrors.description}>
              <textarea
                rows={3}
                className={inputClass}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </Labeled>

            <div className="grid grid-cols-2 gap-3">
              <Labeled label="Price (ETB)" error={fieldErrors.price}>
                <input
                  className={inputClass}
                  inputMode="numeric"
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                />
              </Labeled>
              <Labeled label="Badge (optional)" error={fieldErrors.badge}>
                <input className={inputClass} value={form.badge} onChange={(e) => set("badge", e.target.value)} />
              </Labeled>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Labeled label="Category" error={fieldErrors.category}>
                <select
                  className={inputClass}
                  value={form.category}
                  onChange={(e) => set("category", e.target.value as Category)}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{categoryLabels[c]}</option>
                  ))}
                </select>
              </Labeled>
              <Labeled label="Market" error={fieldErrors.market}>
                <select
                  className={inputClass}
                  value={form.market}
                  onChange={(e) => set("market", e.target.value as Market)}
                >
                  {markets.map((m) => (
                    <option key={m} value={m}>{marketLabels[m]}</option>
                  ))}
                </select>
              </Labeled>
            </div>

            <Labeled label="Image (JPG, PNG or WebP, max 3 MB)">
              <input
                key={fileKey}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-teal-700"
              />
            </Labeled>
            {preview && <img src={preview} alt="Preview" className="h-32 w-32 rounded-xl object-cover" />}

            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={form.available}
                onChange={(e) => set("available", e.target.checked)}
              />
              Visible to students
            </label>

            <FormError message={error} />
            {saved && <p className="text-sm font-medium text-teal-700">Product created.</p>}

            <SubmitButton loading={creating} loadingText="Saving..." icon={PlusCircle}>
              Add product
            </SubmitButton>
          </form>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-slate-800">All products ({data?.total ?? 0})</h2>
          <ul className="space-y-3">
            {data?.items.map((p) => (
              <li key={p.id} className="flex items-center gap-4 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
                <img src={optimizeImage(p.imageUrl, 120)} alt="" className="h-14 w-14 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-800">{p.name}</p>
                  <p className="text-xs text-slate-500">
                    {formatPrice(p.price)} · {categoryLabels[p.category]} · {marketLabels[p.market]}
                    {p.badge && ` · ${p.badge}`}
                  </p>
                </div>
                <button
                  disabled={updating}
                  onClick={() => toggleAvailable(p.id, p.available)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    p.available ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {p.available ? "Visible · Hide" : "Hidden · Show"}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}

export default AdminProducts