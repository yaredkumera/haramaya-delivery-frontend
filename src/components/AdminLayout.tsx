import { NavLink, Outlet } from "react-router"
import { LayoutDashboard, Package, ScanLine, ShoppingBag, Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import Header from "./Header"

const links: { to: string; label: string; icon: LucideIcon; end?: boolean }[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/pickup", label: "Pickup", icon: ScanLine },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/users", label: "Users", icon: Users },
]

function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />
      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
        <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:w-56 lg:shrink-0 lg:flex-col lg:border-r lg:border-b-0 lg:py-6 dark:border-slate-700 dark:bg-slate-800">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-teal-700 text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminLayout