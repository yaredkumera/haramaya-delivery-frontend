import { useState } from "react"
import toast from "react-hot-toast"
import { Search } from "lucide-react"
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

const button = "rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-50"

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
    <li className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-lg font-bold tracking-widest text-slate-900">{order.pickupCode}</span>
        <div className="flex items-center gap-2">
          <PaymentBadge status={order.paymentStatus} />
          <span className="text-xs font-medium text-slate-500">{orderStatusLabels[order.status]}</span>
        </div>
      </div>

      <div className="text-sm text-slate-600">
        <p className="font-semibold text-slate-800">{order.customer.fullName}</p>
        <p>{order.customer.phone} · {order.customer.email}</p>
        <p className="text-xs text-slate-400">{formatDate(order.createdAt)}</p>
      </div>

      <ul className="text-sm text-slate-600">
        {order.items.map((item) => (
          <li key={item.productId}>{item.quantity} × {item.name} <span className="text-slate-400">({formatPrice(item.price)})</span></li>
        ))}
      </ul>

      <div className="rounded-xl bg-slate-50 p-3 text-sm">
        <p className="font-semibold text-slate-800">{paymentMethodLabels[order.paymentMethod]} · {formatPrice(order.total)}</p>
        {order.transactionId && (
          <>
            <p className="text-slate-600">Transaction: <span className="font-mono">{order.transactionId}</span></p>
            <p className="text-slate-600">Name typed by customer: <b>{order.payerName}</b></p>
          </>
        )}
      </div>

      {order.reviewNotes.length > 0 && (
        <ul className="list-disc space-y-1 rounded-xl bg-amber-50 p-3 pl-7 text-xs text-amber-800">
          {order.reviewNotes.map((note) => <li key={note}>{note}</li>)}
        </ul>
      )}

      {rejecting ? (
        <div className="flex gap-2">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (the student does not see it)"
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-teal-600/30 focus:outline-none"
          />
          <button disabled={isLoading || reason.trim().length < 3} onClick={() => run("reject", reason.trim())} className={`${button} bg-red-600 text-white`}>
            Confirm reject
          </button>
          <button onClick={() => setRejecting(false)} className={`${button} bg-slate-100`}>Back</button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {order.paymentStatus === "review" && (
            <>
              <button disabled={isLoading} onClick={() => run("approve")} className={`${button} bg-emerald-600 text-white`}>Approve payment</button>
              <button disabled={isLoading} onClick={() => setRejecting(true)} className={`${button} bg-red-50 text-red-700`}>Reject</button>
            </>
          )}
          {canPrepare && (
            <button disabled={isLoading} onClick={() => run("ready")} className={`${button} bg-teal-700 text-white`}>Mark ready</button>
          )}
          {order.status === "ready_for_pickup" && (
            <button disabled={isLoading} onClick={handOver} className={`${button} bg-teal-700 text-white`}>Hand over</button>
          )}
          {canCancel && (
            <button disabled={isLoading} onClick={cancel} className={`${button} bg-slate-100 text-slate-600`}>Cancel order</button>
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
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-extrabold text-slate-800">Orders</h1>

        <div className="relative mt-4">
          <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by pickup code or transaction ID"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm focus:ring-2 focus:ring-teal-600/20 focus:outline-none"
          />
        </div>

        <div className="my-5 flex gap-2 overflow-x-auto pb-1">
          {tabs.map(({ label }, index) => (
            <button
              key={label}
              onClick={() => { setTab(index); setSearch(""); setPage(1) }}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
                index === tab && !debounced ? "bg-teal-700 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {isLoading && <p className="py-12 text-center text-slate-500">Loading orders...</p>}
        {error && <p className="py-12 text-center text-red-600">{getErrorMessage(error)}</p>}
        {data?.items.length === 0 && <p className="py-12 text-center text-slate-500">No orders here.</p>}

        <ul className={`space-y-4 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
          {data?.items.map((order) => <OrderCard key={order.id} order={order} />)}
        </ul>

        {data && <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />}
      </main>
    </div>
  )
}

export default AdminOrders