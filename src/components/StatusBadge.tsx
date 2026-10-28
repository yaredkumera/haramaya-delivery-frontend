import { orderStatusLabels, paymentStatusLabels } from "../types"
import type { OrderStatus, PaymentStatus } from "../types"

const tones: Record<PaymentStatus, string> = {
  unpaid: "bg-sky-50 text-sky-700",
  review: "bg-amber-50 text-amber-700",
  paid: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tones[status]}`}>
      {paymentStatusLabels[status]}
    </span>
  )
}

const steps = ["placed", "ready_for_pickup", "collected"] as const

export function StatusSteps({ status }: { status: OrderStatus }) {
  if (status === "cancelled") return <p className="text-sm font-medium text-red-600">Cancelled</p>
  const current = steps.indexOf(status)

  return (
    <ol className="flex flex-wrap items-center gap-2 text-xs">
      {steps.map((step, index) => (
        <li key={step} className="flex items-center gap-2">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full font-bold ${
              index <= current ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-500"
            }`}
          >
            {index + 1}
          </span>
          <span className={index <= current ? "font-medium text-slate-800" : "text-slate-400"}>
            {orderStatusLabels[step]}
          </span>
          {index < steps.length - 1 && <span className="h-px w-4 bg-slate-300" />}
        </li>
      ))}
    </ol>
  )
}