import { Link } from 'react-router-dom'
import { Heart, Trash2, ShoppingCart, ArrowRight } from 'lucide-react'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { resolveProductImage } from '../lib/api'

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, clearWishlist, moveAllToCart } = useWishlist()
  const { addToCart } = useCart()

  if (wishlistItems.length === 0) {
    return (
      <div className="container-custom py-20 text-center">
        <div className="max-w-md mx-auto">
          <Heart size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-heading font-bold text-gray-800 dark:text-gray-150 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-8">Save items you like to buy them later.</p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2 mb-10 bg-[#CE2028] hover:bg-[#A8161D]">
            Start Shopping <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-20 lg:pb-0 bg-gray-50/50 dark:bg-[#090d16]/30 min-h-screen">
      <div className="container-custom py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 dark:text-white">My Wishlist</h1>
            <p className="text-gray-500 text-sm mt-1">{wishlistItems.length} items saved</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={clearWishlist}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-sm font-semibold transition"
            >
              Clear Wishlist
            </button>
            <button
              onClick={moveAllToCart}
              className="px-4 py-2 bg-[#CE2028] hover:bg-[#A8161D] text-white rounded-xl text-sm font-semibold transition shadow-sm"
            >
              Move All to Cart
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-md">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {wishlistItems.map((item) => {
              const id = item.productId || item.id
              const name = item.productName || item.name
              const price = parseFloat(item.salePrice || item.price)
              const originalPrice = parseFloat(item.mrp || item.originalPrice || price)
              const image = resolveProductImage(item)
              const inStock = item.availabilityStatus !== 'Out Of Stock' && 
                              item.availabilityStatus !== 'Out of Stock' && 
                              !(item.inventories && 
                                item.inventories.length > 0 && 
                                item.inventories.reduce((sum, inv) => sum + (inv.onHandQuantity - (inv.reservedQuantity || 0)), 0) <= 0);

              return (
                <div key={id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <img
                      src={image}
                      alt={name}
                      className="w-20 h-20 object-cover rounded-xl border border-gray-100 dark:border-gray-800 shrink-0"
                    />
                    <div className="space-y-1 text-left">
                      <Link to={`/product/${id}`} className="font-bold text-gray-900 dark:text-white hover:text-[#CE2028] transition block">
                        {name}
                      </Link>
                      <p className="text-xs text-gray-500">
                        {item.packSize ? `${item.packSize} ${item.unitOfMeasure || ''}` : (item.unit || 'Standard')}
                      </p>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${inStock ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'}`}>
                        {inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-baseline sm:items-end justify-between gap-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-extrabold text-gray-900 dark:text-white">₹{price}</span>
                      {originalPrice > price && (
                        <span className="text-sm text-gray-400 line-through">₹{originalPrice}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:w-auto w-full">
                    <button
                      onClick={() => removeFromWishlist(id)}
                      className="p-3 border border-gray-200 dark:border-gray-800 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-500 hover:text-red-600 rounded-xl transition"
                      title="Remove"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button
                      onClick={() => addToCart(item, 1)}
                      disabled={!inStock}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#CE2028] hover:bg-[#A8161D] disabled:bg-gray-150 disabled:text-gray-400 text-white px-5 py-3 rounded-xl font-bold transition shadow-sm hover:shadow-md"
                    >
                      <ShoppingCart size={18} /> Add to Cart
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
