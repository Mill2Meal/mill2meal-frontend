import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, CreditCard, Truck, Shield, Check } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function CheckoutPage() {
  const { cartItems, cartTotal } = useCart()
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [coupon, setCoupon] = useState('')

  const deliveryFee = cartTotal >= 499 ? 0 : 49
  const total = cartTotal + deliveryFee

  return (
    <div className="pb-20 lg:pb-0 bg-gray-50 min-h-screen">
      <div className="container-custom py-8">
        <h1 className="text-2xl font-heading font-bold text-gray-900 mb-6">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {['Login', 'Address', 'Delivery', 'Payment'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${step > i + 1 ? 'bg-primary-600 text-white' : step === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > i + 1 ? <Check size={16} /> : i + 1}
              </div>
              <span className={`text-sm whitespace-nowrap ${step === i + 1 ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>{s}</span>
              {i < 3 && <div className="w-8 h-px bg-gray-300 mx-1" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Step 1: Login */}
            {step === 1 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h2 className="font-semibold text-lg mb-4">Login / Sign Up</h2>
                <div className="max-w-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                  <div className="flex gap-2">
                    <span className="px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-sm">+91</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter mobile number"
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <button onClick={() => setStep(2)} className="btn-primary w-full mt-4">
                    Send OTP
                  </button>
                  <p className="text-xs text-gray-500 mt-3 text-center">By continuing, you agree to our Terms & Privacy Policy</p>
                </div>
              </div>
            )}

            {/* Step 2: Address */}
            {step === 2 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h2 className="font-semibold text-lg mb-4">Delivery Address</h2>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500" placeholder="Enter full name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input type="tel" defaultValue={phone} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                    <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500" placeholder="House/Flat number, Street" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                    <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500" placeholder="Landmark, Area" />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500" placeholder="City" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500" placeholder="State" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                      <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500" placeholder="Pincode" />
                    </div>
                  </div>
                  <button onClick={() => setStep(3)} className="btn-primary">Save & Continue</button>
                </div>
              </div>
            )}

            {/* Step 3: Delivery */}
            {step === 3 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h2 className="font-semibold text-lg mb-4">Delivery Options</h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-4 p-4 border-2 border-primary-600 rounded-xl cursor-pointer bg-primary-50">
                    <input type="radio" name="delivery" defaultChecked className="w-5 h-5 text-primary-600" />
                    <div className="flex-1">
                      <p className="font-medium">Standard Delivery</p>
                      <p className="text-sm text-gray-500">Delivery in 1-2 business days</p>
                    </div>
                    <span className="font-semibold text-green-600">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                  </label>
                  <label className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-gray-300">
                    <input type="radio" name="delivery" className="w-5 h-5 text-primary-600" />
                    <div className="flex-1">
                      <p className="font-medium">Express Delivery</p>
                      <p className="text-sm text-gray-500">Same day delivery (order before 2 PM)</p>
                    </div>
                    <span className="font-semibold">₹99</span>
                  </label>
                </div>
                <button onClick={() => setStep(4)} className="btn-primary mt-6">Continue to Payment</button>
              </div>
            )}

            {/* Step 4: Payment */}
            {step === 4 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h2 className="font-semibold text-lg mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {['UPI (GPay, PhonePe, Paytm)', 'Credit / Debit Card', 'Net Banking', 'Cash on Delivery'].map((method, i) => (
                    <label key={method} className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-primary-300 transition">
                      <input type="radio" name="payment" defaultChecked={i === 0} className="w-5 h-5 text-primary-600" />
                      <span className="font-medium">{method}</span>
                    </label>
                  ))}
                </div>
                <button className="btn-primary w-full mt-6">
                  Place Order - ₹{total}
                </button>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-40 bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {cartItems.map(item => (
                  <div key={`${item.id}-${item.variant}`} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              {/* Coupon */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Coupon code"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                />
                <button className="px-4 py-2 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-100 transition">Apply</button>
              </div>
              <hr className="my-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{cartTotal}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span className={deliveryFee === 0 ? 'text-green-600' : ''}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
                <hr />
                <div className="flex justify-between text-base font-bold"><span>Total</span><span>₹{total}</span></div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <Shield size={14} className="text-primary-600" /> Secure checkout powered by SSL encryption
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
