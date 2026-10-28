import { Link } from "react-router"
import Header from "../components/Header"
import { PaymentBadge, StatusSteps } from "../components/StatusBadge"
import { useGetMyOrdersQuery } from "../services/api"
import { getErrorMessage } from "../utils/apiError"
import { formatDate, formatPrice } from "../utils/format"

function MyOrdersPage() {
  const { data: orders, isLoading, error } = useGetMyOrdersQuery()

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-extrabold text-slate-800">My orders</h1>

        {isLoading && <p className="py-16 text-center text-slate-500">Loading...</p>}
        {error && <p className="py-16 text-center text-red-600">{getErrorMessage(error)}</p>}

        {orders?.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-slate-500">You have no orders yet.</p>
            <Link to="/" className="mt-2 inline-block font-semibold text-teal-700 hover:underline">
              Browse products
            </Link>
          </div>
        )}

        <ul className="mt-6 space-y-4">
          {orders?.map((order) => (
            <li key={order.id}>
              <Link
                to={`/orders/${order.id}`}
                className="block space-y-3 rounded-2xl bg-white p-5 ring-1 ring-slate-200 transition hover:bg-slate-50"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-lg font-bold tracking-widest text-slate-900">{order.pickupCode}</span>
                  <PaymentBadge status={order.paymentStatus} />
                </div>
                <p className="truncate text-sm text-slate-600">
                  {order.items.map((item) => `${item.quantity} × ${item.name}`).join(", ")}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{formatDate(order.createdAt)}</span>
                  <span className="font-bold text-slate-800">{formatPrice(order.total)}</span>
                </div>
                <StatusSteps status={order.status} />
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}

export default MyOrdersPage