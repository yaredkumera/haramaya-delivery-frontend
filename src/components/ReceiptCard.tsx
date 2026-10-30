import { useRef, useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { toPng } from "html-to-image"
import { Download } from "lucide-react"
import { formatDate, formatPrice } from "../utils/format"
import { PICKUP_ADDRESS } from "../config"
import { paymentMethodLabels } from "../types"
import type { Order, PaymentStatus } from "../types"

const headline: Record<PaymentStatus, { text: string; tone: string }> = {
  paid: { text: "Payment verified", tone: "text-emerald-700" },
  review: { text: "Payment under review", tone: "text-amber-700" },
  unpaid: { text: "Pay on pickup", tone: "text-sky-700" },
  rejected: { text: "Payment rejected", tone: "text-red-700" },
}
const apps = { telebirr: "Telebirr", cbe: "CBE" } as const

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="flex justify-between gap-4 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-800">{value}</dd>
    </div>
  )
}

function ReceiptCard({ order }: { order: Order }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [saving, setSaving] = useState(false)
  const { payment } = order
  const state = headline[order.paymentStatus]
  const digital = order.paymentMethod !== "cod"

  async function download() {
    if (!cardRef.current) return
    setSaving(true)
    try {
      const url = await toPng(cardRef.current, { pixelRatio: 2, backgroundColor: "#ffffff" })
      const link = document.createElement("a")
      link.download = `order-${order.pickupCode}.png`
      link.href = url
      link.click()
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      <div ref={cardRef} className="space-y-4 rounded-2xl bg-white p-6 ring-1 ring-slate-200">
        <p className={`text-center text-xl font-extrabold ${state.tone}`}>{state.text}</p>

        <dl className="space-y-2 border-y border-slate-100 py-4">
          <Row label="Order code" value={order.pickupCode} />
          <Row label="Amount" value={formatPrice(order.total)} />
          <Row label="Reason" value={`Payment for order ${order.pickupCode}`} />
          {digital && <Row label="From" value={payment.payerName} />}
          {digital && (
            <Row label="Paid with" value={payment.receiptSource ? apps[payment.receiptSource] : undefined} />
          )}
          {digital && (
            <Row label="To" value={payment.paidTo ? apps[payment.paidTo] : paymentMethodLabels[order.paymentMethod]} />
          )}
          <Row label="Date" value={payment.paidAt ? formatDate(payment.paidAt) : undefined} />
          <Row label="Transaction ID" value={payment.transactionId} />
          {!digital && <Row label="Payment" value="Cash when you collect" />}
        </dl>

        <ul className="space-y-1 text-sm text-slate-600">
          {order.items.map((item) => (
            <li key={item.productId}>{item.quantity} × {item.name}</li>
          ))}
        </ul>

        <div className="flex flex-col items-center gap-2">
          <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
            <QRCodeSVG value={`${window.location.origin}/admin/pickup/${order.pickupCode}`} size={160} level="M" />
          </div>
          <p className="font-mono text-2xl font-extrabold tracking-widest text-slate-900">{order.pickupCode}</p>
        </div>

        <p className="text-center text-xs text-slate-500">
          Collect at {PICKUP_ADDRESS}. Bring this code and a physical student ID or national ID. A screenshot is not
          proof of payment: we always check our records.
        </p>
      </div>

      <button
        onClick={download}
        disabled={saving}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
      >
        <Download className="h-4 w-4" />
        {saving ? "Preparing..." : "Save as image"}
      </button>
    </section>
  )
}

export default ReceiptCard