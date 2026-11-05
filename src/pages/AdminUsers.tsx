import { useState } from "react"
import toast from "react-hot-toast"
import { Ban, Search, ShieldCheck, Trash2, UserCheck,Link2 } from "lucide-react"
import Pagination from "../components/Pagination"
import {
  useAdminUserActionMutation,
  useDeleteAdminUserMutation,
  useGetAdminUsersQuery,
} from "../services/api"
import { useCreateResetLinkMutation } from "../services/api"
import { useDebounce } from "../hooks/useDebounce"
import { getErrorMessage } from "../utils/apiError"
import { formatDate } from "../utils/format"
import type { AdminUser, UserFilter } from "../types"

const filters: { label: string; value: UserFilter }[] = [
  { label: "All", value: "all" },
  { label: "Students", value: "students" },
  { label: "Blocked", value: "blocked" },
  { label: "Admins", value: "admins" },
]

const button =
  "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:opacity-50"

function UserCard({ user }: { user: AdminUser }) {
  const [act, { isLoading: acting }] = useAdminUserActionMutation()
  const [remove, { isLoading: removing }] = useDeleteAdminUserMutation()
  const busy = acting || removing
  const isStudent = user.role === "student"
const [makeLink, { isLoading: linking }] = useCreateResetLinkMutation()
const [link, setLink] = useState<string | null>(null)

async function createLink() {
  try {
    setLink(await makeLink(user.id).unwrap())
  } catch (err) {
    toast.error(getErrorMessage(err))
  }
}
  async function run(action: () => Promise<unknown>) {
    try {
      await action()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  function toggleBlock() {
    const verb = user.blocked ? "Unblock" : "Block"
    if (window.confirm(`${verb} ${user.fullName}?`)) {
      run(() => act({ id: user.id, action: user.blocked ? "unblock" : "block" }).unwrap())
    }
  }

  function deleteUser() {
    if (window.confirm(`Delete ${user.fullName}? This cannot be undone.`)) {
      run(() => remove(user.id).unwrap())
    }
  }

  return (
    <li className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
      <div className="min-w-0 flex-1 basis-56">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-slate-800 dark:text-slate-100">{user.fullName}</p>
          {!isStudent && (
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-800 dark:bg-teal-500/15 dark:text-teal-300">
              <ShieldCheck className="h-3 w-3" /> Admin
            </span>
          )}
          {user.blocked && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-300">
              Blocked
            </span>
          )}
        </div>
        <p className="break-all text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {user.phone?? "No phone"} · joined {formatDate(user.createdAt)}
        </p>
      </div>

      {isStudent && (
        <div className="flex gap-2">
          <button type="button" disabled={busy || linking} onClick={createLink} className={`${button} bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200`}>
  <Link2 className="h-4 w-4" />
  Reset link
</button>
          <button
            type="button"
            disabled={busy}
            onClick={toggleBlock}
            className={`${button} ${
              user.blocked
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-500/15 dark:text-amber-300"
            }`}
          >
            {user.blocked ? <UserCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
            {user.blocked ? "Unblock" : "Block"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={deleteUser}
            className={`${button} bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-500/15 dark:text-red-300`}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}
      {link && (
  <div className="flex basis-full items-center gap-2 rounded-xl bg-slate-50 p-2 dark:bg-slate-900/40">
    <input readOnly value={link} onFocus={(e) => e.target.select()} className="min-w-0 flex-1 bg-transparent px-2 text-xs text-slate-700 dark:text-slate-200" />
    <button type="button" className={`${button} bg-teal-700 text-white`} onClick={() => navigator.clipboard.writeText(link).then(() => toast.success("Link copied"))}>Copy</button>
  </div>
)}
    </li>
  )
}

function AdminUsers() {
  const [filter, setFilter] = useState<UserFilter>("all")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const debounced = useDebounce(search.trim())

  const { data, isLoading, isFetching, error } = useGetAdminUsersQuery({
    filter,
    search: debounced || undefined,
    page,
  })

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-10">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 sm:text-3xl dark:text-slate-100">Users</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Block a student to stop them ordering. Delete only works for users with no orders.
          </p>
        </div>
        {data && (
          <span className="rounded-full bg-teal-100 px-3 py-1 text-sm font-bold text-teal-800 dark:bg-teal-500/15 dark:text-teal-300">
            {data.total}
          </span>
        )}
      </div>

      <div className="relative mt-5">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="Search by name, email or phone"
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-10 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>

      <div className="my-5 flex gap-2 overflow-x-auto pb-1">
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => {
              setFilter(item.value)
              setPage(1)
            }}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              item.value === filter
                ? "bg-teal-700 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isLoading && <p className="py-12 text-center text-slate-500">Loading users...</p>}
      {error && <p className="py-12 text-center text-red-600">{getErrorMessage(error)}</p>}
      {data?.items.length === 0 && <p className="py-12 text-center text-slate-500">No users found.</p>}

      <ul className={`space-y-3 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
        {data?.items.map((user) => <UserCard key={user.id} user={user} />)}
      </ul>

      {data && <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />}
    </main>
  )
}

export default AdminUsers