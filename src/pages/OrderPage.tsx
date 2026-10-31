import { Link, useParams } from "react-router"
import { ArrowLeft, Banknote, CheckCircle2, Clock, RefreshCw, XCircle } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import Header from "../components/Header"
import { PaymentBadge, StatusSteps } from "../components/StatusBadge"
import { useGetOrderQuery } from "../services/api"
import { getErrorMessage } from "../utils/apiError"
import { formatDate, formatPrice, optimizeImage } from "../utils/format"
import ReceiptCard from "../components/ReceiptCard"
import { paymentMethodLabels } from "../types"
import type { PaymentStatus } from "../types"
import { useEffect, useState } from "react"

type Notice = { tone: string; icon: LucideIcon; text: string }

const notices: Record<PaymentStatus, Notice> = {
  paid: {
    tone: "bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30",
    icon: CheckCircle2,
    text: "Payment verified. We are preparing your order.",
  },
  review: {
    tone: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30",
    icon: Clock,
    text: "We received your payment details and are checking them. The result will appear here.",
  },
  unpaid: {
    tone: "bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30",
    icon: Banknote,
    text: "Pay in cash when you collect your order.",
  },
  rejected: {
    tone: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30",
    icon: XCircle,
    text: "We could not verify your payment, so this order was cancelled. Please place a new order or contact us.",
  },
}

const cancelledNotice: Notice = {
  tone: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-700/40 dark:text-slate-300 dark:ring-slate-600",
  icon: XCircle,
  text: "This order was cancelled.",
}

const card = "rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700 sm:p-6"

function OrderPage() {
  const { id = "" } = useParams()
  const [polling, setPolling] = useState(5000)
  const { data: order, isLoading, isFetching, error, refetch } = useGetOrderQuery(id, { pollingInterval: polling })

  useEffect(() => {
    if (order && order.paymentStatus !== "review") setPolling(0)
  }, [order])

  const cancelledByUs = order?.status === "cancelled" && order.paymentStatus !== "rejected"
  const notice = order ? (cancelledByUs ? cancelledNotice : notices[order.paymentStatus]) : undefined
  const NoticeIcon = notice?.icon

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
        <Link
          to="/orders"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-400"
        >
          <ArrowLeft className="h-4 w-4" />
          My orders
        </Link>

        {isLoading && (
          <div className="animate-pulse space-y-5" aria-hidden="true">
            <div className="h-16 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="mx-auto h-96 max-w-md rounded-3xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          </div>
        )}

        {error && (
          <div className={`${card} text-center`}>
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

        {order && notice && NoticeIcon && (
          <div className="space-y-5 sm:space-y-6">
            <div className={`flex items-start gap-3 rounded-2xl p-4 text-sm font-medium ring-1 ${notice.tone}`}>
              <NoticeIcon className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="min-w-0 flex-1 leading-relaxed">{notice.text}</p>
              {order.paymentStatus === "review" && !cancelledByUs && (
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-white/60 px-2.5 py-1 text-xs font-semibold transition hover:bg-white dark:bg-white/10 dark:hover:bg-white/20"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
                  Check again
                </button>
              )}
            </div>

            <ReceiptCard order={order} />

            <section className={`${card} space-y-5`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <PaymentBadge status={order.paymentStatus} />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {paymentMethodLabels[order.paymentMethod]} · {formatDate(order.createdAt)}
                </span>
              </div>

              <StatusSteps status={order.status} />

              <ul className="divide-y divide-slate-100 border-t border-slate-100 dark:divide-slate-700 dark:border-slate-700">
                {order.items.map((item) => (
                  <li key={item.productId} className="flex items-center gap-3 py-3 text-sm">
                    <img
                      src={optimizeImage(item.imageUrl, 100)}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-xl bg-slate-100 object-cover ring-1 ring-slate-200 dark:bg-slate-700 dark:ring-slate-600"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 font-semibold text-slate-800 dark:text-slate-100">{item.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <span className="shrink-0 font-semibold text-slate-800 dark:text-slate-100">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-700">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Total</span>
                <span className="text-xl font-extrabold text-teal-700 dark:text-teal-400">
                  {formatPrice(order.total)}
                </span>
              </div>
            </section>

            <Link
              to="/orders"
              className="block rounded-xl bg-white py-3 text-center text-sm font-semibold text-teal-700 ring-1 ring-slate-200 transition hover:bg-slate-100 dark:bg-slate-800 dark:text-teal-400 dark:ring-slate-700 dark:hover:bg-slate-700"
            >
              View all my orders
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}

export default OrderPage