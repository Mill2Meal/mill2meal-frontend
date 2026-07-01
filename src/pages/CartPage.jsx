import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, Loader2, Sparkles, AlertCircle, Check } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function CartPage() {
  const { 
    cartItems, updateQuantity, removeFromCart, 
    subtotal, discount, deliveryFee, tax, grandTotal, appliedCoupon,
    applyCoupon, removeCoupon, loading
  } = useCart()

  const [couponCode, setCouponCode] = useState('')
  const [couponError, setCouponError] = useState('')
  const [applying, setApplying] = useState(false)

  const isLoggedIn = () => !!localStorage.getItem('accessToken')

  const handleApplyCoupon = async (e) => {
    e.preventDefault()
    setCouponError('')
    if (!couponCode.trim()) return
    
    setApplying(true)
    try {
      await applyCoupon(couponCode.trim())
      setCouponCode('')
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon code')
    } finally {
      setApplying(false)
    }
  }

  const handleRemoveCoupon = async () => {
    setApplying(true)
    try {
      await removeCoupon()
    } catch (err) {
      alert(err.message || 'Failed to remove coupon')
    } finally {
      setApplying(false)
    }
  }

  const recommendedCategories = [
    { name: 'Rice & Millets', slug: 'rice-millets', bg: 'bg-primary-50 hover:bg-primary-100/80 text-primary-800' },
    { name: 'Dals & Pulses', slug: 'dals-pulses', bg: 'bg-red-50 hover:bg-red-100/80 text-[#CE2028]' },
    { name: 'Cooking Oils', slug: 'cooking-oils', bg: 'bg-rose-50 hover:bg-rose-100/80 text-[#CE2028]' },
    { name: 'Spices & Masalas', slug: 'spices-masalas', bg: 'bg-red-50 hover:bg-red-100/80 text-red-800' }
  ]

  if (cartItems.length === 0) {
    return (
      <div className="container-custom py-20 text-center">
        <div className="max-w-md mx-auto">
          <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-heading font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added any items yet.</p>
          
          <Link to="/" className="btn-primary inline-flex items-center gap-2 mb-10">
            Start Shopping <ArrowRight size={18} />
          </Link>

          {/* Recommended Categories */}
          <div className="border-t pt-8">
            <h3 className="font-bold text-gray-800 text-sm mb-4">Browse Our Staple Categories</h3>
            <div className="grid grid-cols-2 gap-3">
              {recommendedCategories.map(cat => (
                <Link 
                  key={cat.slug} 
                  to={`/category/${cat.slug}`} 
                  className={`p-4 rounded-xl border text-center font-semibold text-sm transition ${cat.bg}`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-[205px] pb-20 lg:pt-0 lg:pb-0 bg-gray-50/50 min-h-screen">
      <div className="container-custom py-8">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-8">Shopping Cart ({cartItems.length} items)</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Complete Your Basket Upsell */}
            <div className="bg-gradient-to-r from-[#CE2028]/10 to-[#E63B44]/10 border border-red-200/50 p-4 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-xl flex items-center justify-center shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Complete Your Monthly Basket</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Subscribe to a pre-curated basket for up to 20% extra savings!</p>
                </div>
              </div>
              <Link to="/monthly-essentials" className="btn-primary py-2 px-4 text-xs shrink-0 bg-primary-600">
                View Baskets
              </Link>
            </div>

            {cartItems.map(item => (
              <div key={`${item.id}-${item.variant}`} className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm transition-hover hover:shadow-md">
                <Link to={`/product/${item.id}`} className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border bg-gray-50">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link to={`/product/${item.id}`} className="font-bold text-gray-900 hover:text-primary-600 transition line-clamp-1 leading-snug">{item.name}</Link>
                      {item.variant && <p className="text-xs text-gray-500 mt-1">Pack Size: {item.variant}</p>}
                    </div>
                    <button onClick={() => removeFromCart(item.id, item.variant)} className="text-gray-400 hover:text-red-500 transition p-1.5 hover:bg-red-50 rounded-full shrink-0">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 bg-white rounded-lg p-0.5">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant)} className="p-1.5 hover:bg-gray-50 text-gray-500 rounded"><Minus size={12} /></button>
                      <span className="w-8 text-center text-xs font-bold text-gray-700">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)} className="p-1.5 hover:bg-gray-50 text-gray-500 rounded"><Plus size={12} /></button>
                    </div>
                    <span className="font-bold text-gray-900 font-mono text-sm">₹{item.price * item.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
 
          {/* Order Summary & Coupons */}
          <div className="lg:col-span-1 space-y-6">
            {/* Coupon Block */}            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-1.5">
                <Tag size={16} className="text-primary-600" /> Have a Coupon?
              </h3>
              
              {!isLoggedIn() ? (
                <div className="bg-gray-50 p-3 rounded-xl border border-dashed text-xs text-gray-500 leading-normal">
                  Please <Link to="/login?redirect=/cart" className="text-primary-600 font-bold underline">Login</Link> to view and apply available discount coupons.
                </div>
              ) : (
                <div className="space-y-3">
                  {appliedCoupon ? (
                    <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-green-800 font-bold flex items-center gap-1">
                          <Check size={14} /> Coupon Applied Successfully
                        </span>
                        <button 
                          onClick={handleRemoveCoupon}
                          disabled={applying}
                          className="text-xs font-bold text-red-500 hover:text-red-650 hover:underline disabled:opacity-50"
                        >
                          {applying ? '...' : 'Remove Coupon'}
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-gray-700 bg-white/50 p-2.5 rounded-lg border border-green-100">
                        <span className="font-mono font-bold text-gray-900 uppercase tracking-wider">{appliedCoupon.code}</span>
                        <span className="font-bold text-green-700">₹{discount} Discount Applied</span>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input 
                        type="text" 
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter Coupon Code"
                        disabled={applying}
                        className="flex-1 bg-gray-50 border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-primary-500 font-bold uppercase tracking-wider disabled:opacity-50"
                      />
                      <button 
                        type="submit"
                        disabled={applying || !couponCode.trim()}
                        className="btn-primary py-2 px-4 text-xs font-bold shrink-0"
                      >
                        {applying ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
                      </button>
                    </form>
                  )}
                  {couponError && (
                    <p className="text-xs text-red-500 font-semibold flex items-center gap-1 mt-1">
                      <AlertCircle size={13} /> {couponError}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Order Summary Calculations */}
            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <h3 className="font-bold text-gray-900 text-base mb-4 font-heading">Order Summary</h3>
              <div className="space-y-3 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-gray-900 font-medium">₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Coupon Discount</span>
                    <span className="font-mono">-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Taxes (GST)</span>
                  <span className="font-mono text-gray-900 font-medium">₹{tax}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className={deliveryFee === 0 ? 'text-green-600 font-semibold' : 'font-mono text-gray-900 font-medium'}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </span>
                </div>
                
                {deliveryFee > 0 && (
                  <div className="p-2.5 bg-primary-50 rounded-lg text-[10px] text-primary-800 leading-normal border border-primary-100">
                    Add <strong>₹{499 - subtotal}</strong> more to your cart to unlock <strong>FREE Delivery</strong>!
                  </div>
                )}
                
                <hr className="border-gray-100 my-2" />
                <div className="flex justify-between text-base font-black text-gray-900 border-t border-gray-50 pt-3">
                  <span>Grand Total</span>
                  <span className="font-mono text-primary-600">₹{grandTotal}</span>
                </div>
              </div>

              <Link to="/checkout" className="btn-primary w-full mt-6 py-3 flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary-500/10">
                Proceed to Checkout <ArrowRight size={18} />
              </Link>
              <Link to="/" className="block text-center text-xs text-gray-500 font-medium mt-4 hover:text-primary-600 transition">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

