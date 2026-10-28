import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
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

  async function run(action: () => Promise<unknown>) {
    setActionError(null)
    try {
      await action()
    } catch (err) {
      setActionError(getErrorMessage(err))
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="rounded-lg bg-white p-2 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Link>
            <h1 className="text-2xl font-extrabold text-slate-800">Your Shopping Cart</h1>
          </div>
          {items.length > 0 && (
            <button
              disabled={busy}
              onClick={() => run(() => clearCart().unwrap())}
              className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
            >
              Clear Cart
            </button>
          )}
        </div>

        {isLoading && <p className="py-16 text-center text-slate-500">Loading your cart...</p>}

        {error && !cart && (
          <div className="py-16 text-center">
            <p className="text-red-600">{getErrorMessage(error)}</p>
            <button onClick={() => refetch()} className="mt-3 text-sm font-semibold text-teal-700 hover:underline">
              Try again
            </button>
          </div>
        )}

        {actionError && (
          <div role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 ring-1 ring-red-200">
            {actionError}
          </div>
        )}

        {cart && items.length === 0 && (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-slate-200">
            <ShoppingBag className="mx-auto h-12 w-12 text-slate-300" />
            <h2 className="mt-4 text-lg font-bold text-slate-800">Your cart is empty</h2>
            <p className="mt-1 text-sm text-slate-500">
              Explore items from Harar and Dire Dawa markets and add them here.
            </p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-xl bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Browse Products
            </Link>
          </div>
        )}

        {cart && items.length > 0 && (
          <div className="grid gap-8 lg:grid-cols-3">
            <ul className="space-y-4 lg:col-span-2">
              {items.map(({ product, quantity }) => (
                <li
                  key={product.id}
                  className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
                >
                  <img
                    src={optimizeImage(product.imageUrl, 160)}
                    alt={product.name}
                    className={`h-20 w-20 rounded-xl object-cover ${product.available ? "" : "opacity-50"}`}
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold text-slate-800">{product.name}</h3>
                    <p className="text-sm font-semibold text-teal-700">{formatPrice(product.price)}</p>
                    {!product.available && (
                      <p className="text-xs font-medium text-red-600">No longer available. Please remove it.</p>
                    )}

                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex items-center rounded-lg border border-slate-200">
                        <button
                          aria-label="Decrease quantity"
                          disabled={busy || quantity <= 1}
                          onClick={() => run(() => updateItem({ productId: product.id, quantity: quantity - 1 }).unwrap())}
                          className="p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-slate-800">{quantity}</span>
                        <button
                          aria-label="Increase quantity"
                          disabled={busy || quantity >= MAX_CART_QUANTITY}
                          onClick={() => run(() => updateItem({ productId: product.id, quantity: quantity + 1 }).unwrap())}
                          className="p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        aria-label={`Remove ${product.name}`}
                        disabled={busy}
                        onClick={() => run(() => removeItem(product.id).unwrap())}
                        className="text-slate-400 transition hover:text-red-600 disabled:opacity-40"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <p className="font-bold text-slate-900">{formatPrice(product.price * quantity)}</p>
                </li>
              ))}
            </ul>

            <div className="h-fit rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-lg font-bold text-slate-800">Order Summary</h3>
              <div className="my-4 space-y-2 border-b border-slate-100 pb-4 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">{formatPrice(cart.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pickup</span>
                  <span className="font-semibold text-slate-800">Free</span>
                </div>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-800">
                <span>Total</span>
                <span className="text-teal-700">{formatPrice(cart.total)}</span>
              </div>
              {hasUnavailable && (
                <p className="mt-3 text-xs text-red-600">Remove unavailable items to continue.</p>
              )}
              <button
                disabled={busy || hasUnavailable}
                onClick={() => navigate("/checkout")}
                className="mt-6 w-full rounded-xl bg-teal-700 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-50"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default CartPage