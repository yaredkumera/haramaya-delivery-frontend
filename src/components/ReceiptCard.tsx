import { useRef, useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { toPng } from "html-to-image"
import { CheckCircle2, Clock, Download, Banknote, XCircle } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { formatDate, formatPrice } from "../utils/format"
import { PICKUP_ADDRESS } from "../config"
import { paymentMethodLabels } from "../types"
import type { Order, PaymentStatus } from "../types"

const headline: Record<PaymentStatus, { text: string; icon: LucideIcon; band: string }> = {
  paid: { text: "Payment verified", icon: CheckCircle2, band: "from-emerald-600 to-teal-600" },
  review: { text: "Payment under review", icon: Clock, band: "from-amber-500 to-orange-500" },
  unpaid: { text: "Pay on pickup", icon: Banknote, band: "from-sky-600 to-cyan-600" },
  rejected: { text: "Payment rejected", icon: XCircle, band: "from-red-600 to-rose-600" },
}
const apps = { telebirr: "Telebirr", cbe: "CBE" } as const

function ReceiptCard({ order }: { order: Order }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [saving, setSaving] = useState(false)
  const { payment } = order
  const state = headline[order.paymentStatus]
  const StatusIcon = state.icon
  const digital = order.paymentMethod !== "cod"

  async function download() {
    if (!cardRef.current) return
    setSaving(true)
    try {
      const dark = document.documentElement.classList.contains("dark")
      const url = await toPng(cardRef.current, { pixelRatio: 2, backgroundColor: dark ? "#1e293b" : "#ffffff" })
      const link = document.createElement("a")
      link.download = `order-${order.pickupCode}.png`
      link.href = url
      link.click()
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-md">
      <div
        ref={cardRef}
        className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
      >
        {/* Header Status Band */}
        <div className={`bg-gradient-to-br ${state.band} px-5 py-6 text-center text-white sm:px-6`}>
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/20 shadow-inner">
            <StatusIcon className="h-7 w-7" />
          </span>
          <p className="mt-3 text-lg font-bold sm:text-xl">{state.text}</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">{formatPrice(order.total)}</p>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          
          {/* Invoice Table Format (Left-Aligned Clean Structure) */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-900/40">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60">
                <tr>
                  <td className="py-2.5 px-3.5 font-medium text-slate-500 dark:text-slate-400">Order Code</td>
                  <td className="py-2.5 px-3.5 font-mono font-bold text-slate-800 dark:text-slate-100">{order.pickupCode}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3.5 font-medium text-slate-500 dark:text-slate-400">Reason</td>
                  <td className="py-2.5 px-3.5 text-slate-800 dark:text-slate-200">Payment for order {order.pickupCode}</td>
                </tr>
                {digital && payment.payerName && (
                  <tr>
                    <td className="py-2.5 px-3.5 font-medium text-slate-500 dark:text-slate-400">From</td>
                    <td className="py-2.5 px-3.5 font-semibold text-slate-800 dark:text-slate-100">{payment.payerName}</td>
                  </tr>
                )}
                {digital && payment.receiptSource && (
                  <tr>
                    <td className="py-2.5 px-3.5 font-medium text-slate-500 dark:text-slate-400">Paid With</td>
                    <td className="py-2.5 px-3.5 text-slate-800 dark:text-slate-200">{apps[payment.receiptSource]}</td>
                  </tr>
                )}
                {digital && (
                  <tr>
                    <td className="py-2.5 px-3.5 font-medium text-slate-500 dark:text-slate-400">To</td>
                    <td className="py-2.5 px-3.5 text-slate-800 dark:text-slate-200">
                      {payment.paidTo ? apps[payment.paidTo] : paymentMethodLabels[order.paymentMethod]}
                    </td>
                  </tr>
                )}
                {payment.paidAt && (
                  <tr>
                    <td className="py-2.5 px-3.5 font-medium text-slate-500 dark:text-slate-400">Date</td>
                    <td className="py-2.5 px-3.5 text-slate-800 dark:text-slate-200">{formatDate(payment.paidAt)}</td>
                  </tr>
                )}
                {payment.transactionId && (
                  <tr>
                    <td className="py-2.5 px-3.5 font-medium text-slate-500 dark:text-slate-400">Transaction ID</td>
                    <td className="py-2.5 px-3.5 font-mono text-xs font-semibold text-teal-700 dark:text-teal-300 break-all">{payment.transactionId}</td>
                  </tr>
                )}
                {!digital && (
                  <tr>
                    <td className="py-2.5 px-3.5 font-medium text-slate-500 dark:text-slate-400">Payment</td>
                    <td className="py-2.5 px-3.5 text-slate-800 dark:text-slate-200">Cash when you collect</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-dashed border-slate-300 dark:border-slate-700" />

          {/* Purchased Items List */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Ordered Items</p>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              {order.items.map((item) => (
                <li key={item.productId} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0 rounded-md bg-teal-50 px-2 py-0.5 text-xs font-bold text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                      {item.quantity}×
                    </span>
                    <span className="truncate font-medium">{item.name}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-dashed border-slate-300 dark:border-slate-700" />

          {/* QR Code & Pickup Badge */}
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
              <QRCodeSVG
                value={`${window.location.origin}/admin/pickup/${order.pickupCode}`}
                size={150}
                level="M"
                bgColor="#ffffff"
                fgColor="#0f172a"
              />
            </div>
            <p className="text-xs font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Pickup Code
            </p>
            <p className="-mt-1 rounded-2xl bg-teal-50 px-6 py-2.5 font-mono text-2xl font-extrabold tracking-[0.25em] text-teal-800 dark:bg-teal-500/10 dark:text-teal-300 sm:text-3xl shadow-sm">
              {order.pickupCode}
            </p>
          </div>

          <p className="text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Collect at {PICKUP_ADDRESS}. Bring this code and a physical student ID or national ID. Screenshots are never accepted as proof of payment.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={download}
        disabled={saving}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-900/10 transition hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-60 dark:bg-teal-600 dark:hover:bg-teal-500 dark:focus-visible:ring-offset-slate-900"
      >
        <Download className="h-4 w-4" />
        {saving ? "Preparing Image..." : "Save Receipt as Image"}
      </button>
    </section>
  )
}

export default ReceiptCard