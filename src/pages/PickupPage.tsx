import { useState } from "react"
import type { SubmitEvent } from "react"
import { useNavigate, useParams } from "react-router"
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
  IdCard,
  PackageCheck,
  ScanLine,
  Search,
  XCircle,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import toast from "react-hot-toast"
import Header from "../components/Header"
import { PaymentBadge } from "../components/StatusBadge"
import { useAdminOrderActionMutation, useGetOrderByPickupCodeQuery } from "../services/api"
import { getErrorMessage } from "../utils/apiError"
import { formatDate, formatPrice } from "../utils/format"
import type { AdminOrder } from "../types"

type PickupState = { tone: string; icon: LucideIcon; text: string; canReady?: boolean; canHandOver?: boolean }

const card = "rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"

const tones = {
  slate: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-700/40 dark:text-slate-200 dark:ring-slate-600",
  red: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30",
  amber: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30",
  sky: "bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30",
  green:
    "bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30",
}

function pickupState(order: AdminOrder): PickupState {
  const cod = order.paymentMethod === "cod"

  if (order.status === "collected") {
    const when = order.collectedAt ? ` on ${formatDate(order.collectedAt)}` : ""
    return { tone: tones.slate, icon: Ban, text: `Already collected${when}. Do not hand over again.` }
  }
  if (order.status === "cancelled") {
    return { tone: tones.red, icon: XCircle, text: "This order was cancelled. Do not hand over." }
  }
  if (order.paymentStatus !== "paid" && !cod) {
    return { tone: tones.amber, icon: AlertTriangle, text: "Payment is not verified yet. Do not hand over." }
  }
  if (order.status === "placed") {
    return {
      tone: tones.sky,
      icon: Clock,
      text: "Payment is fine, but the order is not marked ready yet.",
      canReady: true,
    }
  }
  return {
    tone: tones.green,
    icon: CheckCircle2,
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
    <form onSubmit={submit} className={`${card} mt-6 space-y-3 p-4 sm:p-5`}>
      <label htmlFor="pickupCode" className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
        Pickup code
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="pickupCode"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="Enter the code, or scan the QR with your camera"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 font-mono text-sm uppercase tracking-wider text-slate-800 placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-500 dark:focus:bg-slate-900"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-teal-700/20 transition hover:from-teal-700 hover:to-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 active:scale-[0.98] dark:focus-visible:ring-offset-slate-800"
        >
          Find
        </button>
      </div>
    </form>
  )
}

function PickupDetails({ order }: { order: AdminOrder }) {
  const [act, { isLoading }] = useAdminOrderActionMutation()
  const [ticked, setTicked] = useState<Set<string>>(new Set())
  const state = pickupState(order)
  const StateIcon = state.icon
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
    <div className="mt-6 space-y-4 sm:space-y-5">
      <div className={`flex items-start gap-3 rounded-2xl p-4 text-sm font-semibold ring-1 ${state.tone}`}>
        <StateIcon className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="min-w-0 leading-relaxed">{state.text}</p>
      </div>

      <section className={`${card} space-y-4 p-4 sm:p-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Pickup code
            </p>
            <p className="font-mono text-2xl font-extrabold tracking-widest text-slate-900 sm:text-3xl dark:text-slate-100">
              {order.pickupCode}
            </p>
          </div>
          <PaymentBadge status={order.paymentStatus} />
        </div>

        <div className="space-y-1 rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-900/40 dark:text-slate-300">
          <p className="text-base font-bold text-slate-900 dark:text-slate-100">{order.customer.fullName}</p>
          <p>{order.customer.phone}</p>
          {order.payerName && (
            <p>
              Name typed for payment: <b className="text-slate-800 dark:text-slate-100">{order.payerName}</b>
            </p>
          )}
          {order.receipt?.payerName && (
            <p>
              Name on the bank receipt: <b className="text-slate-800 dark:text-slate-100">{order.receipt.payerName}</b>
            </p>
          )}
        </div>

        <p className="flex items-start gap-2.5 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-500/30">
          <IdCard className="mt-0.5 h-5 w-5 shrink-0" />
          <span>
            Check the <b>physical ID</b>: the name on it must match the customer.
          </span>
        </p>
      </section>

      <section className={`${card} p-4 sm:p-5`}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-bold text-slate-800 dark:text-slate-100">Items</h2>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              allTicked
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
                : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
            }`}
          >
            {ticked.size}/{order.items.length} checked
          </span>
        </div>

        <ul className="space-y-2">
          {order.items.map((item) => {
            const checked = ticked.has(item.productId)
            return (
              <li key={item.productId}>
                <label
                  className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm ring-1 transition ${
                    checked
                      ? "bg-emerald-50 ring-emerald-200 dark:bg-emerald-500/10 dark:ring-emerald-500/30"
                      : "bg-slate-50 ring-slate-200 hover:bg-slate-100 dark:bg-slate-900/40 dark:ring-slate-700 dark:hover:bg-slate-900/70"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(item.productId)}
                    className="h-5 w-5 shrink-0 rounded accent-teal-600"
                  />
                  <span
                    className={`min-w-0 flex-1 break-words font-medium ${
                      checked
                        ? "text-emerald-800 line-through decoration-emerald-400 dark:text-emerald-300"
                        : "text-slate-800 dark:text-slate-100"
                    }`}
                  >
                    <b>{item.quantity} ×</b> {item.name}
                  </span>
                </label>
              </li>
            )
          })}
        </ul>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-700">
          <span className="font-semibold text-slate-600 dark:text-slate-300">Total</span>
          <span className="text-xl font-extrabold text-teal-700 dark:text-teal-400">{formatPrice(order.total)}</span>
        </div>
      </section>

      {state.canReady && (
        <button
          type="button"
          disabled={isLoading}
          onClick={() => run("ready")}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-700 py-3.5 text-sm font-semibold text-white shadow-md shadow-sky-900/20 transition hover:bg-sky-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-slate-900"
        >
          <PackageCheck className="h-4 w-4" />
          {isLoading ? "Saving..." : "Mark ready"}
        </button>
      )}
      {state.canHandOver && (
        <button
          type="button"
          disabled={isLoading || !allTicked}
          onClick={handOver}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-teal-700/20 transition hover:from-teal-700 hover:to-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-none disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none dark:focus-visible:ring-offset-slate-900 dark:disabled:bg-slate-700 dark:disabled:text-slate-500"
        >
          <CheckCircle2 className="h-4 w-4" />
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="mx-auto max-w-xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm">
            <ScanLine className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 sm:text-3xl dark:text-slate-100">Pickup</h1>
            <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
              Check the order and the ID, then hand over.
            </p>
          </div>
        </div>

        {!code && <CodeForm />}

        {code && isLoading && (
          <div className="mt-6 animate-pulse space-y-4" aria-hidden="true">
            <div className="h-14 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-56 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          </div>
        )}

        {code && error && (
          <>
            <div className="mt-6 flex items-start gap-2 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="min-w-0 break-words">{getErrorMessage(error)}</p>
            </div>
            <CodeForm />
          </>
        )}

        {order && <PickupDetails key={order.id} order={order} />}
      </main>
    </div>
  )
}

export default PickupPage