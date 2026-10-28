import { useGetCartQuery } from "../services/api"
import { useAppSelector } from "../context/hooks"

export function useCartCount() {
  const token = useAppSelector((s) => s.auth.token)
  const { data } = useGetCartQuery(undefined, { skip: !token })
  return data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
}