import { useState } from "react"
import type { SubmitEvent } from "react"
import { useNavigate, useParams } from "react-router"
import { ScanLine } from "lucide-react"
import toast from "react-hot-toast"
import Header from "../components/Header"
import { PaymentBadge } from "../components/StatusBadge"
import { useAdminOrderActionMutation, useGetOrderByPickupCodeQuery } from "../services/api"
import { getErrorMessage } from "../utils/apiError"
import { formatDate, formatPrice } from "../utils/format"
import type { AdminOrder } from "../types"

type PickupState = { tone: string; text: string; canReady?: boolean; canHandOver?: boolean }

function pickupState(order: AdminOrder): PickupState {
  const cod = order.paymentMethod === "cod"

  if (order.status === "collected") {
    const when = order.collectedAt ? ` on ${formatDate(order.collectedAt)}` : ""
    return { tone: "bg-slate-100 text-slate-700", text: `Already collected${when}. Do not hand over again.` }
  }
  if (order.status === "cancelled") return { tone: "bg-red-50 text-red-700", text: "This order was cancelled. Do not hand over." }
  if (order.paymentStatus !== "paid" && !cod) {
    return { tone: "bg-amber-50 text-amber-800", text: "Payment is not verified yet. Do not hand over." }
  }
  if (order.status === "placed") {
    return { tone: "bg-sky-50 text-sky-800", text: "Payment is fine, but the order is not marked ready yet.", canReady: true }
  }
  return {
    tone: "bg-emerald-50 text-emerald-800",
    text: cod ? `Ready. Collect ${formatPrice(order.total)} in cash.` : "Payment verified and the order is ready.",
    canHandOver: true,
  }
}

function CodeForm() {
  const navigate = useNavigate()
  const [code, setCode] = useState("")

  function submit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (code.trim()) navigate(`/admin/pickup/${code.trim().toUpperCase()}`)
  }

  return (
    <form onSubmit={submit} className="mt-6 flex gap-2">
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter the pickup code, or scan the QR with your camera"
        className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm uppercase focus:ring-2 focus:ring-teal-600/20 focus:outline-none"
      />
      <button className="rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white hover:bg-teal-800">Find</button>
    </form>
  )
}

function PickupDetails({ order }: { order: AdminOrder }) {
  const [act, { isLoading }] = useAdminOrderActionMutation()
  const [ticked, setTicked] = useState<Set<string>>(new Set())
  const state = pickupState(order)
  const allTicked = ticked.size === order.items.length

  function toggle(id: string) {
    setTicked((prev) => {
      const next = new Set(prev)
      if (!next.delete(id)) next.add(id)
      return next
    })
  }

  async function run(action: "ready" | "collect") {
    try {
      await act({ id: order.id, action }).unwrap()
      toast.success(action === "collect" ? "Order handed over" : "Marked ready")
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  function handOver() {
    const cash = order.paymentMethod === "cod" ? ` Collect ${formatPrice(order.total)} in cash.` : ""
    if (window.confirm(`Have you checked the physical ID of ${order.customer.fullName}?${cash}`)) run("collect")
  }

  return (
    <div className="mt-6 space-y-4">
      <div className={`rounded-2xl p-4 text-sm font-semibold ${state.tone}`}>{state.text}</div>

      <section className="space-y-3 rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <div className="flex items-center justify-between">
          <span className="font-mono text-2xl font-extrabold tracking-widest">{order.pickupCode}</span>
          <PaymentBadge status={order.paymentStatus} />
        </div>
        <div className="text-sm text-slate-600">
          <p className="text-base font-bold text-slate-900">{order.customer.fullName}</p>
          <p>{order.customer.phone}</p>
          {order.payerName && <p>Name typed for payment: <b>{order.payerName}</b></p>}
          {order.receipt?.payerName && <p>Name on the bank receipt: <b>{order.receipt.payerName}</b></p>}
        </div>
        <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
          Check the <b>physical ID</b>: the name on it must match the customer.
        </p>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <h2 className="mb-3 font-bold text-slate-800">Items ({ticked.size}/{order.items.length} checked)</h2>
        <ul className="space-y-2">
          {order.items.map((item) => (
            <li key={item.productId}>
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input type="checkbox" checked={ticked.has(item.productId)} onChange={() => toggle(item.productId)} className="h-5 w-5" />
                <span className="flex-1">{item.quantity} × {item.name}</span>
              </label>
            </li>
          ))}
        </ul>
        <p className="mt-3 border-t border-slate-100 pt-3 text-right font-bold">{formatPrice(order.total)}</p>
      </section>

      {state.canReady && (
        <button disabled={isLoading} onClick={() => run("ready")} className="w-full rounded-xl bg-sky-700 py-3 text-sm font-semibold text-white disabled:opacity-60">
          Mark ready
        </button>
      )}
      {state.canHandOver && (
        <button disabled={isLoading || !allTicked} onClick={handOver} className="w-full rounded-xl bg-teal-700 py-3 text-sm font-semibold text-white disabled:opacity-50">
          {allTicked ? "Hand over" : "Tick every item to hand over"}
        </button>
      )}
    </div>
  )
}

function PickupPage() {
  const { code } = useParams()
  const { data: order, isLoading, error } = useGetOrderByPickupCodeQuery(code ?? "", { skip: !code })

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto max-w-xl px-4 py-8">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-800">
          <ScanLine className="h-6 w-6 text-teal-700" /> Pickup
        </h1>
        {!code && <CodeForm />}
        {code && isLoading && <p className="py-12 text-center text-slate-500">Looking up the order...</p>}
        {code && error && (
          <>
            <p className="py-6 text-center text-red-600">{getErrorMessage(error)}</p>
            <CodeForm />
          </>
        )}
        {order && <PickupDetails key={order.id} order={order} />}
      </main>
    </div>
  )
}

export default PickupPage