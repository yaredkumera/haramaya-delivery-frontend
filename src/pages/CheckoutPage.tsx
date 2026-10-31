import { useState } from "react"
import type { SubmitEvent } from "react"
import { Link, useNavigate } from "react-router"
import {
  ArrowLeft,
  Banknote,
  Check,
  Copy,
  Hash,
  Landmark,
  Lock,
  ShieldCheck,
  Smartphone,
  User,
  Zap,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import Header from "../components/Header"
import FormError from "../components/FormError"
import { useCheckoutMutation, useGetCartQuery, useGetPaymentInfoQuery } from "../services/api"
import { getErrorMessage, getFieldErrors } from "../utils/apiError"
import { formatPrice } from "../utils/format"
import { PICKUP_ADDRESS } from "../config"
import type { CheckoutRequest } from "../types"

type OptionId = "telebirr-telebirr" | "telebirr-cbe" | "cbe-cbe" | "cod"

type Option = {
  id: OptionId
  // The app the customer pays FROM. It decides which receipt the server reads.
  method: "telebirr" | "cbe" | "cod"
  // Which of our accounts receives the money
  payTo: "telebirr" | "cbe" | null
  icon: LucideIcon
  title: string
  hint: string
  badge?: string
  speed: string
  idRule?: { length: number; pattern: RegExp; placeholder: string; help: string }
}

const options: Option[] = [
  {
    id: "cbe-cbe",
    method: "cbe",
    payTo: "cbe",
    icon: Landmark,
    title: "From my CBE to your CBE",
    hint: "Send from the CBE app or Mobile Banking to our CBE account",
    badge: "Fastest · Recommended",
    speed: "Checked automatically within seconds.",
    idRule: {
      length: 12,
      pattern: /^FT[A-Z0-9]{10}$/,
      placeholder: "FT26304ABCDE",
      help: "12 characters, starts with FT",
    },
  },
  {
    id: "telebirr-telebirr",
    method: "telebirr",
    payTo: "telebirr",
    icon: Smartphone,
    title: "From my Telebirr to your Telebirr",
    hint: "Send from the Telebirr app to our Telebirr number",
    speed: "Usually checked within a minute or two. Some orders may need a manual check.",
    idRule: {
      length: 10,
      pattern: /^[A-Z0-9]{10}$/,
      placeholder: "DKU1A2B3C4",
      help: "10 characters, letters and numbers",
    },
  },
  {
    id: "telebirr-cbe",
    method: "telebirr",
    payTo: "cbe",
    icon: Smartphone,
    title: "From my Telebirr to your CBE",
    hint: "Send from the Telebirr app to our CBE account",
    speed: "Usually checked within a minute or two. Some orders may need a manual check.",
    idRule: {
      length: 10,
      pattern: /^[A-Z0-9]{10}$/,
      placeholder: "DKU1A2B3C4",
      help: "Use the Telebirr transaction ID: 10 characters, letters and numbers",
    },
  },
  {
    id: "cod",
    method: "cod",
    payTo: null,
    icon: Banknote,
    title: "Cash when I collect",
    hint: "Pay in cash at the pickup point",
    speed: "No payment check is needed.",
  },
]

// Removes stray quotes and commas that may be stored around the account details
const tidy = (text?: string) => (text ?? "").replace(/^["'\s]+|["',\s]+$/g, "")

// Frosted-glass panel: translucent with blur in light mode, solid-ish slate in dark mode
const glass =
  "rounded-2xl bg-white/70 shadow-lg shadow-teal-900/5 ring-1 ring-white/70 backdrop-blur-xl dark:bg-slate-800/70 dark:shadow-black/20 dark:ring-slate-700"

const inputBase =
  "w-full rounded-xl border border-slate-200 bg-white/80 py-3 pl-10 text-base text-slate-800 shadow-sm placeholder:text-slate-400 transition focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-500 dark:focus:bg-slate-900"

const labelClass = "mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200"
const iconInField =
  "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"

function StepTitle({ n, children }: { n: number; children: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-xs font-bold text-white shadow-sm">
        {n}
      </span>
      <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">{children}</h2>
    </div>
  )
}

function CheckoutPage() {
  const navigate = useNavigate()
  const { data: cart, isLoading } = useGetCartQuery()
  const { data: info } = useGetPaymentInfoQuery()
  const [checkout, { isLoading: placing }] = useCheckoutMutation()

  const [optionId, setOptionId] = useState<OptionId>("cbe-cbe")
  const [transactionId, setTransactionId] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const items = cart?.items ?? []
  const total = cart?.total ?? 0
  const blocked = items.some((item) => !item.product.available)

  const option = options.find((o) => o.id === optionId) ?? options[0]
  const payTo = option.payTo ? info?.[option.payTo] : undefined
  const rule = option.idRule

  const idValid = rule ? rule.pattern.test(transactionId) : true
  const namesValid = option.method === "cod" ? true : firstName.trim().length >= 2 && lastName.trim().length >= 2
  const canSubmit =
    items.length > 0 && !blocked && !placing && idValid && namesValid && (option.method === "cod" || Boolean(payTo))

  function chooseOption(id: OptionId) {
    setOptionId(id)
    setTransactionId("")
    setError(null)
    setFieldErrors({})
    setCopied(false)
  }

  function changeTransactionId(value: string) {
    const max = rule?.length ?? 12
    setTransactionId(value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, max))
  }

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(tidy(payTo?.number))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canSubmit) return
    setError(null)
    setFieldErrors({})

    const method = option.method
    const body: CheckoutRequest =
      method === "cod"
        ? { paymentMethod: "cod" }
        : {
            paymentMethod: method,
            transactionId,
            payerName: `${firstName.trim()} ${lastName.trim()}`,
          }

    try {
      const order = await checkout(body).unwrap()
      navigate(`/orders/${order.id}`, { replace: true })
    } catch (err) {
      setFieldErrors(getFieldErrors(err))
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-slate-50 to-sky-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <Header />

      <div className="relative">
        {/* Soft colored glows behind the cards (decoration only) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-teal-300/40 blur-3xl dark:bg-teal-500/10" />
          <div className="absolute -right-24 top-64 h-80 w-80 rounded-full bg-sky-300/40 blur-3xl dark:bg-sky-500/10" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-500/10" />
        </div>

        <main className="relative mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
          <div className="flex items-center gap-3">
            <Link
              to="/cart"
              aria-label="Back to cart"
              className="shrink-0 rounded-xl bg-white/70 p-2 shadow-sm ring-1 ring-white/70 backdrop-blur transition hover:bg-white dark:bg-slate-800/70 dark:ring-slate-700 dark:hover:bg-slate-700"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 sm:text-3xl dark:text-slate-100">
                Checkout
              </h1>
              <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                Choose how you pay, then place your order.
              </p>
            </div>
          </div>

          {isLoading && (
            <div className="mt-6 grid animate-pulse gap-6 lg:grid-cols-3" aria-hidden="true">
              <div className="h-80 rounded-2xl bg-white/60 lg:col-span-2 dark:bg-slate-800/60" />
              <div className="h-60 rounded-2xl bg-white/60 dark:bg-slate-800/60" />
            </div>
          )}

          {cart && items.length === 0 && (
            <div className={`${glass} mx-auto mt-8 max-w-md p-10 text-center`}>
              <p className="font-medium text-slate-600 dark:text-slate-300">Your cart is empty.</p>
              <Link
                to="/"
                className="mt-4 inline-block rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500"
              >
                Browse products
              </Link>
            </div>
          )}

          {items.length > 0 && (
            <form onSubmit={handleSubmit} className="mt-6 grid gap-6 lg:grid-cols-3 lg:gap-8">
              <section className="min-w-0 space-y-5 lg:col-span-2">
                <fieldset>
                  <legend className="mb-3">
                    <StepTitle n={1}>How will you pay?</StepTitle>
                  </legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {options.map((o) => {
                      const Icon = o.icon
                      const selected = o.id === optionId
                      return (
                        <label
                          key={o.id}
                          className={`relative cursor-pointer rounded-2xl p-4 backdrop-blur-xl transition focus-within:ring-2 focus-within:ring-teal-500 ${
                            selected
                              ? "bg-teal-50/90 shadow-md shadow-teal-900/10 ring-2 ring-teal-600 dark:bg-teal-500/10 dark:ring-teal-500"
                              : "bg-white/70 ring-1 ring-white/70 hover:bg-white hover:shadow-md dark:bg-slate-800/70 dark:ring-slate-700 dark:hover:bg-slate-800"
                          } ${o.id === "cbe-cbe" ? "sm:col-span-2" : ""}`}
                        >
                          <input
                            type="radio"
                            name="option"
                            value={o.id}
                            checked={selected}
                            onChange={() => chooseOption(o.id)}
                            className="sr-only"
                          />
                          <div className="flex items-start gap-3">
                            <span
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                selected
                                  ? "bg-teal-600 text-white"
                                  : "bg-teal-50 text-teal-700 dark:bg-slate-700 dark:text-teal-300"
                              }`}
                            >
                              <Icon className="h-5 w-5" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold leading-snug text-slate-800 dark:text-slate-100">{o.title}</p>
                              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{o.hint}</p>
                              {o.badge && (
                                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-teal-600 to-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                                  <Zap className="h-3.5 w-3.5" />
                                  {o.badge}
                                </span>
                              )}
                            </div>
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                                selected
                                  ? "border-teal-600 bg-teal-600 text-white dark:border-teal-500 dark:bg-teal-500"
                                  : "border-slate-300 text-transparent dark:border-slate-600"
                              }`}
                              aria-hidden="true"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </span>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </fieldset>

                {option.method !== "cod" && (
                  <div className={`${glass} space-y-6 p-4 sm:p-6`}>
                    <div className="space-y-3">
                      <StepTitle n={2}>Send the money</StepTitle>
                      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-700 p-4 text-white shadow-md sm:p-5">
                        <p className="text-sm text-teal-50">
                          Send exactly <b className="text-white">{formatPrice(total)}</b> to this{" "}
                          {option.payTo === "cbe" ? "CBE account" : "Telebirr number"}:
                        </p>
                        {payTo ? (
                          <div className="mt-3 space-y-3">
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wider text-teal-100/80">
                                Account holder
                              </p>
                              <p className="text-lg font-bold">{tidy(payTo.name)}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wider text-teal-100/80">
                                {option.payTo === "cbe" ? "Account number" : "Phone number"}
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-3">
                                <p className="break-all font-mono text-xl font-bold tracking-wide sm:text-2xl">
                                  {tidy(payTo.number)}
                                </p>
                                <button
                                  type="button"
                                  onClick={copyNumber}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                >
                                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                  {copied ? "Copied" : "Copy"}
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-3 animate-pulse text-sm text-teal-100">Loading account details...</p>
                        )}
                      </div>
                      <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{option.speed}</p>
                    </div>

                    <div className="space-y-4">
                      <StepTitle n={3}>Enter your payment details</StepTitle>

                      <div>
                        <label htmlFor="transactionId" className={labelClass}>
                          Transaction ID
                        </label>
                        <div className="relative">
                          <Hash className={iconInField} />
                          <input
                            id="transactionId"
                            type="text"
                            inputMode="text"
                            autoComplete="off"
                            autoCapitalize="characters"
                            spellCheck={false}
                            required
                            maxLength={rule?.length}
                            value={transactionId}
                            onChange={(e) => changeTransactionId(e.target.value)}
                            placeholder={rule?.placeholder}
                            className={`${inputBase} pr-10 font-mono tracking-wider`}
                          />
                          {idValid && transactionId.length > 0 && (
                            <Check className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
                          )}
                        </div>
                        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                          {rule?.help} ({transactionId.length}/{rule?.length})
                        </p>
                        {fieldErrors.transactionId && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.transactionId}</p>
                        )}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="firstName" className={labelClass}>
                            First name
                          </label>
                          <div className="relative">
                            <User className={iconInField} />
                            <input
                              id="firstName"
                              type="text"
                              autoComplete="given-name"
                              required
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              placeholder="First name"
                              className={`${inputBase} pr-3`}
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="lastName" className={labelClass}>
                            Last name
                          </label>
                          <div className="relative">
                            <User className={iconInField} />
                            <input
                              id="lastName"
                              type="text"
                              autoComplete="family-name"
                              required
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              placeholder="Last name"
                              className={`${inputBase} pr-3`}
                            />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        Type the name of the {option.method === "cbe" ? "CBE" : "Telebirr"} account you sent the money
                        from, exactly as it appears on your receipt.
                      </p>
                      {fieldErrors.payerName && (
                        <p className="text-sm text-red-600 dark:text-red-400">{fieldErrors.payerName}</p>
                      )}
                    </div>
                  </div>
                )}

                {option.method === "cod" && (
                  <div className={`${glass} flex items-start gap-3 p-5`}>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white">
                      <Banknote className="h-5 w-5" />
                    </span>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      Pay <b className="text-slate-800 dark:text-slate-100">{formatPrice(total)}</b> in cash when you
                      collect your order. No transaction ID is needed.
                    </p>
                  </div>
                )}

                <p className="rounded-xl bg-white/50 p-3 text-sm leading-relaxed text-slate-600 ring-1 ring-white/70 backdrop-blur dark:bg-slate-800/50 dark:text-slate-400 dark:ring-slate-700">
                  Collect at: <b className="text-slate-800 dark:text-slate-200">{PICKUP_ADDRESS}</b>. Bring your pickup
                  code and a physical student ID or national ID.
                </p>
              </section>

              <aside className={`${glass} h-fit space-y-4 p-4 sm:p-6 lg:sticky lg:top-24`}>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Your order</h2>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {items.map(({ product, quantity }) => (
                    <li key={product.id} className="flex justify-between gap-3">
                      <span className="min-w-0 truncate">
                        <span className="font-semibold text-slate-800 dark:text-slate-100">{quantity} ×</span>{" "}
                        {product.name}
                      </span>
                      <span className="shrink-0 font-medium">{formatPrice(product.price * quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between border-t border-slate-200/80 pt-4 dark:border-slate-700">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Total</span>
                  <span className="text-2xl font-extrabold text-teal-700 dark:text-teal-400">{formatPrice(total)}</span>
                </div>

                <FormError message={error} />

                {blocked ? (
                  <Link
                    to="/cart"
                    className="block rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600 ring-1 ring-red-200 hover:underline dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30"
                  >
                    Some items are no longer available. Update your cart.
                  </Link>
                ) : (
                  <>
                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-3.5 font-semibold text-white shadow-md shadow-teal-900/20 transition hover:from-teal-700 hover:to-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-none disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none dark:focus-visible:ring-offset-slate-800 dark:disabled:bg-slate-700 dark:disabled:text-slate-500"
                    >
                      <Check className="h-4 w-4" />
                      {placing ? "Placing order..." : "Place order"}
                    </button>
                    {!canSubmit && !placing && option.method !== "cod" && (
                      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                        Fill in the transaction ID and your first and last name to continue.
                      </p>
                    )}
                  </>
                )}

                <div className="space-y-1.5 border-t border-slate-200/80 pt-4 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  <p className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    Every payment is checked before pickup
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    We never ask for your PIN or password
                  </p>
                </div>
              </aside>
            </form>
          )}
        </main>
      </div>
    </div>
  )
}

export default CheckoutPage