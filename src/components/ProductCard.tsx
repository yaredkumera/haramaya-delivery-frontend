import { Plus } from "lucide-react"
import type { Product } from "../types"
import { formatPrice, optimizeImage } from "../utils/format"

type ProductCardProps = {
  product: Product
  onAdd?: (product: Product) => void
}

function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-800 dark:ring-slate-700">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-700">
        <img
          src={optimizeImage(product.imageUrl)}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute left-2 top-2 rounded-lg bg-slate-900/85 px-2.5 py-1 text-xs font-semibold text-white sm:left-3 sm:top-3">
            {product.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3 sm:gap-3 sm:p-4">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-slate-800 sm:text-base dark:text-slate-100">
          {product.name}
        </h3>

        <p className="text-base font-bold text-teal-700 sm:text-lg dark:text-teal-400">
          {formatPrice(product.price)}
        </p>

        {onAdd && (
          <button
            type="button"
            onClick={() => onAdd(product)}
            className="mt-auto flex w-full items-center justify-center gap-1.5 rounded-xl bg-teal-700 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 active:scale-[0.98] dark:bg-teal-600 dark:hover:bg-teal-500 dark:focus-visible:ring-offset-slate-800"
          >
            <Plus className="h-4 w-4" />
            Add to Cart
          </button>
        )}
      </div>
    </article>
  )
}

export default ProductCard