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
export type CartItem = {
  product: Product
  quantity: number
}

export type Cart = {
  _id?: string
  id?: string
  user: string
  items: CartItem[]
  createdAt?: string
  updatedAt?: string
}