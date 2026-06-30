import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X, Star, Heart, Plus, Minus, ShoppingBag, ShieldCheck, RefreshCw, Award } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { resolveProductImage } from '../../lib/api'

export default function QuickViewModal() {
  const { quickViewProduct, closeQuickView, addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { cartItems, addToCart, updateQuantity } = useCart()
  const navigate = useNavigate()

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

  if (!quickViewProduct) return null

  const id = quickViewProduct.productId || quickViewProduct.id
  const name = quickViewProduct.productName || quickViewProduct.name
  const imageUrl = resolveProductImage(quickViewProduct)
  const unit = quickViewProduct.packSize ? `${quickViewProduct.packSize} ${quickViewProduct.unitOfMeasure || ''}` : (quickViewProduct.unit || '1 Unit')
  const price = parseFloat(quickViewProduct.salePrice || quickViewProduct.price)
  const originalPrice = parseFloat(quickViewProduct.mrp || quickViewProduct.originalPrice || price)
  const rating = quickViewProduct.rating || 4.5
  const reviews = quickViewProduct.reviews || 12
  const discount = quickViewProduct.discount || (originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0)
  const isWishlisted = isInWishlist(id)
  
  const inCartItem = cartItems.find(item => item.id === id)
  const quantityInCart = inCartItem ? inCartItem.quantity : 0
  const isAvailable = quickViewProduct.availabilityStatus !== 'Out Of Stock'

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
              <button 
                onClick={handleWishlistToggle}
                className="text-[#CE2028] hover:scale-110 transition duration-300 p-1"
                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart size={24} className={isWishlisted ? 'fill-current' : ''} />
              </button>
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
            {/* CTA action container */}
            <div className="flex items-center gap-4 mb-4">
              {quantityInCart > 0 ? (
                <div className="flex items-center border border-gray-200 dark:border-gray-850 rounded-xl overflow-hidden shadow-sm">
                  <button 
                    onClick={() => updateQuantity(id, quantityInCart - 1)}
                    className="p-3 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 font-bold text-gray-800 dark:text-gray-200">{quantityInCart}</span>
                  <button 
                    onClick={() => updateQuantity(id, quantityInCart + 1)}
                    className="p-3 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addToCart(quickViewProduct, 1)}
                  disabled={!isAvailable}
                  className="flex-1 bg-[#CE2028] hover:bg-[#A8161D] disabled:bg-gray-200 text-white font-bold py-3.5 px-6 rounded-xl transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                >
                  <ShoppingBag size={18} /> {isAvailable ? 'Add to Cart' : 'Out of Stock'}
                </button>
              )}
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
