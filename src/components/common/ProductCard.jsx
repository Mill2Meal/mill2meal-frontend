import { Star, Plus, Heart } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { resolveProductImage } from '../../lib/api'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist, openQuickView } = useWishlist()

  const id = product.productId || product.id
  const name = product.productName || product.name
  const imageUrl = resolveProductImage(product)
  const unit = product.packSize ? `${product.packSize} ${product.unitOfMeasure || ''}` : (product.unit || '1 Unit')
  const price = parseFloat(product.salePrice || product.price)
  const originalPrice = parseFloat(product.mrp || product.originalPrice || price)
  const rating = product.rating || 4.5
  const reviews = product.reviews || 12
  const badge = product.isBestSeller ? 'Best Seller' : product.badge
  const discount = product.discount || (originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0)
  const isWishlisted = isInWishlist(id)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await addToCart(product, 1)
      // Instant add to cart, no redirect!
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 group border border-gray-100/80 dark:border-gray-700 relative">
      {/* Image Sub-Card Container */}
      <div className="relative rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900/50 border border-gray-100/50 dark:border-gray-700/50 p-2 shrink-0">
        <button 
          onClick={() => openQuickView(product)}
          className="block relative overflow-hidden rounded-lg w-full text-center"
        >
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500 rounded-lg"
          />
        </button>

        {/* Wishlist Heart Icon */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (isWishlisted) {
              removeFromWishlist(id)
            } else {
              addToWishlist(product)
            }
          }}
          className="absolute top-3 right-3 z-10 p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full text-[#CE2028] shadow-sm hover:scale-110 transition duration-300"
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {badge && (
          <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white ${
            badge === 'Best Seller' ? 'bg-[#CE2028]' :
            badge === 'Organic' ? 'bg-green-600' :
            badge === 'Premium' ? 'bg-gold' :
            badge === 'New' ? 'bg-purple-600' :
            badge === 'Healthy' ? 'bg-teal-600' :
            'bg-[#CE2028]'
          }`}>
            {badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute bottom-3 left-3 bg-[#CE2028] text-white text-xs font-bold px-2 py-1 rounded shadow">
            -{discount}%
          </span>
        )}
      </div>

      {/* Details Sub-Card Container */}
      <div className="flex flex-col flex-1 bg-gray-50/50 dark:bg-gray-900/10 p-3 rounded-xl border border-gray-100/50 dark:border-gray-700/20">
        <button onClick={() => openQuickView(product)} className="text-left w-full">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1 line-clamp-1 hover:text-[#CE2028] dark:hover:text-red-400 transition">{name}</h3>
        </button>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{unit}</p>
        <div className="flex items-center gap-1 mb-3">
          <Star size={14} className="fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{rating}</span>
          <span className="text-xs text-gray-400">({reviews})</span>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-2.5">
            <span className="text-lg font-extrabold text-gray-900 dark:text-gray-100">₹{price}</span>
            {originalPrice > price && (
              <span className="text-sm text-gray-400 line-through">₹{originalPrice}</span>
            )}
          </div>
          {(() => {
            const availableStock = product.inventories 
              ? product.inventories.reduce((sum, inv) => sum + (inv.onHandQuantity - (inv.reservedQuantity || 0)), 0)
              : 1;
            const isOutOfStock = availableStock <= 0;
            if (isOutOfStock) {
              return (
                <span className="px-3.5 py-2 bg-gray-150 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-xl text-xs font-bold select-none border border-gray-200 dark:border-gray-700 shrink-0">
                  Out of Stock
                </span>
              );
            }
            return (
              <button
                onClick={handleAddToCart}
                className="w-10 h-10 bg-[#CE2028] text-white rounded-full flex items-center justify-center hover:bg-[#A8161D] transition shadow-md hover:shadow-lg shrink-0"
              >
                <Plus size={20} />
              </button>
            );
          })()}
        </div>
      </div>
    </div>
  )
}
