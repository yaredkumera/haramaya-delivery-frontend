import { useState } from "react"
import type { SubmitEvent } from "react"
import { Link, useNavigate } from "react-router"
import { Banknote, Check, Hash, Landmark, Smartphone, User } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import Header from "../components/Header"
import Field from "../components/Field"
import FormError from "../components/FormError"
import SubmitButton from "../components/SubmitButton"
import { useCheckoutMutation, useGetCartQuery, useGetPaymentInfoQuery } from "../services/api"
import { getErrorMessage, getFieldErrors } from "../utils/apiError"
import { formatPrice } from "../utils/format"
import { PICKUP_ADDRESS } from "../config"
import { paymentMethodLabels } from "../types"
import type { CheckoutRequest, PaymentMethod } from "../types"

const methods: { value: PaymentMethod; icon: LucideIcon; hint: string }[] = [
  { value: "telebirr", icon: Smartphone, hint: "Send money, then enter the transaction ID" },
  { value: "cbe", icon: Landmark, hint: "Transfer, then enter the transaction ID" },
  { value: "cod", icon: Banknote, hint: "Pay in cash when you collect" },
]

function CheckoutPage() {
  const navigate = useNavigate()
  const { data: cart, isLoading } = useGetCartQuery()
  const { data: info } = useGetPaymentInfoQuery()
  const [checkout, { isLoading: placing }] = useCheckoutMutation()

  const [method, setMethod] = useState<PaymentMethod>("telebirr")
  const [transactionId, setTransactionId] = useState("")
  const [payerName, setPayerName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const items = cart?.items ?? []
  const total = cart?.total ?? 0
  const blocked = items.some((item) => !item.product.available)
  const payTo = method === "cod" ? undefined : info?.[method]

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    if (method !== "cod" && (!transactionId.trim() || !payerName.trim())) {
      setError("Enter the transaction ID and the name on your account")
      return
    }

    const body: CheckoutRequest =
      method === "cod" ? { paymentMethod: "cod" } : { paymentMethod: method, transactionId, payerName }

    try {
      const order = await checkout(body).unwrap()
      navigate(`/orders/${order.id}`, { replace: true })
    } catch (err) {
      setFieldErrors(getFieldErrors(err))
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-extrabold text-slate-800">Checkout</h1>

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
          <form onSubmit={handleSubmit} className="mt-6 grid gap-8 lg:grid-cols-3">
            <section className="space-y-5 lg:col-span-2">
              <fieldset className="grid gap-3 sm:grid-cols-3">
                <legend className="sr-only">Payment method</legend>
                {methods.map(({ value, icon: Icon, hint }) => (
                  <label
                    key={value}
                    className={`cursor-pointer rounded-2xl bg-white p-4 ring-1 transition ${
                      method === value ? "ring-2 ring-teal-600" : "ring-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="method"
                      value={value}
                      checked={method === value}
                      onChange={() => setMethod(value)}
                      className="sr-only"
                    />
                    <Icon className="h-5 w-5 text-teal-700" />
                    <p className="mt-2 font-semibold text-slate-800">{paymentMethodLabels[value]}</p>
                    <p className="mt-1 text-xs text-slate-500">{hint}</p>
                  </label>
                ))}
              </fieldset>

              {payTo && (
                <div className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                  <div className="rounded-xl bg-teal-50 p-4 text-sm text-teal-900">
                    <p>
                      Send exactly <b>{formatPrice(total)}</b> to:
                    </p>
                    <p className="mt-1 font-semibold">{payTo.name}</p>
                    <p className="font-mono text-base">{payTo.number}</p>
                  </div>
                  <Field
                    id="transactionId"
                    label="Transaction ID"
                    icon={Hash}
                    value={transactionId}
                    onChange={setTransactionId}
                    placeholder="As shown on your receipt"
                    error={fieldErrors.transactionId}
                  />
                  <Field
                    id="payerName"
                    label="Name on your account"
                    icon={User}
                    value={payerName}
                    onChange={setPayerName}
                    placeholder="The name that sent the money"
                    error={fieldErrors.payerName}
                  />
                </div>
              )}

              {method === "cod" && (
                <p className="rounded-2xl bg-white p-5 text-sm text-slate-600 ring-1 ring-slate-200">
                  Pay <b>{formatPrice(total)}</b> in cash when you collect your order.
                </p>
              )}

              <p className="text-sm text-slate-500">
                Collect at: <b className="text-slate-700">{PICKUP_ADDRESS}</b>. Bring your pickup code and a
                physical student ID or national ID.
              </p>
            </section>

            <aside className="h-fit space-y-4 rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h2 className="font-bold text-slate-800">Your order</h2>
              <ul className="space-y-1 text-sm text-slate-600">
                {items.map(({ product, quantity }) => (
                  <li key={product.id} className="flex justify-between gap-2">
                    <span className="truncate">{quantity} × {product.name}</span>
                    <span>{formatPrice(product.price * quantity)}</span>
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
                <SubmitButton loading={placing} loadingText="Placing order..." icon={Check}>
                  Place order
                </SubmitButton>
              )}
            </aside>
          </form>
        )}
      </main>
    </div>
  )
}

export default CheckoutPage