import { Navigate, Outlet } from "react-router"
import { useAppSelector } from "../context/hooks"

function RequireAdmin() {
  const role = useAppSelector((s) => s.auth.user?.role)
  return role === "admin" ? <Outlet /> : <Navigate to="/" replace />
}

export default RequireAdmin