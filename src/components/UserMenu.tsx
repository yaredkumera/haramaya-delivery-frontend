import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router"
import { LayoutDashboard, LogIn, LogOut, Package, UserCog } from "lucide-react"
import Avatar from "./Avatar"
import { api } from "../services/api"
import { logout } from "../context/authSlice"
import { useAppDispatch, useAppSelector } from "../context/hooks"

const item =
  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"

function UserMenu() {
  const user = useAppSelector((s) => s.auth.user)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onPointer)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  if (!user) {
    return (
      <Link
        to="/login"
        className="flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800"
      >
        <LogIn className="h-4 w-4" />
        Sign in
      </Link>
    )
  }

  function logOut() {
    dispatch(logout())
    dispatch(api.util.resetApiState())
    setOpen(false)
    navigate("/")
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="rounded-full ring-2 ring-transparent transition hover:ring-teal-500 focus:outline-none focus-visible:ring-teal-500"
      >
        <Avatar name={user.fullName} url={user.avatarUrl} size={36} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-60 rounded-2xl bg-white p-2 shadow-lg ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
        >
          <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-700">
            <p className="truncate font-semibold text-slate-800 dark:text-slate-100">{user.fullName}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
          </div>
          <div className="mt-1 space-y-0.5">
            <Link to="/account" onClick={() => setOpen(false)} className={item}>
              <UserCog className="h-4 w-4" /> My account
            </Link>
            <Link to="/orders" onClick={() => setOpen(false)} className={item}>
              <Package className="h-4 w-4" /> My orders
            </Link>
            {user.role === "admin" && (
              <Link to="/admin" onClick={() => setOpen(false)} className={item}>
                <LayoutDashboard className="h-4 w-4" /> Admin dashboard
              </Link>
            )}
            <button type="button" onClick={logOut} className={item}>
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserMenu