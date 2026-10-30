import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { ApiResponse, AuthResult, LoginRequest, RegisterRequest, User ,ProductList,Product,ProductQuery,Cart
  ,Order, AdminOrder, AdminOrderList, AdminOrderQuery, OrderAction, PaymentInfo, CheckoutRequest
} from "../types"
type StateWithAuth = { auth: { token: string | null } }

export const api = createApi({
  reducerPath: "api",
    tagTypes: ["Product","Cart","Order"],
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL||"http://localhost:5000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as StateWithAuth).auth.token
      if (token) headers.set("authorization", `Bearer ${token}`)
      return headers
    },
  }),
  
  endpoints: (build) => ({
    register: build.mutation<AuthResult, RegisterRequest>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
      transformResponse: (response: ApiResponse<AuthResult>) => response.data,
    }),
    login: build.mutation<AuthResult, LoginRequest>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      transformResponse: (response: ApiResponse<AuthResult>) => response.data,
    }),
    me: build.query<User, void>({
      query: () => "/auth/me",
      transformResponse: (response: ApiResponse<{ user: User }>) => response.data.user,
    }),

        getProducts: build.query<ProductList, ProductQuery | void>({
      query: (params) => ({ url: "/products", params: params ?? undefined }),
      transformResponse: (response: ApiResponse<ProductList>) => response.data,
      providesTags: ["Product"],
    }),
    getAdminProducts: build.query<ProductList, ProductQuery | void>({
      query: (params) => ({ url: "/products/admin/all", params: params ?? undefined }),
      transformResponse: (response: ApiResponse<ProductList>) => response.data,
      providesTags: ["Product"],
    }),
    createProduct: build.mutation<Product, FormData>({
      query: (body) => ({ url: "/products", method: "POST", body }),
      transformResponse: (response: ApiResponse<{ product: Product }>) => response.data.product,
      invalidatesTags: ["Product"],
    }),
    updateProduct: build.mutation<Product, { id: string; body: FormData }>({
      query: ({ id, body }) => ({ url: `/products/${id}`, method: "PATCH", body }),
      transformResponse: (response: ApiResponse<{ product: Product }>) => response.data.product,
      invalidatesTags: ["Product"],
    }),
    getCart: build.query<Cart, void>({
      query: () => "/cart",
      transformResponse: (response: ApiResponse<Cart>) => response.data,
      providesTags: ["Cart"],
    }),
    addToCart: build.mutation<Cart, { productId: string; quantity: number }>({
      query: (body) => ({ url: "/cart", method: "POST", body }),
      transformResponse: (response: ApiResponse<Cart>) => response.data,
      invalidatesTags: ["Cart"],
    }),
    updateCartItem: build.mutation<Cart, { productId: string; quantity: number }>({
      query: (body) => ({ url: "/cart", method: "PATCH", body }),
      transformResponse: (response: ApiResponse<Cart>) => response.data,
      invalidatesTags: ["Cart"],
    }),
    removeCartItem: build.mutation<Cart, string>({
      query: (productId) => ({ url: `/cart/item/${productId}`, method: "DELETE" }),
      transformResponse: (response: ApiResponse<Cart>) => response.data,
      invalidatesTags: ["Cart"],
    }),
    clearCart: build.mutation<Cart, void>({
      query: () => ({ url: "/cart", method: "DELETE" }),
      transformResponse: (response: ApiResponse<Cart>) => response.data,
      invalidatesTags: ["Cart"],
    }),
        getPaymentInfo: build.query<PaymentInfo, void>({
      query: () => "/orders/payment-info",
      transformResponse: (response: ApiResponse<PaymentInfo>) => response.data,
    }),
    checkout: build.mutation<Order, CheckoutRequest>({
      query: (body) => ({ url: "/orders", method: "POST", body }),
      transformResponse: (response: ApiResponse<{ order: Order }>) => response.data.order,
      invalidatesTags: ["Order", "Cart"],
    }),
    getMyOrders: build.query<Order[], void>({
      query: () => "/orders",
      transformResponse: (response: ApiResponse<{ orders: Order[] }>) => response.data.orders,
      providesTags: ["Order"],
    }),
    getOrder: build.query<Order, string>({
      query: (id) => `/orders/${id}`,
      transformResponse: (response: ApiResponse<{ order: Order }>) => response.data.order,
      providesTags: ["Order"],
    }),
    getAdminOrders: build.query<AdminOrderList, AdminOrderQuery | void>({
      query: (params) => ({ url: "/admin/orders", params: params ?? undefined }),
      transformResponse: (response: ApiResponse<AdminOrderList>) => response.data,
      providesTags: ["Order"],
    }),
    adminOrderAction: build.mutation<AdminOrder, { id: string; action: OrderAction; reason?: string }>({
      query: ({ id, action, reason }) => ({
        url: `/admin/orders/${id}/${action}`,
        method: "PATCH",
        body: reason ? { reason } : undefined,
      }),
      transformResponse: (response: ApiResponse<{ order: AdminOrder }>) => response.data.order,
      invalidatesTags: ["Order"],
    }),
        getOrderByPickupCode: build.query<AdminOrder, string>({
      query: (code) => `/admin/orders/pickup/${code}`,
      transformResponse: (response: ApiResponse<{ order: AdminOrder }>) => response.data.order,
      providesTags: ["Order"],
    }),
  }),
})

export const {
  useRegisterMutation,
  useLoginMutation,
  useMeQuery,
  useGetProductsQuery,
  useGetAdminProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
  useGetPaymentInfoQuery,
  useCheckoutMutation,
  useGetMyOrdersQuery,
  useGetOrderQuery,
  useGetAdminOrdersQuery,
  useAdminOrderActionMutation,
  useGetOrderByPickupCodeQuery
} = api