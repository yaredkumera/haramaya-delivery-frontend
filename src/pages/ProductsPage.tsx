import { useState } from "react"
import { useNavigate } from "react-router"
import toast from "react-hot-toast"
import { ChevronLeft, ChevronRight, MapPin, RefreshCw, SearchX } from "lucide-react"
import Header from "../components/Header"
import ProductCard from "../components/ProductCard"
import { useAddToCartMutation, useGetProductsQuery } from "../services/api"
import { useAppSelector } from "../context/hooks"
import { useDebounce } from "../hooks/useDebounce"
import { getErrorMessage } from "../utils/apiError"
import { categories, categoryLabels } from "../types"
import type { Category, Product } from "../types"

const chips: (Category | undefined)[] = [undefined, ...categories]

const gridClass = "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4"

const panelClass =
  "mx-auto mt-8 max-w-md rounded-2xl bg-white p-8 text-center ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"

const pagerButton =
  "inline-flex min-h-11 items-center gap-1 rounded-xl bg-white px-4 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700"

function SkeletonGrid() {
  return (
    <div className={gridClass} aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
        >
          <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-700" />
          <div className="space-y-2 p-3 sm:p-4">
            <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ProductsPage() {
  const navigate = useNavigate()
  const token = useAppSelector((s) => s.auth.token)
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
  const [addToCart] = useAddToCartMutation()

  function changeSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  function chooseCategory(value: Category | undefined) {
    setCategory(value)
    setPage(1)
  }

  function changePage(next: number) {
    setPage(next)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function clearFilters() {
    setSearch("")
    setCategory(undefined)
    setPage(1)
  }

  async function handleAddToCart(product: Product) {
    if (!token) {
      navigate("/login")
      return
    }
    try {
      await addToCart({ productId: product.id, quantity: 1 }).unwrap()
      toast.success(`${product.name} added to cart`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const hasFilters = Boolean(debouncedSearch) || category !== undefined

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header search={search} onSearch={changeSearch} />

      <section className="bg-gradient-to-br from-teal-900 via-teal-800 to-teal-700 text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-teal-50 sm:text-sm">
            <MapPin className="h-3.5 w-3.5" />
            Pickup at one address near campus
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Student Essentials</h1>
          <p className="mt-2 max-w-xl text-sm text-teal-50/90 sm:text-base">
            Daily items from the Harar and Dire Dawa markets, delivered to one pickup point for students.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Product categories"
        >
          {chips.map((chip) => {
            const active = chip === category
            return (
              <button
                key={chip ?? "all"}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => chooseCategory(chip)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                  active
                    ? "bg-teal-700 text-white shadow-sm dark:bg-teal-600"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-700"
                }`}
              >
                {chip ? categoryLabels[chip] : "All"}
              </button>
            )
          })}
        </div>

        {data && data.items.length > 0 && (
          <p className="mb-3 mt-2 text-sm text-slate-500 dark:text-slate-400">
            {data.total} {data.total === 1 ? "product" : "products"}
            {debouncedSearch ? ` for “${debouncedSearch}”` : ""}
          </p>
        )}

        {isLoading && (
          <div className="mt-4">
            <SkeletonGrid />
          </div>
        )}

        {error && (
          <div className={panelClass}>
            <p className="font-medium text-red-600 dark:text-red-400">{getErrorMessage(error)}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        )}

        {data && data.items.length === 0 && (
          <div className={panelClass}>
            <SearchX className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-3 font-semibold text-slate-700 dark:text-slate-100">No products match your search</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Try another word or a different category.
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {data && data.items.length > 0 && (
          <>
            <div className={`${gridClass} transition-opacity ${isFetching ? "opacity-60" : ""}`}>
              {data.items.map((product) => (
                <ProductCard key={product.id} product={product} onAdd={handleAddToCart} />
              ))}
            </div>

            {data.totalPages > 1 && (
              <nav className="mt-8 flex items-center justify-between gap-3 sm:justify-center sm:gap-6" aria-label="Pages">
                <button type="button" disabled={page <= 1} onClick={() => changePage(page - 1)} className={pagerButton}>
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Page {data.page} of {data.totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= data.totalPages}
                  onClick={() => changePage(page + 1)}
                  className={pagerButton}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default ProductsPage