import { Link } from "react-router"
import { Search, LogIn, LogOut, LayoutDashboard } from "lucide-react"
import { api } from "../services/api"
import { logout } from "../context/authSlice"
import { useAppDispatch, useAppSelector } from "../context/hooks"

type HeaderProps = {
  search?: string
  onSearch?: (value: string) => void
}

function Header({ search, onSearch }: HeaderProps) {
  const user = useAppSelector((s) => s.auth.user)
  const dispatch = useAppDispatch()

  function handleLogout() {
    dispatch(logout())
    dispatch(api.util.resetApiState())
  }

  return (
    <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-sm font-bold text-white">
            HU
          </span>
          <span className="hidden text-lg font-bold text-slate-800 sm:inline">
            Haramaya <span className="text-teal-600">Delivery</span>
          </span>
        </Link>

        {onSearch && (
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search ?? ""}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="What are you looking for?"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-sm focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/20 focus:outline-none"
            />
          </div>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {user?.role === "admin" && (
            <Link
              to="/admin/products"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800"
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