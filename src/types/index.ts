export type Role = "student" | "admin"

export type User = { id: string; fullName: string; phone: string; email: string; role: Role }
export type AuthResult = { token: string; user: User }

export type LoginRequest = { email: string; password: string }
export type RegisterRequest = { fullName: string; phone: string; email: string; password: string }

export type ApiResponse<T> = { success: true; message?: string; data: T }
export type ApiErrorBody = {
  success: false
  message: string
  errors?: { field: string; message: string }[]
}
export const categories = ["electronics", "personal-care", "study", "dorm", "food"] as const
export type Category = (typeof categories)[number]

export const markets = ["harar", "dire"] as const
export type Market = (typeof markets)[number]

export const categoryLabels: Record<Category, string> = {
  electronics: "Electronics",
  "personal-care": "Personal Care",
  study: "Study",
  dorm: "Dorm",
  food: "Food",
}

export const marketLabels: Record<Market, string> = { harar: "Harar", dire: "Dire Dawa" }

export type Product = {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  category: Category
  market: Market
  badge?: string
  available: boolean
}

export type ProductList = {
  items: Product[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export type ProductQuery = {
  search?: string
  category?: Category
  market?: Market
  sort?: "newest" | "price_asc" | "price_desc"
  page?: number
  limit?: number
}
export const MAX_CART_QUANTITY = 20

export type CartItem = { product: Product; quantity: number }
export type Cart = { items: CartItem[]; total: number }

export const paymentMethods = ["cod", "telebirr", "cbe"] as const
export type PaymentMethod = (typeof paymentMethods)[number]
export const paymentStatuses = ["unpaid", "review", "paid", "rejected"] as const
export type PaymentStatus = (typeof paymentStatuses)[number]
export const orderStatuses = ["placed", "ready_for_pickup", "collected", "cancelled"] as const
export type OrderStatus = (typeof orderStatuses)[number]

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  cod: "Cash on pickup",
  telebirr: "Telebirr",
  cbe: "CBE Birr",
}
export const paymentStatusLabels: Record<PaymentStatus, string> = {
  unpaid: "Pay on pickup",
  review: "Checking payment",
  paid: "Paid",
  rejected: "Payment rejected",
}
export const orderStatusLabels: Record<OrderStatus, string> = {
  placed: "Order placed",
  ready_for_pickup: "Ready for pickup",
  collected: "Collected",
  cancelled: "Cancelled",
}

export type OrderItem = { productId: string; name: string; price: number; imageUrl: string; quantity: number }

export type Order = {
  id: string
  items: OrderItem[]
  total: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  status: OrderStatus
  pickupCode: string
  createdAt: string
  paidAt?: string
  collectedAt?: string
}

export type AdminOrder = Order & {
  customer: { fullName: string; phone: string; email: string }
  transactionId?: string
  payerName?: string
  reviewNotes: string[]
}

export type AdminOrderList = { items: AdminOrder[]; page: number; limit: number; total: number; totalPages: number }
export type AdminOrderQuery = {
  paymentStatus?: PaymentStatus
  status?: OrderStatus
  search?: string
  page?: number
  limit?: number
}
export type OrderAction = "approve" | "reject" | "ready" | "collect" | "cancel"

export type PaymentInfo = Record<"telebirr" | "cbe", { name: string; number: string }>
export type CheckoutRequest =
  | { paymentMethod: "cod" }
  | { paymentMethod: "telebirr" | "cbe"; transactionId: string; payerName: string }