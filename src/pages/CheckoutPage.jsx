import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, CreditCard, Shield, Check, Loader2, Plus } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { api, apiFetch } from '../lib/api'

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart()
  const navigate = useNavigate()

  const [step, setStep] = useState(1) // 1: Address, 2: Payment
  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [paymentMode, setPaymentMode] = useState('UPI_ON_DELIVERY')
  const [notes, setNotes] = useState('')
  const [coupon, setCoupon] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  
  // New Address Form State
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    mobileNumber: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    addressLabel: 'Home',
    isDefault: false
  })

  // Backend Cart state (to fetch precise pricing including taxes/discounts)
  const [backendCart, setBackendCart] = useState(null)

  useEffect(() => {
    // Inject Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const isLoggedIn = () => !!localStorage.getItem('accessToken')

  async function loadCheckoutData() {
    if (!isLoggedIn()) {
      navigate('/login?redirect=/checkout')
      return
    }

    setLoading(true)
    setError('')
    try {
      const [cartData, addressData] = await Promise.all([
        api.cart.get(),
        api.addresses.list()
      ])
      setBackendCart(cartData)
      const addressList = addressData?.items || []
      setAddresses(addressList)
      
      const defaultAddr = addressList.find(a => a.isDefault) || addressList[0]
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.addressId)
      }
    } catch (err) {
      console.error(err)
      setError('Failed to initialize checkout information')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCheckoutData()
  }, [])

  const selectedAddress = useMemo(() => {
    return addresses.find(a => a.addressId === selectedAddressId) || null
  }, [addresses, selectedAddressId])

  const deliveryFee = backendCart ? parseFloat(backendCart.deliveryFeeAmount) : (cartTotal >= 499 ? 0 : 49)
  const discountAmount = backendCart ? parseFloat(backendCart.discountAmount) : 0
  const taxAmount = backendCart ? parseFloat(backendCart.taxAmount) : 0
  const total = backendCart ? parseFloat(backendCart.grandTotalAmount) : (cartTotal + deliveryFee)

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) return
    setBusy(true)
    setError('')
    try {
      const updatedCart = await api.cart.applyCoupon(coupon)
      setBackendCart(updatedCart)
      setCoupon('')
      alert('Coupon applied successfully!')
    } catch (err) {
      setError(err.message || 'Failed to apply coupon')
    } finally {
      setBusy(false)
    }
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    if (!newAddress.fullName || !newAddress.mobileNumber || !newAddress.line1 || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      setError('Please fill in all required address fields')
      return
    }
    setBusy(true)
    setError('')
    try {
      const created = await api.addresses.create(newAddress)
      setAddresses(prev => [...prev, created])
      setSelectedAddressId(created.addressId)
      setShowNewAddressForm(false)
      // Reset form
      setNewAddress({
        fullName: '',
        mobileNumber: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: '',
        addressLabel: 'Home',
        isDefault: false
      })
    } catch (err) {
      setError(err.message || 'Failed to save address')
    } finally {
      setBusy(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError('Please select or add a delivery address')
      return
    }
    setBusy(true)
    setError('')

    const cartId = backendCart?.cartId
    if (!cartId) {
      setError('Unable to resolve cart identifier')
      setBusy(false)
      return
    }

    if (paymentMode === 'ONLINE' || paymentMode === 'CARD' || paymentMode === 'UPI') {
      try {
        const orderRes = await apiFetch('/payments/create-order', {
          method: 'POST',
          body: JSON.stringify({ amount: Number(total) })
        })
        const { razorpayOrderId, amount, currency, key } = orderRes

        const options = {
          key,
          amount,
          currency,
          order_id: razorpayOrderId,
          handler: async (response) => {
            try {
              const res = await apiFetch('/payments/verify', {
                method: 'POST',
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  checkoutDto: {
                    cartId,
                    deliveryAddressId: selectedAddressId,
                    paymentMode,
                    notes: notes || undefined
                  }
                })
              })
              await clearCart()
              navigate(`/orders/${res.orderId}`)
            } catch (err) {
              setError('Payment verification failed. Please check with your bank.')
              setBusy(false)
            }
          },
          modal: {
            ondismiss: () => setBusy(false)
          }
        }
        const rzp = new window.Razorpay(options)
        rzp.open()
      } catch (err) {
        console.error(err)
        setError('Failed to initiate online payment processor')
        setBusy(false)
      }
    } else {
      // Direct Cash On Delivery or UPI On Delivery
      try {
        const result = await api.checkout.placeOrder(
          {
            cartId,
            deliveryAddressId: selectedAddressId,
            paymentMode,
            notes: notes || undefined
          },
          `d2c-${Date.now()}-${cartId}`
        )
        await clearCart()
        navigate(`/orders/${result.orderId}`)
      } catch (err) {
        setError(err.message || 'Failed to place order')
        setBusy(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center gap-2 text-gray-500 font-semibold">
        <Loader2 className="animate-spin text-primary-600" /> Loading checkout details...
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="container-custom py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Your Cart is Empty</h2>
        <p className="text-gray-500 mt-2">Add items to your cart before proceeding to checkout.</p>
        <Link to="/" className="btn-primary mt-6 inline-block">Start Shopping</Link>
      </div>
    )
  }

  return (
    <div className="pb-20 lg:pb-0 bg-gray-50 min-h-screen">
      <div className="container-custom py-8">
        <h1 className="text-2xl font-heading font-bold text-gray-900 mb-6">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {['Delivery Address', 'Payment & Summary'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${step > i + 1 ? 'bg-primary-600 text-white' : step === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > i + 1 ? <Check size={16} /> : i + 1}
              </div>
              <span className={`text-sm whitespace-nowrap ${step === i + 1 ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>{s}</span>
              {i < 1 && <div className="w-8 h-px bg-gray-300 mx-1" />}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-4 rounded-xl mb-6 border border-red-100">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Step 1: Address selection */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold text-lg">Select Delivery Address</h2>
                    {!showNewAddressForm && (
                      <button
                        onClick={() => setShowNewAddressForm(true)}
                        className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-semibold transition"
                      >
                        <Plus size={16} /> Add Address
                      </button>
                    )}
                  </div>

                  {/* Address List */}
                  {!showNewAddressForm && (
                    <div className="space-y-3">
                      {addresses.length === 0 ? (
                        <p className="text-gray-500 text-sm py-4">No addresses saved. Please add a new delivery address.</p>
                      ) : (
                        addresses.map((addr) => (
                          <label
                            key={addr.addressId}
                            className={`flex gap-4 p-4 border rounded-xl cursor-pointer transition ${selectedAddressId === addr.addressId ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
                          >
                            <input
                              type="radio"
                              name="address"
                              checked={selectedAddressId === addr.addressId}
                              onChange={() => setSelectedAddressId(addr.addressId)}
                              className="w-5 h-5 text-primary-600 mt-0.5 shrink-0"
                            />
                            <div className="flex-1 text-sm text-gray-700">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-gray-900">{addr.fullName}</span>
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded uppercase font-medium">{addr.addressLabel}</span>
                              </div>
                              <p className="font-medium text-gray-600">{addr.mobileNumber}</p>
                              <p className="mt-1 text-gray-500 leading-relaxed">{addr.line1}, {addr.line2 ? `${addr.line2}, ` : ''}{addr.city}, {addr.state} - {addr.pincode}</p>
                            </div>
                          </label>
                        ))
                      )}
                      
                      {addresses.length > 0 && (
                        <button
                          onClick={() => setStep(2)}
                          className="btn-primary w-full mt-6"
                        >
                          Proceed to Payment
                        </button>
                      )}
                    </div>
                  )}

                  {/* Add New Address Form */}
                  {showNewAddressForm && (
                    <form onSubmit={handleAddAddress} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name*</label>
                          <input
                            type="text"
                            required
                            value={newAddress.fullName}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, fullName: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                            placeholder="Full name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number*</label>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            value={newAddress.mobileNumber}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, mobileNumber: e.target.value.replace(/\D/g, '') }))}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                            placeholder="10-digit number"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1*</label>
                        <input
                          type="text"
                          required
                          value={newAddress.line1}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, line1: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                          placeholder="House/Flat number, Building, Street"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
                        <input
                          type="text"
                          value={newAddress.line2}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, line2: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                          placeholder="Landmark, Locality"
                        />
                      </div>
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City*</label>
                          <input
                            type="text"
                            required
                            value={newAddress.city}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State*</label>
                          <input
                            type="text"
                            required
                            value={newAddress.state}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                            placeholder="State"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Pincode*</label>
                          <input
                            type="text"
                            required
                            maxLength={6}
                            value={newAddress.pincode}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '') }))}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                            placeholder="Pincode"
                          />
                        </div>
                      </div>
                      <div className="flex gap-4 items-center">
                        <span className="text-sm font-medium text-gray-700">Label:</span>
                        {['Home', 'Work', 'Other'].map(label => (
                          <button
                            key={label}
                            type="button"
                            onClick={() => setNewAddress(prev => ({ ...prev, addressLabel: label }))}
                            className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition ${newAddress.addressLabel === label ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex gap-3 mt-6">
                        <button
                          type="submit"
                          disabled={busy}
                          className="btn-primary py-2.5 px-6 rounded-lg text-sm"
                        >
                          Save Address
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowNewAddressForm(false)}
                          className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Payment options */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold text-lg">Delivery Address</h2>
                    <button onClick={() => setStep(1)} className="text-sm text-primary-600 font-semibold hover:underline">Change</button>
                  </div>
                  {selectedAddress && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">
                      <p className="font-bold text-gray-800">{selectedAddress.fullName} (+91 {selectedAddress.mobileNumber})</p>
                      <p className="mt-1">{selectedAddress.line1}, {selectedAddress.line2 ? `${selectedAddress.line2}, ` : ''}{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm">
                  <h2 className="font-semibold text-lg mb-4">Payment Method</h2>
                  <div className="space-y-3">
                    {[
                      { mode: 'UPI', label: 'UPI (Google Pay, PhonePe, Paytm)' },
                      { mode: 'CARD', label: 'Credit / Debit Card' },
                      { mode: 'NET_BANKING', label: 'Net Banking' },
                      { mode: 'COD', label: 'Cash on Delivery (COD)' },
                      { mode: 'UPI_ON_DELIVERY', label: 'UPI on Delivery' }
                    ].map((m) => (
                      <label key={m.mode} className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer hover:border-primary-300 transition ${paymentMode === m.mode ? 'border-primary-600 bg-primary-50' : 'border-gray-200'}`}>
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMode === m.mode}
                          onChange={() => setPaymentMode(m.mode)}
                          className="w-5 h-5 text-primary-600"
                        />
                        <span className="font-medium text-gray-800">{m.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Instructions / Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="E.g., Drop at security gate, Ring doorbell..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm"
                      rows={2}
                    />
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={busy || !selectedAddressId}
                    className="btn-primary w-full mt-6 py-4 text-base font-bold flex justify-center items-center gap-2"
                  >
                    {busy ? <Loader2 size={20} className="animate-spin" /> : `Place Order - ₹${total}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-40 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">Order Summary</h3>
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-1">
                {cartItems.map(item => (
                  <div key={`${item.id}-${item.variant}`} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-50 border shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity} {item.variant ? `(${item.variant})` : ''}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Coupon input */}
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  placeholder="Coupon code"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 font-semibold"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={busy}
                  className="px-4 py-2 bg-primary-50 text-primary-600 rounded-lg text-sm font-semibold hover:bg-primary-100 transition shrink-0"
                >
                  Apply
                </button>
              </div>

              <hr className="my-4" />
              
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{cartTotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className={deliveryFee === 0 ? 'text-green-600 font-semibold' : ''}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </span>
                </div>
                {taxAmount > 0 && (
                  <div className="flex justify-between text-gray-500 text-xs">
                    <span>Taxes & Charges</span>
                    <span>₹{taxAmount}</span>
                  </div>
                )}
                <hr className="my-3" />
                <div className="flex justify-between text-base font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span>₹{total}</span>
                </div>
              </div>
              
              <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
                <Shield size={14} className="text-primary-600 shrink-0" />
                <span>Secure payments & 100% genuine products guarantee.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
