import { useState } from "react"
import { useNavigate } from "react-router"
import Header from "../components/Header"
import ProductCard from "../components/ProductCard"
import { useGetProductsQuery, useAddToCartMutation, useGetCartQuery } from "../services/api"
import { useDebounce } from "../hooks/useDebounce"
import { getErrorMessage } from "../utils/apiError"
import { categories, categoryLabels } from "../types"
import type { Category, Product } from "../types"
import toast from "react-hot-toast"

const chips: (Category | undefined)[] = [undefined, ...categories]

function ProductsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<Category | undefined>(undefined)
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search.trim())

  const { data, isLoading, isFetching, error, refetch } = useGetProductsQuery({
    search: debouncedSearch || undefined,
    category,
    page,
    limit: 12,
  })

  // Fetch cart data to show item count and handle adding
  const { data: cart } = useGetCartQuery()
  const [addToCart, ] = useAddToCartMutation()

  const cartItemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

  function changeSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  function chooseCategory(value: Category | undefined) {
    setCategory(value)
    setPage(1)
  }

  async function handleAddToCart(product: Product) {
    try {
      await addToCart({ productId: product.id, quantity: 1 }).unwrap()
      toast.success(`${product.name} added to cart!`)
    } catch (err: any) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Pass cart item count or let Header fetch it */}
<Header search={search} onSearch={changeSearch} />
      <div className="bg-teal-900 px-4 py-2 text-center text-sm font-medium text-teal-50">
        Harar &amp; Dire Dawa Student Market · Pickup at one address near campus
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">Student Essentials</h1>
            <p className="mt-1 text-slate-500">Daily items from the Harar and Dire Dawa markets.</p>
          </div>
          
          {/* Cart Icon Button at top right of main content if needed */}
          <button
            onClick={() => navigate("/cart")}
            className="relative flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            🛒 Cart
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-teal-700 text-xs text-white font-bold">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>

        <div className="my-6 flex gap-2 overflow-x-auto pb-1">
          {chips.map((chip) => (
            <button
              key={chip ?? "all"}
              onClick={() => chooseCategory(chip)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                chip === category
                  ? "bg-teal-700 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
              }`}
            >
              {chip ? categoryLabels[chip] : "All"}
            </button>
          ))}
        </div>

        {isLoading && <p className="py-16 text-center text-slate-500">Loading products...</p>}

        {error && (
          <div className="py-16 text-center">
            <p className="text-red-600">{getErrorMessage(error)}</p>
            <button onClick={refetch} className="mt-3 text-sm font-semibold text-teal-700 hover:underline">
              Try again
            </button>
          </div>
        )}

        {data && data.items.length === 0 && (
          <p className="py-16 text-center text-slate-500">No products match your search.</p>
        )}

        {data && data.items.length > 0 && (
          <>
            <div
              className={`grid grid-cols-2 gap-4 transition-opacity lg:grid-cols-3 xl:grid-cols-4 ${
                isFetching ? "opacity-60" : ""
              }`}
            >
              {data.items.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAdd={handleAddToCart} 
                />
              ))}
            </div>

            {data.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4 text-sm">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="rounded-lg bg-white px-4 py-2 font-medium ring-1 ring-slate-200 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-slate-500">
                  Page {data.page} of {data.totalPages}
                </span>
                <button
                  disabled={page >= data.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="rounded-lg bg-white px-4 py-2 font-medium ring-1 ring-slate-200 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default ProductsPage