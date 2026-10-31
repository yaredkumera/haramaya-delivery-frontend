import { Check } from "lucide-react"
import { orderStatusLabels, paymentStatusLabels } from "../types"
import type { OrderStatus, PaymentStatus } from "../types"

const tones: Record<PaymentStatus, { badge: string; dot: string }> = {
  unpaid: {
    badge: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30",
    dot: "bg-sky-500",
  },
  review: {
    badge: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30",
    dot: "bg-amber-500",
  },
  paid: {
    badge:
      "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30",
    dot: "bg-emerald-500",
  },
  rejected: {
    badge: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30",
    dot: "bg-red-500",
  },
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const tone = tones[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${tone.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot} ${status === "review" ? "animate-pulse" : ""}`} />
      {paymentStatusLabels[status]}
    </span>
  )
}

const steps = ["placed", "ready_for_pickup", "collected"] as const

export function StatusSteps({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <p className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30">
        Cancelled
      </p>
    )
  }
  const current = steps.indexOf(status)

  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-2 text-xs">
      {steps.map((step, index) => {
        const done = index < current || status === "collected"
        const active = index === current && status !== "collected"
        return (
          <li key={step} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                done
                  ? "bg-teal-600 text-white"
                  : active
                    ? "bg-teal-600 text-white ring-4 ring-teal-600/20"
                    : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
              }`}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
            </span>
            <span
              className={
                index <= current
                  ? "font-semibold text-slate-800 dark:text-slate-100"
                  : "text-slate-400 dark:text-slate-500"
              }
            >
              {orderStatusLabels[step]}
            </span>
            {index < steps.length - 1 && (
              <span
                className={`h-0.5 w-4 rounded sm:w-6 ${
                  index < current ? "bg-teal-500" : "bg-slate-300 dark:bg-slate-600"
                }`}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}