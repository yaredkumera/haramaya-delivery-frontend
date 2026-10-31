import { useState } from "react"
import toast from "react-hot-toast"
import { AlertCircle, Ban, CheckCircle2, Inbox, Mail, Phone, RefreshCw, Search, User, XCircle } from "lucide-react"
import Header from "../components/Header"
import Pagination from "../components/Pagination"
import { PaymentBadge } from "../components/StatusBadge"
import { useAdminOrderActionMutation, useGetAdminOrdersQuery } from "../services/api"
import { useDebounce } from "../hooks/useDebounce"
import { getErrorMessage } from "../utils/apiError"
import { formatDate, formatPrice } from "../utils/format"
import { orderStatusLabels, paymentMethodLabels } from "../types"
import type { AdminOrder, AdminOrderQuery, OrderAction } from "../types"

const tabs: { label: string; query: AdminOrderQuery }[] = [
  { label: "Payment review", query: { paymentStatus: "review" } },
  { label: "Placed", query: { status: "placed" } },
  { label: "Ready", query: { status: "ready_for_pickup" } },
  { label: "Collected", query: { status: "collected" } },
  { label: "All", query: {} },
]

const button =
  "inline-flex min-h-10 grow items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:grow-0 dark:focus-visible:ring-offset-slate-800"

const card = "rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"

