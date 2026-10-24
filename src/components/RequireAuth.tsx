import { useEffect } from "react"
import { Navigate, Outlet } from "react-router"
import { useAppDispatch, useAppSelector } from "../context/hooks"
import { logout } from "../context/authSlice"
import { useMeQuery } from "../services/api"

function RequireAuth() {
  const token = useAppSelector((s) => s.auth.token)
  const dispatch = useAppDispatch()
  const { error, isLoading } = useMeQuery(undefined, { skip: !token })

  const unauthorized =
    typeof error === "object" && error !== null && "status" in error && error.status === 401

  useEffect(() => {
    if (unauthorized) dispatch(logout())
  }, [unauthorized, dispatch])

  if (!token) return <Navigate to="/login" replace />
  if (isLoading) return <p className="p-6 text-sm text-slate-500">Checking your session...</p>

  return <Outlet />
}

export default RequireAuth