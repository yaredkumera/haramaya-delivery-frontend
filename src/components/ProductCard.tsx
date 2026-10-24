import { Plus } from "lucide-react"
import type { Product } from "../types"
import { formatPrice, optimizeImage } from "../utils/format"

type ProductCardProps = {
  product: Product
  onAdd?: (product: Product) => void
}

function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
      <div className="relative aspect-square bg-slate-100">
        <img
          src={optimizeImage(product.imageUrl)}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        {product.badge && (
          <span className="absolute top-3 left-3 rounded-lg bg-slate-800/90 px-2.5 py-1 text-xs font-semibold text-white">
            {product.badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 font-semibold text-slate-800">{product.name}</h3>
        <div className="mt-auto flex items-center justify-between gap-2">
          <p className="text-lg font-bold text-slate-900">{formatPrice(product.price)}</p>
          {onAdd && (
            <button
              onClick={() => onAdd(product)}
              className="flex items-center gap-1 rounded-xl bg-teal-700 px-3.5 py-2 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Add <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export default ProductCard