function OrderCard({ order }: { order: AdminOrder }) {
  const [act, { isLoading }] = useAdminOrderActionMutation()
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState("")

  const canPrepare =
    order.status === "placed" && (order.paymentStatus === "paid" || order.paymentMethod === "cod")
  const canCancel = order.status === "placed" || order.status === "ready_for_pickup"

  async function run(action: OrderAction, text?: string) {
    try {
      await act({ id: order.id, action, reason: text }).unwrap()
      setRejecting(false)
      setReason("")
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  function handOver() {
    const cash = order.paymentMethod === "cod" ? ` Collect ${formatPrice(order.total)} in cash.` : ""
    if (window.confirm(`Have you checked the physical ID of ${order.customer.fullName}?${cash}`)) run("collect")
  }

  function cancel() {
    if (window.confirm("Cancel this order? Refund any money yourself.")) run("cancel")
  }

  return (
    <li className={`${card} space-y-4 p-4 sm:p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Pickup code</p>
          <p className="font-mono text-xl font-extrabold tracking-widest text-slate-900 sm:text-2xl dark:text-slate-100">
            {order.pickupCode}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PaymentBadge status={order.paymentStatus} />
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {orderStatusLabels[order.status]}
          </span>
        </div>
      </div>

      <div className="space-y-1 rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-900/40 dark:text-slate-300">
        <p className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
          <User className="h-4 w-4 shrink-0 text-slate-400" />
          {order.customer.fullName}
        </p>
        <p className="flex items-center gap-2">
          <Phone className="h-4 w-4 shrink-0 text-slate-400" />
          {order.customer.phone}
        </p>
        <p className="flex items-center gap-2 break-all">
          <Mail className="h-4 w-4 shrink-0 text-slate-400" />
          {order.customer.email}
        </p>
        <p className="pt-1 text-xs text-slate-400 dark:text-slate-500">{formatDate(order.createdAt)}</p>
      </div>

      <ul className="divide-y divide-slate-100 text-sm text-slate-600 dark:divide-slate-700 dark:text-slate-300">
        {order.items.map((item) => (
          <li key={item.productId} className="flex items-start justify-between gap-3 py-1.5">
            <span className="min-w-0 break-words">
              <b className="text-slate-800 dark:text-slate-100">{item.quantity} ×</b> {item.name}
            </span>
            <span className="shrink-0 text-slate-400 dark:text-slate-500">({formatPrice(item.price)})</span>
          </li>
        ))}
      </ul>

      <div className="space-y-1 rounded-xl bg-teal-50/70 p-3 text-sm ring-1 ring-teal-100 dark:bg-teal-500/5 dark:ring-teal-500/20">
        <p className="flex flex-wrap items-center justify-between gap-2 font-semibold text-slate-800 dark:text-slate-100">
          <span>{paymentMethodLabels[order.paymentMethod]}</span>
          <span className="text-lg font-extrabold text-teal-700 dark:text-teal-400">{formatPrice(order.total)}</span>
        </p>
        {order.transactionId && (
          <>
            <p className="break-all text-slate-600 dark:text-slate-300">
              Transaction: <span className="font-mono font-semibold">{order.transactionId}</span>
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              Name typed by customer: <b>{order.payerName}</b>
            </p>
          </>
        )}
        {order.receipt && (
          <p className="mt-1 break-words rounded-lg bg-white/70 p-2 text-xs leading-relaxed text-slate-600 dark:bg-slate-900/40 dark:text-slate-300">
            Bank receipt: <b>{order.receipt.payerName}</b> → {order.receipt.receiverName} · {order.receipt.amount} ETB ·{" "}
            {order.receipt.paidAt && formatDate(order.receipt.paidAt)}
            {order.receiptSource && ` · from ${order.receiptSource}`}
            {order.paidTo && ` · to ${order.paidTo}`}
          </p>
        )}
      </div>

      {order.reviewNotes.length > 0 && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <ul className="list-disc space-y-1 pl-4">
            {order.reviewNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      {rejecting ? (
        <div className="flex flex-wrap gap-2">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (the student does not see it)"
            className="min-w-0 flex-1 basis-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 sm:basis-0 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <button
            type="button"
            disabled={isLoading || reason.trim().length < 3}
            onClick={() => run("reject", reason.trim())}
            className={`${button} bg-red-600 text-white hover:bg-red-700`}
          >
            <XCircle className="h-4 w-4" />
            Confirm reject
          </button>
          <button
            type="button"
            onClick={() => setRejecting(false)}
            className={`${button} bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600`}
          >
            Back
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {order.paymentStatus === "review" && (
            <>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => run("recheck")}
                className={`${button} bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600`}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                {isLoading ? "Checking..." : "Re-check receipt"}
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => run("approve")}
                className={`${button} bg-emerald-600 text-white hover:bg-emerald-700`}
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve payment
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setRejecting(true)}
                className={`${button} bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20`}
              >
                <XCircle className="h-4 w-4" />
                Reject
              </button>
            </>
          )}
          {canPrepare && (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => run("ready")}
              className={`${button} bg-teal-700 text-white hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500`}
            >
              Mark ready
            </button>
          )}
          {order.status === "ready_for_pickup" && (
            <button
              type="button"
              disabled={isLoading}
              onClick={handOver}
              className={`${button} bg-teal-700 text-white hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500`}
            >
              Hand over
            </button>
          )}
          {canCancel && (
            <button
              type="button"
              disabled={isLoading}
              onClick={cancel}
              className={`${button} bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600`}
            >
              <Ban className="h-4 w-4" />
              Cancel order
            </button>
          )}
        </div>
      )}
    </li>
  )
}

function AdminOrders() {
  const [tab, setTab] = useState(0)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const debounced = useDebounce(search.trim())

  const query: AdminOrderQuery = { ...(debounced ? { search: debounced } : tabs[tab].query), page }
  const { data, isLoading, isFetching, error } = useGetAdminOrdersQuery(query, { pollingInterval: 30_000 })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 sm:text-3xl dark:text-slate-100">Orders</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Review payments and hand over orders.</p>
          </div>
          {data && (
            <span className="rounded-full bg-teal-100 px-3 py-1 text-sm font-bold text-teal-800 dark:bg-teal-500/15 dark:text-teal-300">
              {data.total}
            </span>
          )}
        </div>

        <div className="relative mt-5">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search by pickup code or transaction ID"
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-10 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-500"
          />
        </div>

        <div className="-mx-4 my-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map(({ label }, index) => {
            const active = index === tab && !debounced
            return (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setTab(index)
                  setSearch("")
                  setPage(1)
                }}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                  active
                    ? "bg-teal-700 text-white shadow-sm dark:bg-teal-600"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-700"
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        {isLoading && (
          <div className="animate-pulse space-y-4" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        )}

        {error && (
          <div className={`${card} p-8 text-center`}>
            <p className="font-medium text-red-600 dark:text-red-400">{getErrorMessage(error)}</p>
          </div>
        )}

        {data?.items.length === 0 && (
          <div className={`${card} p-10 text-center`}>
            <Inbox className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-3 font-semibold text-slate-700 dark:text-slate-100">No orders here</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">New orders will appear automatically.</p>
          </div>
        )}

        <ul className={`space-y-4 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
          {data?.items.map((order) => <OrderCard key={order.id} order={order} />)}
        </ul>

        {data && <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />}
      </main>
    </div>
  )
}

export default AdminOrders