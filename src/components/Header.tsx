import { useEffect, useRef, useState } from "react"
import { Link } from "react-router"
import {
  ChevronDown,
  ClipboardList,
  LogIn,
  LogOut,
  Package,
  ScanLine,
  Search,
  ShieldCheck,
  ShoppingCart,
  User,
} from "lucide-react"
import { api } from "../services/api"
import { logout } from "../context/authSlice"
import { useAppDispatch, useAppSelector } from "../context/hooks"
import { useCartCount } from "../hooks/useCartCount"
import ThemeToggle from "./ThemeToggle"

type HeaderProps = {
  search?: string
  onSearch?: (value: string) => void
}

const menuItem =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus-visible:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700 dark:focus-visible:bg-slate-700"

const iconButton =
  "relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:text-slate-300 dark:hover:bg-slate-700"

const adminInline =
  "rounded-lg px-3 py-2 text-sm font-medium text-teal-700 transition hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-500/10"

const adminLinks = [
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
  { to: "/admin/pickup", label: "Pickup", icon: ScanLine },
]

function Header({ search, onSearch }: HeaderProps) {
  const user = useAppSelector((s) => s.auth.user)
  const dispatch = useAppDispatch()
  const cartCount = useCartCount()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const isAdmin = user?.role === "admin"

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("touchstart", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("touchstart", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  function handleLogout() {
    setOpen(false)
    dispatch(logout())
    dispatch(api.util.resetApiState())
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:flex-nowrap sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2" onClick={() => setOpen(false)}>
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
          {isAdmin && (
            <nav className="mr-1 hidden items-center lg:flex" aria-label="Admin">
              {adminLinks.map(({ to, label }) => (
                <Link key={to} to={to} className={adminInline}>
                  {label}
                </Link>
              ))}
            </nav>
          )}

          <ThemeToggle />

          <Link to="/cart" aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ""}`} className={iconButton}>
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-600 px-1 text-xs font-bold text-white ring-2 ring-white dark:ring-slate-900">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-haspopup="menu"
                aria-expanded={open}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Account</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
              </button>

              {open && (
                <div
                  role="menu"
                  className="absolute right-0 z-40 mt-2 w-56 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-800"
                >
                  <Link to="/orders" role="menuitem" className={menuItem} onClick={() => setOpen(false)}>
                    <Package className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    My orders
                  </Link>
                  <Link to="/cart" role="menuitem" className={menuItem} onClick={() => setOpen(false)}>
                    <ShoppingCart className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <span className="flex-1">Cart</span>
                    {cartCount > 0 && (
                      <span className="rounded-full bg-teal-600 px-2 py-0.5 text-xs font-bold text-white">
                        {cartCount}
                      </span>
                    )}
                  </Link>

                  {isAdmin && (
                    <div className="lg:hidden">
                      <div className="my-2 border-t border-slate-100 dark:border-slate-700" />
                      <p className="flex items-center gap-1.5 px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Admin
                      </p>
                      {adminLinks.map(({ to, label, icon: Icon }) => (
                        <Link key={to} to={to} role="menuitem" className={menuItem} onClick={() => setOpen(false)}>
                          <Icon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                          {label}
                        </Link>
                      ))}
                    </div>
                  )}

                  <div className="my-2 border-t border-slate-100 dark:border-slate-700" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 focus:outline-none focus-visible:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 dark:focus-visible:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 rounded-xl bg-teal-700 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:bg-teal-600 dark:hover:bg-teal-500 dark:focus-visible:ring-offset-slate-900"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header