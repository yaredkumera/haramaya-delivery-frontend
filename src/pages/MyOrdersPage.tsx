import { Link } from "react-router"
import { ChevronRight, Package, RefreshCw } from "lucide-react"
import Header from "../components/Header"
import { PaymentBadge, StatusSteps } from "../components/StatusBadge"
import { useGetMyOrdersQuery } from "../services/api"
import { getErrorMessage } from "../utils/apiError"
import { formatDate, formatPrice, optimizeImage } from "../utils/format"

const card = "rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"

function MyOrdersPage() {
  const { data: orders, isLoading, error, refetch } = useGetMyOrdersQuery()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 sm:text-3xl dark:text-slate-100">My orders</h1>
            {orders && orders.length > 0 && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {orders.length} {orders.length === 1 ? "order" : "orders"}
              </p>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="mt-6 animate-pulse space-y-4" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        )}

        {error && (
          <div className={`${card} mt-6 p-8 text-center`}>
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

        {orders?.length === 0 && (
          <div className={`${card} mt-6 p-8 text-center sm:p-12`}>
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-500/10">
              <Package className="h-10 w-10 text-teal-600 dark:text-teal-400" />
            </span>
            <p className="mt-5 font-semibold text-slate-700 dark:text-slate-100">You have no orders yet</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your orders will appear here.</p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500"
            >
              Browse products
            </Link>
          </div>
        )}

        <ul className="mt-6 space-y-4">
          {orders?.map((order) => {
            const shown = order.items.slice(0, 3)
            const extra = order.items.length - shown.length
            return (
              <li key={order.id}>
                <Link
                  to={`/orders/${order.id}`}
                  className={`${card} group block space-y-4 p-4 transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 sm:p-5`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Pickup code
                      </p>
                      <p className="font-mono text-xl font-extrabold tracking-widest text-slate-900 sm:text-2xl dark:text-slate-100">
                        {order.pickupCode}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <PaymentBadge status={order.paymentStatus} />
                      <ChevronRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex shrink-0 -space-x-3">
                      {shown.map((item) => (
                        <img
                          key={item.productId}
                          src={optimizeImage(item.imageUrl, 100)}
                          alt=""
                          className="h-11 w-11 rounded-xl bg-slate-100 object-cover ring-2 ring-white dark:bg-slate-700 dark:ring-slate-800"
                        />
                      ))}
                      {extra > 0 && (
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600 ring-2 ring-white dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-800">
                          +{extra}
                        </span>
                      )}
                    </div>
                    <p className="line-clamp-2 min-w-0 text-sm text-slate-600 dark:text-slate-300">
                      {order.items.map((item) => `${item.quantity} × ${item.name}`).join(", ")}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400">{formatDate(order.createdAt)}</span>
                    <span className="text-lg font-extrabold text-teal-700 dark:text-teal-400">
                      {formatPrice(order.total)}
                    </span>
                  </div>

                  <StatusSteps status={order.status} />
                </Link>
              </li>
            )
          })}
        </ul>
      </main>
    </div>
  )
}

export default MyOrdersPage