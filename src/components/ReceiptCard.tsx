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

function Row({ label, value, mono = false }: { label: string; value?: string; mono?: boolean }) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <dt className="shrink-0 text-slate-500 dark:text-slate-400">{label}</dt>
      <dd
        className={`min-w-0 break-words text-right font-semibold text-slate-800 dark:text-slate-100 ${
          mono ? "break-all font-mono text-xs sm:text-sm" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  )
}

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
      // The saved image matches the theme the customer is looking at
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
        className="overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
      >
        <div className={`bg-gradient-to-br ${state.band} px-5 py-6 text-center text-white sm:px-6`}>
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
            <StatusIcon className="h-7 w-7" />
          </span>
          <p className="mt-3 text-lg font-bold sm:text-xl">{state.text}</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">{formatPrice(order.total)}</p>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <dl className="space-y-3">
            <Row label="Order code" value={order.pickupCode} />
            <Row label="Reason" value={`Payment for order ${order.pickupCode}`} />
            {digital && <Row label="From" value={payment.payerName} />}
            {digital && (
              <Row label="Paid with" value={payment.receiptSource ? apps[payment.receiptSource] : undefined} />
            )}
            {digital && (
              <Row
                label="To"
                value={payment.paidTo ? apps[payment.paidTo] : paymentMethodLabels[order.paymentMethod]}
              />
            )}
            <Row label="Date" value={payment.paidAt ? formatDate(payment.paidAt) : undefined} />
            <Row label="Transaction ID" value={payment.transactionId} mono />
            {!digital && <Row label="Payment" value="Cash when you collect" />}
          </dl>

          <div className="border-t border-dashed border-slate-300 dark:border-slate-600" />

          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {order.items.map((item) => (
              <li key={item.productId} className="flex items-start gap-2">
                <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                  {item.quantity}×
                </span>
                <span className="min-w-0 break-words font-medium">{item.name}</span>
              </li>
            ))}
          </ul>

          <div className="border-t border-dashed border-slate-300 dark:border-slate-600" />

          <div className="flex flex-col items-center gap-3">
            {/* The QR code keeps a white background so scanners can read it in dark mode too */}
            <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
              <QRCodeSVG
                value={`${window.location.origin}/admin/pickup/${order.pickupCode}`}
                size={160}
                level="M"
                bgColor="#ffffff"
                fgColor="#0f172a"
              />
            </div>
            <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Pickup code
            </p>
            <p className="-mt-2 rounded-xl bg-teal-50 px-5 py-2 font-mono text-2xl font-extrabold tracking-[0.3em] text-teal-800 dark:bg-teal-500/10 dark:text-teal-300 sm:text-3xl">
              {order.pickupCode}
            </p>
          </div>

          <p className="text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Collect at {PICKUP_ADDRESS}. Bring this code and a physical student ID or national ID. A screenshot is
            not proof of payment: we always check our records.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={download}
        disabled={saving}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-60 dark:bg-teal-600 dark:hover:bg-teal-500 dark:focus-visible:ring-offset-slate-900"
      >
        <Download className="h-4 w-4" />
        {saving ? "Preparing..." : "Save as image"}
      </button>
    </section>
  )
}

export default ReceiptCard