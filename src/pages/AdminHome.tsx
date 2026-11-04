import { Link } from "react-router"
import { Clock, PackageCheck, Package, ShoppingBag, Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useGetAdminOrdersQuery, useGetAdminProductsQuery, useGetAdminUsersQuery } from "../services/api"

type StatProps = { to: string; label: string; value?: number; icon: LucideIcon; urgent?: boolean }

function Stat({ to, label, value, icon: Icon, urgent }: StatProps) {
  const alert = urgent && (value ?? 0) > 0
  return (
    <Link
      to={to}
      className={`rounded-2xl p-5 shadow-sm ring-1 transition hover:shadow-md ${
        alert
          ? "bg-amber-50 ring-amber-200 dark:bg-amber-500/10 dark:ring-amber-500/30"
          : "bg-white ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
      }`}
    >
      <Icon className="h-5 w-5 text-teal-700 dark:text-teal-400" />
      <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-slate-100">{value ?? "-"}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </Link>
  )
}

function AdminHome() {
  const poll = { pollingInterval: 30_000 }
  const review = useGetAdminOrdersQuery({ paymentStatus: "review", limit: 1 }, poll)
  const placed = useGetAdminOrdersQuery({ status: "placed", limit: 1 }, poll)
  const ready = useGetAdminOrdersQuery({ status: "ready_for_pickup", limit: 1 }, poll)
  const products = useGetAdminProductsQuery({ limit: 1 })
  const users = useGetAdminUsersQuery({ limit: 1 })

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="text-2xl font-extrabold text-slate-800 sm:text-3xl dark:text-slate-100">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">What needs your attention now.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Stat to="/admin/orders" label="Payments to review" value={review.data?.total} icon={Clock} urgent />
        <Stat to="/admin/orders" label="Orders to prepare" value={placed.data?.total} icon={ShoppingBag} />
        <Stat to="/admin/pickup" label="Ready for pickup" value={ready.data?.total} icon={PackageCheck} />
        <Stat to="/admin/products" label="Products" value={products.data?.total} icon={Package} />
        <Stat to="/admin/users" label="Users" value={users.data?.total} icon={Users} />
      </div>
    </main>
  )
}

export default AdminHome