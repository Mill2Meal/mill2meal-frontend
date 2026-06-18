import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart()

  if (cartItems.length === 0) {
    return (
      <div className="container-custom py-20 text-center">
        <div className="max-w-md mx-auto">
          <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-heading font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added any items yet.</p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            Start Shopping <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    )
  }

  const deliveryFee = cartTotal >= 499 ? 0 : 49
  const total = cartTotal + deliveryFee

  return (
    <div className="pb-20 lg:pb-0">
      <div className="container-custom py-8">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-8">Shopping Cart ({cartItems.length} items)</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(item => (
              <div key={`${item.id}-${item.variant}`} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <Link to={`/product/${item.id}`} className="w-24 h-24 rounded-lg overflow-hidden shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link to={`/product/${item.id}`} className="font-semibold text-gray-800 hover:text-primary-600 transition line-clamp-1">{item.name}</Link>
                      {item.variant && <p className="text-sm text-gray-500">{item.variant}</p>}
                    </div>
                    <button onClick={() => removeFromCart(item.id, item.variant)} className="text-gray-400 hover:text-red-500 transition p-1">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant)} className="p-2 hover:bg-gray-50"><Minus size={14} /></button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)} className="p-2 hover:bg-gray-50"><Plus size={14} /></button>
                    </div>
                    <span className="font-bold text-gray-900">₹{item.price * item.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-40 bg-gray-50 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{cartTotal}</span></div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery</span>
                  <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </span>
                </div>
                {deliveryFee > 0 && (
                  <p className="text-xs text-primary-600">Add ₹{499 - cartTotal} more for free delivery</p>
                )}
                <hr />
                <div className="flex justify-between text-base font-bold"><span>Total</span><span>₹{total}</span></div>
              </div>
              <Link to="/checkout" className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
                Proceed to Checkout <ArrowRight size={18} />
              </Link>
              <Link to="/" className="block text-center text-sm text-primary-600 font-medium mt-3 hover:underline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
