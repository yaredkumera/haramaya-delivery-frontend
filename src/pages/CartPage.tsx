import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { AlertCircle, ArrowLeft, Minus, Plus, RefreshCw, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react"
import Header from "../components/Header"
import {
  useClearCartMutation,
  useGetCartQuery,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from "../services/api"
import { getErrorMessage } from "../utils/apiError"
import { formatPrice, optimizeImage } from "../utils/format"
import { MAX_CART_QUANTITY } from "../types"

const card = "rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"

const stepButton =
  "flex h-9 w-9 items-center justify-center text-slate-600 transition hover:bg-slate-100 focus:outline-none focus-visible:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-700 dark:focus-visible:bg-slate-700"

function CartPage() {
  const navigate = useNavigate()
  const { data: cart, isLoading, error, refetch } = useGetCartQuery()
  const [updateItem, { isLoading: updating }] = useUpdateCartItemMutation()
  const [removeItem, { isLoading: removing }] = useRemoveCartItemMutation()
  const [clearCart, { isLoading: clearing }] = useClearCartMutation()
  const [actionError, setActionError] = useState<string | null>(null)

  const busy = updating || removing || clearing
  const items = cart?.items ?? []
  const hasUnavailable = items.some((item) => !item.product.available)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  async function run(action: () => Promise<unknown>) {
    setActionError(null)
    try {
      await action()
    } catch (err) {
      setActionError(getErrorMessage(err))
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/"
              aria-label="Back to products"
              className="shrink-0 rounded-xl bg-white p-2 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-slate-800 dark:ring-slate-700 dark:hover:bg-slate-700"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-extrabold text-slate-800 sm:text-3xl dark:text-slate-100">
                Your Shopping Cart
              </h1>
              {items.length > 0 && (
                <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </p>
              )}
            </div>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => clearCart().unwrap())}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Clear Cart</span>
              <span className="sm:hidden">Clear</span>
            </button>
          )}
        </div>

        {isLoading && (
          <div className="animate-pulse space-y-4" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        )}

        {error && !cart && (
          <div className={`${card} mx-auto max-w-md p-8 text-center`}>
            <p className="font-medium text-red-600 dark:text-red-400">{getErrorMessage(error)}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        )}

        {actionError && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {cart && items.length === 0 && (
          <div className={`${card} mx-auto max-w-lg p-8 text-center sm:p-12`}>
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-500/10">
              <ShoppingBag className="h-10 w-10 text-teal-600 dark:text-teal-400" />
            </span>
            <h2 className="mt-5 text-lg font-bold text-slate-800 dark:text-slate-100">Your cart is empty</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Explore items from Harar and Dire Dawa markets and add them here.
            </p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500"
            >
              Browse Products
            </Link>
          </div>
        )}

        {cart && items.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
            <ul className="space-y-3 sm:space-y-4 lg:col-span-2">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className={`${card} flex gap-3 p-3 sm:gap-4 sm:p-4`}>
                  <img
                    src={optimizeImage(product.imageUrl, 160)}
                    alt={product.name}
                    className={`h-20 w-20 shrink-0 rounded-xl bg-slate-100 object-cover sm:h-24 sm:w-24 dark:bg-slate-700 ${
                      product.available ? "" : "opacity-50"
                    }`}
                  />

                  <div className="flex min-w-0 flex-1 flex-col">
                    <h3 className="line-clamp-2 font-semibold leading-snug text-slate-800 dark:text-slate-100">
                      {product.name}
                    </h3>
                    <p className="text-sm font-semibold text-teal-700 dark:text-teal-400">
                      {formatPrice(product.price)}
                    </p>
                    {!product.available && (
                      <p className="mt-0.5 text-xs font-medium text-red-600 dark:text-red-400">
                        No longer available. Please remove it.
                      </p>
                    )}

                    <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 pt-3">
                      <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 dark:border-slate-600">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          disabled={busy || quantity <= 1}
                          onClick={() => run(() => updateItem({ productId: product.id, quantity: quantity - 1 }).unwrap())}
                          className={stepButton}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-9 text-center text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          disabled={busy || quantity >= MAX_CART_QUANTITY}
                          onClick={() => run(() => updateItem({ productId: product.id, quantity: quantity + 1 }).unwrap())}
                          className={stepButton}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        aria-label={`Remove ${product.name}`}
                        disabled={busy}
                        onClick={() => run(() => removeItem(product.id).unwrap())}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>

                      <p className="ml-auto font-bold text-slate-900 dark:text-slate-100">
                        {formatPrice(product.price * quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className={`${card} h-fit p-5 sm:p-6 lg:sticky lg:top-24`}>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Order Summary</h3>
              <div className="my-4 space-y-2 border-b border-slate-100 pb-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{formatPrice(cart.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pickup</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Free</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-base font-bold text-slate-800 dark:text-slate-100">
                <span>Total</span>
                <span className="text-xl text-teal-700 dark:text-teal-400">{formatPrice(cart.total)}</span>
              </div>
              {hasUnavailable && (
                <p className="mt-3 text-xs text-red-600 dark:text-red-400">Remove unavailable items to continue.</p>
              )}
              <button
                type="button"
                disabled={busy || hasUnavailable}
                onClick={() => navigate("/checkout")}
                className="mt-5 w-full rounded-xl bg-teal-700 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-teal-600 dark:hover:bg-teal-500 dark:focus-visible:ring-offset-slate-800"
              >
                Proceed to Checkout
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                Every payment is checked before pickup
              </p>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}

export default CartPage