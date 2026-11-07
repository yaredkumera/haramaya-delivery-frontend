import { Link } from "react-router"
import { Search, ShoppingCart } from "lucide-react"
import { useCartCount } from "../hooks/useCartCount"
import ThemeToggle from "./ThemeToggle"
import UserMenu from "./UserMenu"

type HeaderProps = {
  search?: string
  onSearch?: (value: string) => void
}

const iconButton =
  "relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:text-slate-300 dark:hover:bg-slate-700"

function Header({ search, onSearch }: HeaderProps) {
  const cartCount = useCartCount()

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:flex-nowrap sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-sm font-bold text-white shadow-sm">
            HU
          </span>
          <span className="hidden text-lg font-bold text-slate-800 sm:inline dark:text-slate-100">
            Haramaya <span className="text-teal-600 dark:text-teal-400">Delivery</span>
          </span>
        </Link>

        {onSearch && (
          <div className="relative order-last w-full sm:order-none sm:w-auto sm:flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search ?? ""}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="What are you looking for?"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-teal-500 dark:focus:bg-slate-800"
            />
          </div>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <ThemeToggle />

          <Link to="/cart" aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ""}`} className={iconButton}>
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-600 px-1 text-xs font-bold text-white ring-2 ring-white dark:ring-slate-900">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* User Menu component placed at the far right */}
          <UserMenu />
        </div>
      </div>
    </header>
  )
}

export default Header