import { useState } from "react"
import type { SubmitEvent } from "react"
import { Link, useNavigate } from "react-router"
import { Banknote, Check, Copy, Hash, Landmark, Smartphone, User, Zap } from "lucide-react"
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
  const canSubmit = items.length > 0 && !blocked && !placing && idValid && namesValid && (option.method === "cod" || Boolean(payTo))

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

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-base text-slate-800 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <h1 className="text-2xl font-extrabold text-slate-800 sm:text-3xl">Checkout</h1>

        {isLoading && <p className="py-16 text-center text-slate-500">Loading...</p>}

        {cart && items.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-slate-500">Your cart is empty.</p>
            <Link to="/" className="mt-2 inline-block font-semibold text-teal-700 hover:underline">
              Browse products
            </Link>
          </div>
        )}

        {items.length > 0 && (
          <form onSubmit={handleSubmit} className="mt-6 grid gap-6 lg:grid-cols-3 lg:gap-8">
            <section className="min-w-0 space-y-5 lg:col-span-2">
              <fieldset>
                <legend className="mb-3 text-sm font-semibold text-slate-700">1. How will you pay?</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {options.map((o) => {
                    const Icon = o.icon
                    const selected = o.id === optionId
                    return (
                      <label
                        key={o.id}
                        className={`relative cursor-pointer rounded-2xl bg-white p-4 ring-1 transition ${
                          selected ? "ring-2 ring-teal-600" : "ring-slate-200 hover:bg-slate-50"
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
                          <Icon className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800">{o.title}</p>
                            <p className="mt-1 text-xs text-slate-500">{o.hint}</p>
                            {o.badge && (
                              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-teal-100 px-2.5 py-1 text-xs font-semibold text-teal-800">
                                <Zap className="h-3.5 w-3.5" />
                                {o.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </fieldset>

              {option.method !== "cod" && (
                <div className="space-y-5 rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:p-5">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">2. Send the money</p>
                    <div className="mt-3 rounded-xl bg-teal-50 p-4 text-sm text-teal-900">
                      <p>
                        Send exactly <b>{formatPrice(total)}</b> to this {option.payTo === "cbe" ? "CBE account" : "Telebirr number"}:
                      </p>
                      {payTo ? (
                        <>
                          <p className="mt-2 text-xs uppercase tracking-wide text-teal-700">Account holder</p>
                          <p className="font-semibold">{tidy(payTo.name)}</p>
                          <p className="mt-2 text-xs uppercase tracking-wide text-teal-700">
                            {option.payTo === "cbe" ? "Account number" : "Phone number"}
                          </p>
                          <div className="flex flex-wrap items-center gap-3">
                            <p className="break-all font-mono text-lg font-semibold">{tidy(payTo.number)}</p>
                            <button
                              type="button"
                              onClick={copyNumber}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-teal-800 ring-1 ring-teal-200 hover:bg-teal-100"
                            >
                              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                              {copied ? "Copied" : "Copy"}
                            </button>
                          </div>
                        </>
                      ) : (
                        <p className="mt-2 text-teal-700">Loading account details...</p>
                      )}
                    </div>
                    <p className="mt-3 text-xs text-slate-500">{option.speed}</p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-slate-700">3. Enter your payment details</p>

                    <div>
                      <label htmlFor="transactionId" className="mb-1 block text-sm font-medium text-slate-700">
                        Transaction ID
                      </label>
                      <div className="relative">
                        <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
                          className={`${inputClass} font-mono tracking-wider`}
                        />
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {rule?.help} ({transactionId.length}/{rule?.length})
                      </p>
                      {fieldErrors.transactionId && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.transactionId}</p>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-slate-700">
                          First name
                        </label>
                        <div className="relative">
                          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            id="firstName"
                            type="text"
                            autoComplete="given-name"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="First name"
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-slate-700">
                          Last name
                        </label>
                        <div className="relative">
                          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            id="lastName"
                            type="text"
                            autoComplete="family-name"
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Last name"
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>
                    <p className="-mt-2 text-xs text-slate-500">
                      Type the name of the {option.method === "cbe" ? "CBE" : "Telebirr"} account you sent the money from, exactly as
                      it appears on your receipt.
                    </p>
                    {fieldErrors.payerName && <p className="text-sm text-red-600">{fieldErrors.payerName}</p>}
                  </div>
                </div>
              )}

              {option.method === "cod" && (
                <p className="rounded-2xl bg-white p-5 text-sm text-slate-600 ring-1 ring-slate-200">
                  Pay <b>{formatPrice(total)}</b> in cash when you collect your order.
                </p>
              )}

              <p className="text-sm text-slate-500">
                Collect at: <b className="text-slate-700">{PICKUP_ADDRESS}</b>. Bring your pickup code and a
                physical student ID or national ID.
              </p>
            </section>

            <aside className="h-fit space-y-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:p-5 lg:sticky lg:top-6">
              <h2 className="font-bold text-slate-800">Your order</h2>
              <ul className="space-y-1 text-sm text-slate-600">
                {items.map(({ product, quantity }) => (
                  <li key={product.id} className="flex justify-between gap-2">
                    <span className="min-w-0 truncate">
                      {quantity} × {product.name}
                    </span>
                    <span className="shrink-0">{formatPrice(product.price * quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between border-t border-slate-100 pt-3 font-bold text-slate-800">
                <span>Total</span>
                <span className="text-teal-700">{formatPrice(total)}</span>
              </div>

              <FormError message={error} />

              {blocked ? (
                <Link to="/cart" className="block text-sm font-medium text-red-600 hover:underline">
                  Some items are no longer available. Update your cart.
                </Link>
              ) : (
                <>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                  >
                    <Check className="h-4 w-4" />
                    {placing ? "Placing order..." : "Place order"}
                  </button>
                  {!canSubmit && !placing && option.method !== "cod" && (
                    <p className="text-center text-xs text-slate-500">
                      Fill in the transaction ID and your first and last name to continue.
                    </p>
                  )}
                </>
              )}
            </aside>
          </form>
        )}
      </main>
    </div>
  )
}

export default CheckoutPage