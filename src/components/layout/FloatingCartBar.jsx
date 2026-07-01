import { Link, useLocation } from 'react-router-dom'
import { ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '../../context/CartContext'

export default function FloatingCartBar() {
  const { cartItems, cartCount, cartTotal } = useCart()
  const location = useLocation()

  // Do not show on CartPage or CheckoutPage to avoid redundant actions
  const isCartOrCheckout = ['/cart', '/checkout'].includes(location.pathname)

  if (cartCount === 0 || isCartOrCheckout) return null

  // Get first 3 product thumbnails
  const displayItems = cartItems.slice(0, 3)

  return (
    <div className="fixed bottom-24 left-4 right-4 w-auto lg:bottom-6 lg:left-0 lg:right-0 lg:mx-auto lg:w-[92%] lg:max-w-xl z-40 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-xl p-3.5 flex items-center justify-between gap-4 transition-all duration-500 animate-slideUp">
      {/* Product Thumbnails */}
      <div className="flex items-center gap-3">
        <div className="flex -space-x-3 overflow-hidden">
          {displayItems.map((item, idx) => (
            <img
              key={idx}
              src={item.image}
              alt={item.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-900 shadow-sm shrink-0"
            />
          ))}
          {cartItems.length > 3 && (
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-850 border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs font-black text-gray-500 dark:text-gray-400 shadow-sm shrink-0">
              +{cartItems.length - 3}
            </div>
          )}
        </div>

        <div className="text-left">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider">My Cart</p>
          <h4 className="text-sm font-extrabold text-gray-900 dark:text-white leading-tight">
            {cartCount} {cartCount === 1 ? 'item' : 'items'} <span className="text-gray-300 dark:text-gray-700 mx-1.5">|</span> ₹{cartTotal}
          </h4>
        </div>
      </div>

      {/* Action Button */}
      <Link
        to="/cart"
        className="flex items-center gap-1.5 bg-[#CE2028] hover:bg-[#A8161D] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300 transform active:scale-95 shrink-0"
      >
        View Cart <ArrowRight size={16} />
      </Link>
    </div>
  )
}
