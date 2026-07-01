import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X, Star, Heart, Plus, Minus, ShoppingBag, ShieldCheck, RefreshCw, Award } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { resolveProductImage } from '../../lib/api'

export default function QuickViewModal() {
  const { quickViewProduct, closeQuickView, addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { cartItems, addToCart, updateQuantity } = useCart()
  const navigate = useNavigate()

  const id = quickViewProduct?.productId || quickViewProduct?.id || null
  const inCartItem = id ? cartItems.find(item => item.id === id) : null
  const quantityInCart = inCartItem ? inCartItem.quantity : 0

  const [localQty, setLocalQty] = useState(1)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeQuickView()
      }
    }
    if (quickViewProduct) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden' // prevent body scrolling
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [quickViewProduct])

  useEffect(() => {
    if (quantityInCart > 0) {
      setLocalQty(quantityInCart)
    } else {
      setLocalQty(1)
    }
  }, [quantityInCart, quickViewProduct])

  if (!quickViewProduct) return null

  const name = quickViewProduct.productName || quickViewProduct.name
  const imageUrl = resolveProductImage(quickViewProduct)
  const unit = quickViewProduct.packSize ? `${quickViewProduct.packSize} ${quickViewProduct.unitOfMeasure || ''}` : (quickViewProduct.unit || '1 Unit')
  const price = parseFloat(quickViewProduct.salePrice || quickViewProduct.price)
  const originalPrice = parseFloat(quickViewProduct.mrp || quickViewProduct.originalPrice || price)
  const rating = quickViewProduct.rating || 4.5
  const reviews = quickViewProduct.reviews || 12
  const discount = quickViewProduct.discount || (originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0)
  const isWishlisted = isInWishlist(id)
  
  const availableStock = quickViewProduct.inventories 
    ? quickViewProduct.inventories.reduce((sum, inv) => sum + (inv.onHandQuantity - (inv.reservedQuantity || 0)), 0)
    : 1;
  const isAvailable = availableStock > 0;

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(id)
    } else {
      addToWishlist(quickViewProduct)
    }
  }

  const handleViewFullDetails = () => {
    closeQuickView()
    navigate(`/product/${id}`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300 animate-fadeIn">
      {/* Outside click handler */}
      <div className="absolute inset-0" onClick={closeQuickView} />
      
      {/* Modal Box */}
      <div className="relative bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row transform transition-all duration-300 animate-scaleUp max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-y-visible">
        {/* Close Button */}
        <button 
          onClick={closeQuickView}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-800 dark:hover:text-white transition shadow"
        >
          <X size={20} />
        </button>

        {/* Left Side: Product Image */}
        <div className="w-full md:w-1/2 bg-gray-50 dark:bg-gray-950 p-6 flex items-center justify-center relative shrink-0">
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-full aspect-square object-cover rounded-2xl shadow-md"
          />
          {discount > 0 && (
            <span className="absolute top-6 left-6 bg-[#CE2028] text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Right Side: Product Details */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between text-left">
          <div>
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-xs font-bold text-[#CE2028] bg-red-50 dark:bg-red-950/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {quickViewProduct.brand || '100% Organic'}
              </span>
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-snug mb-1">{name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-3">{unit}</p>

            {/* Ratings */}
            <div className="flex items-center gap-1.5 mb-4">
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{rating}</span>
              <span className="text-xs text-gray-400">({reviews} reviews)</span>
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-black text-gray-900 dark:text-white">₹{price}</span>
              {originalPrice > price && (
                <span className="text-base text-gray-400 line-through">₹{originalPrice}</span>
              )}
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 leading-relaxed line-clamp-3">
              {quickViewProduct.description || 'Premium quality handpicked grocery staples sourced directly from certified organic farms and mills. Freshly packed on order to retain natural nutrients and absolute purity.'}
            </p>

            {/* Trust Tags */}
            <div className="grid grid-cols-3 gap-2 border-t border-b border-gray-100 dark:border-gray-800 py-3 mb-6">
              <div className="flex flex-col items-center text-center gap-1">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span className="text-[9px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">100% Original</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <Award size={16} className="text-amber-500" />
                <span className="text-[9px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Quality Badge</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <RefreshCw size={16} className="text-blue-500" />
                <span className="text-[9px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Easy Returns</span>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-4 text-left">
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                {/* Quantity Selector */}
                <div className="flex items-center border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-850 rounded-xl overflow-hidden h-12 shrink-0">
                  <button 
                    onClick={() => {
                      const nextQty = Math.max(1, localQty - 1);
                      setLocalQty(nextQty);
                      if (quantityInCart > 0) updateQuantity(id, nextQty);
                    }}
                    className="px-3 h-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center font-bold text-gray-800 dark:text-gray-250">{localQty}</span>
                  <button 
                    onClick={() => {
                      const nextQty = localQty + 1;
                      setLocalQty(nextQty);
                      if (quantityInCart > 0) updateQuantity(id, nextQty);
                    }}
                    className="px-3 h-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => {
                    addToCart(quickViewProduct, localQty);
                  }}
                  disabled={!isAvailable}
                  className="flex-1 h-12 bg-[#CE2028] hover:bg-[#A8161D] disabled:bg-gray-200 dark:disabled:bg-gray-850 dark:disabled:text-gray-600 text-white font-bold px-6 rounded-xl transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:cursor-not-allowed text-sm"
                >
                  <ShoppingBag size={18} /> {isAvailable ? (quantityInCart > 0 ? 'Update Cart' : 'Add to Cart') : 'Out of Stock'}
                </button>

                {/* Wishlist Button */}
                <button 
                  onClick={handleWishlistToggle}
                  className="w-12 h-12 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850 rounded-xl flex items-center justify-center text-[#CE2028] hover:bg-red-50 dark:hover:bg-red-950/20 transition shadow-sm shrink-0"
                  title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart size={20} className={isWishlisted ? 'fill-current' : ''} />
                </button>
              </div>
            </div>

            {/* View Full Details */}
            <button 
              onClick={handleViewFullDetails}
              className="w-full text-center text-xs font-bold text-[#CE2028] hover:text-[#A8161D] transition pb-1 border-b border-dashed border-[#CE2028]/40 hover:border-[#A8161D] w-max mx-auto block mt-2"
            >
              View Full Details &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
