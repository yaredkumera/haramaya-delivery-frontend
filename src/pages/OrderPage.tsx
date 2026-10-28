import { Link, useParams } from "react-router"
import Header from "../components/Header"
import { PaymentBadge, StatusSteps } from "../components/StatusBadge"
import { useGetOrderQuery } from "../services/api"
import { getErrorMessage } from "../utils/apiError"
import { formatDate, formatPrice, optimizeImage } from "../utils/format"
import { PICKUP_ADDRESS } from "../config"
import { paymentMethodLabels } from "../types"
import type { PaymentStatus } from "../types"

const notices: Record<PaymentStatus, { tone: string; text: string }> = {
  paid: { tone: "bg-emerald-50 text-emerald-800", text: "Payment verified. We are preparing your order." },
  review: {
    tone: "bg-amber-50 text-amber-800",
    text: "We received your payment details and are checking them. The result will appear here.",
  },
  unpaid: { tone: "bg-sky-50 text-sky-800", text: "Pay in cash when you collect your order." },
  rejected: {
    tone: "bg-red-50 text-red-700",
    text: "We could not verify your payment, so this order was cancelled. Please place a new order or contact us.",
  },
}

function OrderPage() {
  const { id = "" } = useParams()
  const { data: order, isLoading, error, refetch } = useGetOrderQuery(id)

  const notice = order && notices[order.paymentStatus]
  const cancelledByUs = order?.status === "cancelled" && order.paymentStatus !== "rejected"

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        {isLoading && <p className="py-16 text-center text-slate-500">Loading your order...</p>}
        {error && <p className="py-16 text-center text-red-600">{getErrorMessage(error)}</p>}

        {order && notice && (
          <div className="space-y-5">
            <div className={`rounded-2xl p-4 text-sm font-medium ${notice.tone}`}>
              {cancelledByUs ? "This order was cancelled." : notice.text}
              {order.paymentStatus === "review" && (
                <button onClick={() => refetch()} className="ml-2 underline">Check again</button>
              )}
            </div>

            <section className="rounded-2xl bg-white p-6 text-center ring-1 ring-slate-200">
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Your pickup code</p>
              <p className="mt-2 font-mono text-4xl font-extrabold tracking-widest text-slate-900">{order.pickupCode}</p>
              <p className="mt-3 text-sm text-slate-500">
                Collect at <b className="text-slate-700">{PICKUP_ADDRESS}</b>. Bring this code and a physical
                student ID or national ID. You can find the code again in My orders.
              </p>
            </section>

            <section className="space-y-4 rounded-2xl bg-white p-6 ring-1 ring-slate-200">
              <div className="flex items-center justify-between gap-2">
                <PaymentBadge status={order.paymentStatus} />
                <span className="text-xs text-slate-500">
                  {paymentMethodLabels[order.paymentMethod]} · {formatDate(order.createdAt)}
                </span>
              </div>
              <StatusSteps status={order.status} />
              <ul className="space-y-3 border-t border-slate-100 pt-4">
                {order.items.map((item) => (
                  <li key={item.productId} className="flex items-center gap-3 text-sm">
                    <img src={optimizeImage(item.imageUrl, 100)} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <span className="flex-1 truncate">{item.quantity} × {item.name}</span>
                    <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between border-t border-slate-100 pt-3 font-bold text-slate-800">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </section>

            <Link to="/orders" className="block text-center text-sm font-semibold text-teal-700 hover:underline">
              View all my orders
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}

export default OrderPage