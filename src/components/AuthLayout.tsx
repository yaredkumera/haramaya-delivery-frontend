import type { ReactNode } from "react"
import { ShoppingBag, Wallet, MapPin } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import ThemeToggle from "./ThemeToggle"

const features: { icon: LucideIcon; text: string }[] = [
  { icon: ShoppingBag, text: "Order from Harar and Dire Dawa markets" },
  { icon: Wallet, text: "Pay with Telebirr or CBE Birr" },
  { icon: MapPin, text: "Collect at one easy pickup address near campus" },
]

type AuthLayoutProps = {
  title: string
  subtitle: string
  heroTitle: string
  heroText: string
  children: ReactNode
}

function AuthLayout({ title, subtitle, heroTitle, heroText, children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-teal-50 via-slate-50 to-sky-100 px-4 py-6 sm:p-6 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-teal-300/40 blur-3xl dark:bg-teal-500/10" />
      <div className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-emerald-300/40 blur-3xl dark:bg-emerald-500/10" />
      <div className="pointer-events-none absolute top-1/3 -right-16 h-60 w-60 rounded-full bg-sky-300/30 blur-3xl dark:bg-sky-500/10" />

      <div className="absolute top-3 right-3 z-10 rounded-xl bg-white/70 shadow-sm ring-1 ring-white/70 backdrop-blur sm:top-5 sm:right-5 dark:bg-slate-800/70 dark:ring-slate-700">
        <ThemeToggle />
      </div>

      <div className="relative mt-12 flex w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white/80 shadow-2xl shadow-teal-900/10 ring-1 ring-white/70 backdrop-blur-xl sm:mt-0 lg:max-w-4xl lg:flex-row dark:bg-slate-800/80 dark:shadow-black/30 dark:ring-slate-700">
        {/* Brand panel: compact on phones, a full side panel on large screens. The text is never hidden. */}
        <aside className="bg-gradient-to-br from-teal-700 via-teal-800 to-emerald-900 p-5 text-white sm:p-7 lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-10">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-lg font-bold ring-1 ring-white/30">
              HU
            </span>
            <span className="text-lg font-bold tracking-tight">Haramaya Delivery</span>
          </div>

          <div className="mt-5 space-y-4 lg:mt-0 lg:space-y-6">
            <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl">{heroTitle}</h2>
            <p className="text-sm leading-relaxed text-teal-50/90">{heroText}</p>
            <ul className="space-y-2.5 lg:space-y-4">
              {features.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-teal-50">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/15 text-teal-100 ring-1 ring-white/20">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-5 text-xs text-teal-100/80 lg:mt-0">&copy; {new Date().getFullYear()} Haramaya Delivery</p>
        </aside>

        <main className="w-full p-5 sm:p-8 lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:p-10">
          <header className="mb-6">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 sm:text-3xl dark:text-slate-100">
              {title}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          </header>
          {children}
        </main>
      </div>
    </div>
  )
}

export default AuthLayout