import type { ReactNode } from "react"
import { ShoppingBag, Wallet, MapPin } from "lucide-react"
import type { LucideIcon } from "lucide-react"

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 p-4 sm:p-6">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-teal-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-emerald-200/50 blur-3xl" />

      <div className="relative flex w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-100 lg:max-w-4xl lg:flex-row">
        {/* Brand panel: a slim strip on phones, a full side panel on large screens */}
        <aside className="bg-teal-900 px-6 py-5 text-white lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-10">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-lg font-bold">
              HU
            </span>
            <span className="text-lg font-bold tracking-tight">Haramaya Delivery</span>
          </div>

          <div className="hidden space-y-6 lg:block">
            <h2 className="text-3xl font-extrabold leading-tight">{heroTitle}</h2>
            <p className="text-sm leading-relaxed text-teal-100">{heroText}</p>
            <ul className="space-y-4">
              {features.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-teal-100">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-800 text-teal-300">
                    <Icon className="h-4 w-4" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <p className="hidden text-xs text-teal-200 lg:block">
            &copy; {new Date().getFullYear()} Haramaya Delivery
          </p>
        </aside>

        <main className="w-full p-6 sm:p-10 lg:flex lg:w-1/2 lg:flex-col lg:justify-center">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">{title}</h1>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </header>
          {children}
        </main>
      </div>
    </div>
  )
}

export default AuthLayout