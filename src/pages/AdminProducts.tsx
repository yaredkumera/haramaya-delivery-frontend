import { useCallback, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import type { SubmitEvent } from "react"
import toast from "react-hot-toast"
import { Eye, EyeOff, ImagePlus, PackageOpen, Pencil, Plus, PlusCircle, Save, X } from "lucide-react"
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

type AdminProduct = NonNullable<ReturnType<typeof useGetAdminProductsQuery>["data"]>["items"][number]

const emptyForm: FormState = {
  name: "",
  description: "",
  price: "",
  category: categories[0],
  market: markets[0],
  badge: "",
  available: true,
}

// Reads the description safely, whatever the product type declares
const descriptionOf = (product: object) =>
  "description" in product && typeof product.description === "string" ? product.description : ""

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:outline-none dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-500 dark:focus:bg-slate-900"

const panel =
  "rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"

function Labeled({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600 dark:text-red-400">{error}</span>}
    </label>
  )
}

function AdminProducts() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AdminProduct | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [file, setFile] = useState<File | null>(null)
  const [fileKey, setFileKey] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [createProduct, { isLoading: creating }] = useCreateProductMutation()
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation()
  const { data, isLoading } = useGetAdminProductsQuery({ limit: 50 })
  const saving = creating || updating

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  const closeModal = useCallback(() => {
    setModalOpen(false)
    setEditing(null)
    setForm(emptyForm)
    setFile(null)
    setFileKey((k) => k + 1)
    setError(null)
    setFieldErrors({})
  }, [])

  // Escape closes the modal, and the page behind it does not scroll while it is open
  useEffect(() => {
    if (!modalOpen) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) closeModal()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [modalOpen, saving, closeModal])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function openAdd() {
    setEditing(null)
    setForm(emptyForm)
    setFile(null)
    setFileKey((k) => k + 1)
    setError(null)
    setFieldErrors({})
    setModalOpen(true)
  }

  function openEdit(product: AdminProduct) {
    setEditing(product)
    setForm({
      name: product.name,
      description: descriptionOf(product),
      price: String(product.price),
      category: product.category,
      market: product.market,
      badge: product.badge ?? "",
      available: product.available,
    })
    setFile(null)
    setFileKey((k) => k + 1)
    setError(null)
    setFieldErrors({})
    setModalOpen(true)
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    if (!editing && !file) {
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
    if (file) body.append("image", file)

    try {
      if (editing) {
        await updateProduct({ id: editing.id, body }).unwrap()
        toast.success("Product updated successfully")
      } else {
        await createProduct(body).unwrap()
        toast.success("Product added successfully")
      }
      closeModal()
    } catch (err) {
      const message = getErrorMessage(err)
      setFieldErrors(getFieldErrors(err))
      setError(message)
      toast.error(editing ? `Failed to update product: ${message}` : `Failed to add product: ${message}`)
    }
  }

  async function toggleAvailable(id: string, available: boolean) {
    const body = new FormData()
    body.append("available", String(!available))
    try {
      await updateProduct({ id, body }).unwrap()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const shownImage = preview ?? (editing ? optimizeImage(editing.imageUrl, 160) : null)

  return (
    <div>
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-extrabold text-slate-800 sm:text-2xl dark:text-slate-100">All products</h1>
            <span className="rounded-full bg-teal-100 px-3 py-1 text-sm font-bold text-teal-800 dark:bg-teal-500/15 dark:text-teal-300">
              {data?.total ?? 0}
            </span>
          </div>
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-700/20 transition hover:from-teal-700 hover:to-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 active:scale-[0.98] dark:focus-visible:ring-offset-slate-900"
          >
            <Plus className="h-4 w-4" />
            Add product
          </button>
        </div>

        {isLoading && (
          <div className="animate-pulse space-y-3" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        )}

        {data && data.items.length === 0 && (
          <div className={`${panel} p-10 text-center`}>
            <PackageOpen className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-3 font-semibold text-slate-700 dark:text-slate-100">No products yet</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Press "Add product" to create your first one.</p>
          </div>
        )}

        <ul className="space-y-3">
          {data?.items.map((p) => (
            <li key={p.id} className={`${panel} flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap sm:gap-4`}>
              <img
                src={optimizeImage(p.imageUrl, 120)}
                alt=""
                className={`h-16 w-16 shrink-0 rounded-xl bg-slate-100 object-cover dark:bg-slate-700 ${
                  p.available ? "" : "opacity-50"
                }`}
              />
              <div className="min-w-0 flex-1 basis-40">
                <p className="truncate font-semibold text-slate-800 dark:text-slate-100">{p.name}</p>
                <p className="font-bold text-teal-700 dark:text-teal-400">{formatPrice(p.price)}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {categoryLabels[p.category]} · {marketLabels[p.market]}
                  {p.badge && ` · ${p.badge}`}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(p)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:bg-sky-500/15 dark:text-sky-300 dark:hover:bg-sky-500/25"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => toggleAvailable(p.id, p.available)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                    p.available
                      ? "bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-500/15 dark:text-teal-300 dark:hover:bg-teal-500/25"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                  }`}
                >
                  {p.available ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  {p.available ? "Visible · Hide" : "Hidden · Show"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </main>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-3 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) closeModal()
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-4 shadow-2xl ring-1 ring-slate-200 sm:p-6 dark:bg-slate-800 dark:ring-slate-700"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm">
                  {editing ? <Pencil className="h-5 w-5" /> : <PlusCircle className="h-5 w-5" />}
                </span>
                <div>
                  <h2
                    id="product-modal-title"
                    className="text-lg font-extrabold text-slate-800 sm:text-xl dark:text-slate-100"
                  >
                    {editing ? "Edit product" : "Add a product"}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {editing ? "Change the details and save." : "New items appear in the student shop."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close"
                disabled={saving}
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Labeled label="Name" error={fieldErrors.name}>
                <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} />
              </Labeled>

              <Labeled label="Description" error={fieldErrors.description}>
                <textarea
                  rows={3}
                  className={`${inputClass} resize-y`}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </Labeled>

              <div className="grid gap-3 sm:grid-cols-2">
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

              <div className="grid gap-3 sm:grid-cols-2">
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

              <Labeled
                label={editing ? "Image (leave empty to keep the current one)" : "Image (JPG, PNG or WebP, max 3 MB)"}
              >
                <div className="flex items-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-900/40">
                  {shownImage ? (
                    <img
                      src={shownImage}
                      alt="Preview"
                      className="h-20 w-20 shrink-0 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-600"
                    />
                  ) : (
                    <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:ring-slate-700">
                      <ImagePlus className="h-7 w-7" />
                    </span>
                  )}
                  <input
                    key={fileKey}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="block min-w-0 flex-1 text-xs text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-teal-700 hover:file:bg-teal-100 dark:text-slate-300 dark:file:bg-teal-500/15 dark:file:text-teal-300 dark:hover:file:bg-teal-500/25"
                  />
                </div>
              </Labeled>

              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 dark:bg-slate-900/40 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) => set("available", e.target.checked)}
                  className="h-4 w-4 rounded accent-teal-600"
                />
                Visible to students
              </label>

              <FormError message={error} />

              <div className="grid gap-2 pt-1 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={closeModal}
                  className="order-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:opacity-50 sm:order-1 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
                <div className="order-1 sm:order-2">
                  <SubmitButton
                    loading={saving}
                    loadingText={editing ? "Saving..." : "Adding..."}
                    icon={editing ? Save : PlusCircle}
                  >
                    {editing ? "Save" : "Add"}
                  </SubmitButton>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProducts