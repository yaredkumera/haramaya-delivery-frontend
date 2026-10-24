import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { Trash2, ShoppingBag, ArrowLeft } from "lucide-react"
import Header from "../components/Header"
import { 
  useGetCartQuery, 
  useUpdateCartItemMutation, 
  useRemoveCartItemMutation, 
  useClearCartMutation 
} from "../services/api"
import { getErrorMessage } from "../utils/apiError"

function CartPage() {
  const navigate = useNavigate()
  const { data: cart, isLoading, error, refetch } = useGetCartQuery()
  const [updateItem] = useUpdateCartItemMutation()
  const [removeItem] = useRemoveCartItemMutation()
  const [clearCart] = useClearCartMutation()

  const [actionError, setActionError] = useState<string | null>(null)

  async function handleQuantityChange(productId: string, newQuantity: number) {
    if (newQuantity < 1) return
    try {
      setActionError(null)
      await updateItem({ productId, quantity: newQuantity }).unwrap()
    } catch (err) {
      setActionError(getErrorMessage(err))
    }
  }

  async function handleRemove(productId: string) {
    try {
      setActionError(null)
      await removeItem(productId).unwrap()
    } catch (err) {
      setActionError(getErrorMessage(err))
    }
  }

  async function handleClear() {
    try {
      setActionError(null)
      await clearCart().unwrap()
    } catch (err) {
      setActionError(getErrorMessage(err))
    }
  }

  // Calculate total price
  const subtotal = cart?.items?.reduce((sum, item) => sum + item.product.price * item.quantity, 0) || 0

  return (
    <div className="min-h-screen bg-slate-50">
      <Header search="" onSearch={() => {}} />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="rounded-lg bg-white p-2 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Link>
            <h1 className="text-2xl font-extrabold text-slate-800">Your Shopping Cart</h1>
          </div>
          {cart && cart.items.length > 0 && (
            <button
              onClick={handleClear}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Clear Cart
            </button>
          )}
        </div>

        {isLoading && <p className="py-16 text-center text-slate-500">Loading your cart...</p>}

        {error && (
          <div className="py-16 text-center">
            <p className="text-red-600">{getErrorMessage(error)}</p>
            <button onClick={refetch} className="mt-3 text-sm font-semibold text-teal-700 hover:underline">
              Try again
            </button>
          </div>
        )}

        {actionError && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 ring-1 ring-red-200">
            {actionError}
          </div>
        )}

        {cart && cart.items.length === 0 && (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-slate-200">
            <ShoppingBag className="mx-auto h-12 w-12 text-slate-300" />
            <h2 className="mt-4 text-lg font-bold text-slate-800">Your cart is empty</h2>
            <p className="mt-1 text-sm text-slate-500">Explore items from Harar and Dire Dawa markets and add them here.</p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-xl bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
            >
              Browse Products
            </Link>
          </div>
        )}

        {cart && cart.items.length > 0 && (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {cart.items.map((item) => (
                <div
                  key={ item.product.id}
                  className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
                >
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800">{item.product.name}</h3>
                    <p className="text-sm font-semibold text-teal-700">{item.product.price} ETB</p>
                    
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex items-center rounded-lg border border-slate-200">
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                          className="px-2.5 py-1 text-slate-600 hover:bg-slate-100"
                        >
                          -
                        </button>
                        <span className="px-3 text-sm font-medium text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                          className="px-2.5 py-1 text-slate-600 hover:bg-slate-100"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemove(item.product.id)}
                        className="text-slate-400 transition hover:text-red-600"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 h-fit">
              <h3 className="text-lg font-bold text-slate-800">Order Summary</h3>
              <div className="my-4 space-y-2 border-b border-slate-100 pb-4 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">{subtotal} ETB</span>
                </div>
                <div className="flex justify-between">
                  <span>Pickup Fee</span>
                  <span className="font-semibold text-slate-800">Free</span>
                </div>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-800">
                <span>Total</span>
                <span className="text-teal-700">{subtotal} ETB</span>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="mt-6 w-full rounded-xl bg-teal-700 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
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