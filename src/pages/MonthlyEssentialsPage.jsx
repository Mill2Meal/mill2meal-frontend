import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, Users, Check, ShoppingCart, Loader2, ArrowLeft, Calendar, MapPin, CreditCard, ChevronRight, X, Plus } from 'lucide-react'
import { api, getAbsoluteImageUrl } from '../lib/api'
import { useCart } from '../context/CartContext'

export default function MonthlyEssentialsPage() {
  const [kits, setKits] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyKitId, setBusyKitId] = useState(null)
  
  // Modal & Drawer states
  const [activeModalKit, setActiveModalKit] = useState(null)
  const [activeDrawerKit, setActiveDrawerKit] = useState(null)
  const [subscriptionStep, setSubscriptionStep] = useState(1)
  
  // Subscription Setup states
  const [selectedFrequency, setSelectedFrequency] = useState('MONTHLY')
  const [startDate, setStartDate] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  })
  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  
  // New Address Form state
  const [newAddress, setNewAddress] = useState({
    addressLabel: 'Home',
    recipientName: '',
    recipientMobile: '',
    line1: '',
    line2: '',
    landmark: '',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '',
    addressType: 'HOME'
  })
  const [addressError, setAddressError] = useState('')
  
  // Success states
  const [createdSubscription, setCreatedSubscription] = useState(null)
  const [submittingSubscription, setSubmittingSubscription] = useState(false)

  const navigate = useNavigate()
  const { fetchCart } = useCart()

  const isLoggedIn = () => !!localStorage.getItem('accessToken')

  useEffect(() => {
    async function loadBaskets() {
      setLoading(true)
      try {
        const response = await api.baskets.list()
        const basketsList = response?.items || response || []
        
        // Fetch detailed items for each basket in parallel
        const detailedKits = await Promise.all(
          basketsList.map(async (basket) => {
            try {
              const details = await api.baskets.get(basket.slug)
              const items = details.items?.map(i => `${i.product.productName} (Qty: ${i.quantity})`) || []
              const parsedPrice = parseFloat(basket.basketPrice) || 0
              const parsedSavings = parseFloat(basket.savingsAmount || '0') || 0
              
              // Map family sizes based on names
              let size = '4-5 members'
              if (basket.basketName.toLowerCase().includes('small')) size = '2-3 members'
              if (basket.basketName.toLowerCase().includes('large')) size = '6+ members'

              return {
                ...basket,
                id: basket.basketId,
                name: basket.basketName,
                size,
                price: parsedPrice,
                originalPrice: parsedPrice + parsedSavings,
                items,
                popular: basket.basketName.toLowerCase().includes('medium') || basket.basketName.toLowerCase().includes('family'),
                rawDetails: details
              }
            } catch (err) {
              console.error(err)
              return {
                ...basket,
                id: basket.basketId,
                name: basket.basketName,
                size: '4-5 members',
                price: parseFloat(basket.basketPrice) || 0,
                originalPrice: parseFloat(basket.basketPrice) || 0,
                items: [],
                popular: false,
                rawDetails: null
              }
            }
          })
        )
        setKits(detailedKits)
      } catch (err) {
        console.error('Failed to load monthly essentials:', err)
      } finally {
        setLoading(false)
      }
    }
    loadBaskets()
  }, [])

  // Load addresses when starting subscription flow
  const loadAddresses = async () => {
    setLoadingAddresses(true)
    try {
      const addressData = await api.addresses.list()
      const list = addressData?.items || addressData || []
      setAddresses(list)
      if (list.length > 0) {
        // Pre-select default address or first address
        const defaultAddr = list.find(a => a.isDefault)
        setSelectedAddressId(defaultAddr ? defaultAddr.addressId : list[0].addressId)
      }
    } catch (err) {
      console.error('Failed to load addresses:', err)
    } finally {
      setLoadingAddresses(false)
    }
  }

  const handleStartSubscription = (kit) => {
    if (!isLoggedIn()) {
      navigate('/login?redirect=/monthly-essentials')
      return
    }
    setActiveDrawerKit(kit)
    setSubscriptionStep(1)
    loadAddresses()
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    setAddressError('')
    if (!newAddress.recipientName || !newAddress.recipientMobile || !newAddress.line1 || !newAddress.pincode) {
      setAddressError('Please fill in all required fields.')
      return
    }
    if (newAddress.recipientMobile.length !== 10) {
      setAddressError('Mobile number must be 10 digits.')
      return
    }
    if (newAddress.pincode.length !== 6) {
      setAddressError('Pincode must be 6 digits.')
      return
    }

    try {
      const addedAddress = await api.addresses.create({
        ...newAddress,
        serviceabilityStatus: 'SERVICEABLE' // assume Hyderabad locations are serviceable
      })
      
      const refreshedData = await api.addresses.list()
      const list = refreshedData?.items || refreshedData || []
      setAddresses(list)
      setSelectedAddressId(addedAddress.addressId || list[list.length - 1]?.addressId)
      setShowAddressForm(false)
      // Reset form
      setNewAddress({
        addressLabel: 'Home',
        recipientName: '',
        recipientMobile: '',
        line1: '',
        line2: '',
        landmark: '',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '',
        addressType: 'HOME'
      })
    } catch (err) {
      console.error(err)
      setAddressError(err.message || 'Failed to save address')
    }
  }

  const submitSubscriptionFlow = async () => {
    if (!selectedAddressId) {
      alert('Please select or add a delivery address.')
      return
    }
    setSubmittingSubscription(true)
    try {
      const response = await api.subscriptions.create({
        subscriptionName: activeDrawerKit.name,
        subscriptionType: 'MONTHLY_BASKET',
        frequency: selectedFrequency,
        startDate: startDate,
        deliveryAddressId: selectedAddressId,
        pricePerCycle: activeDrawerKit.price,
        items: activeDrawerKit.rawDetails?.items?.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: activeDrawerKit.price / (activeDrawerKit.rawDetails.items.length || 1)
        })) || []
      })
      setCreatedSubscription(response)
      setSubscriptionStep(7) // Go to success screen
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to create subscription')
    } finally {
      setSubmittingSubscription(false)
    }
  }

  const handleBuyOnce = async (kitId) => {
    if (!isLoggedIn()) {
      navigate('/login?redirect=/monthly-essentials')
      return
    }

    setBusyKitId(kitId)
    try {
      await api.baskets.addToCart(kitId)
      await fetchCart()
      navigate('/cart')
    } catch (err) {
      console.error('Failed to add basket to cart:', err)
    } finally {
      setBusyKitId(null)
    }
  }

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center gap-2 text-gray-500 font-semibold">
        <Loader2 className="animate-spin text-primary-600 animate-spin" /> Loading monthly kits...
      </div>
    )
  }

  return (
    <div className="pb-20 lg:pb-0 bg-gray-50 min-h-screen relative">
      {/* Back to Home Button */}
      <div className="bg-white border-b border-gray-100 py-3">
        <div className="container-custom flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary-600 transition">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <span className="text-xs text-gray-400 font-mono">D2C Exclusive Staples</span>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-secondary-500 to-secondary-700 py-12 md:py-16">
        <div className="container-custom text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm mb-4">
            <Package size={16} /> Save up to 20%
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-3">Monthly Essentials Kits</h1>
          <p className="text-secondary-100 text-lg max-w-2xl mx-auto">Pre-curated family baskets with all your kitchen staples. Order once, get delivered every month.</p>
        </div>
      </div>

      <div className="container-custom py-12">
        {kits.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">No monthly essentials kits are currently configured.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {kits.map(kit => {
              const savings = kit.originalPrice - kit.price
              return (
                <div key={kit.id} className={`card flex flex-col justify-between p-6 relative bg-white border ${kit.popular ? 'border-2 border-primary-500 ring-2 ring-primary-100' : 'border-gray-200'}`}>
                  {kit.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-bold px-4 py-1 rounded-full z-10">Most Popular</span>
                  )}
                  
                  <div>
                    {/* Basket Image */}
                    <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden mb-4 border cursor-pointer" onClick={() => setActiveModalKit(kit)}>
                      <img 
                        src={getAbsoluteImageUrl(kit.imageUrl)} 
                        alt={kit.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                        {kit.rawDetails?.items?.length || 0} Products
                      </span>
                    </div>

                    <div className="text-center mb-4">
                      <h3 
                        className="text-xl font-heading font-bold text-gray-900 leading-snug hover:text-primary-600 cursor-pointer"
                        onClick={() => setActiveModalKit(kit)}
                      >
                        {kit.name}
                      </h3>
                      <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mt-2">
                        <span className="flex items-center gap-1"><Users size={12} /> {kit.size}</span>
                        <span className="flex items-center gap-1"><Calendar size={12} /> 30 Days Estimate</span>
                      </div>
                      
                      <div className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100 inline-block w-full">
                        <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                          <span>Total MRP:</span>
                          <span className="line-through">₹{kit.originalPrice}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-semibold text-gray-900 mb-1">
                          <span>Bundle Price:</span>
                          <span className="text-lg font-bold text-primary-600">₹{kit.price}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-semibold text-green-600 border-t border-gray-200/60 pt-1.5">
                          <span>You Save:</span>
                          <span>₹{savings} ({Math.round((savings / kit.originalPrice) * 100)}% Off)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <button
                      onClick={() => handleStartSubscription(kit)}
                      disabled={busyKitId === kit.id}
                      className="w-full btn-primary flex items-center justify-center gap-2 py-2.5"
                    >
                      <Package size={18} />
                      Subscribe
                    </button>
                    <button
                      onClick={() => handleBuyOnce(kit.id)}
                      disabled={busyKitId === kit.id}
                      className="w-full btn-outline text-sm py-2.5 flex justify-center items-center gap-1.5"
                    >
                      Buy Once
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 1. Basket Detail Modal */}
      {activeModalKit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveModalKit(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[85vh] flex flex-col z-10 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-2xl font-bold font-heading text-gray-900">{activeModalKit.name}</h3>
                <p className="text-sm text-gray-500">Includes staples for {activeModalKit.size}</p>
              </div>
              <button onClick={() => setActiveModalKit(null)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex flex-col sm:flex-row gap-6 mb-6">
                <div className="w-full sm:w-1/3 h-32 bg-gray-100 rounded-2xl overflow-hidden border">
                  <img src={getAbsoluteImageUrl(activeModalKit.imageUrl)} alt={activeModalKit.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 p-2.5 rounded-lg border">
                      <p className="text-xs text-gray-400">Products Count</p>
                      <p className="font-bold text-gray-800">{activeModalKit.rawDetails?.items?.length || 0} Items</p>
                    </div>
                    <div className="bg-gray-50 p-2.5 rounded-lg border">
                      <p className="text-xs text-gray-400">Duration Estimate</p>
                      <p className="font-bold text-gray-800">30 Days Staples</p>
                    </div>
                  </div>
                  <div className="bg-green-50/60 p-3 rounded-lg border border-green-100 flex justify-between items-center text-sm font-semibold">
                    <span className="text-green-800">Your Monthly Savings:</span>
                    <span className="text-green-700 text-base font-bold">₹{activeModalKit.originalPrice - activeModalKit.price}</span>
                  </div>
                </div>
              </div>

              <h4 className="font-bold text-gray-800 text-sm mb-3">Included Products List</h4>
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 font-semibold text-xs border-b">
                    <tr>
                      <th className="p-3">Product Name</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Pack Size</th>
                      <th className="p-3 text-right">MRP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {activeModalKit.rawDetails?.items?.map((item) => (
                      <tr key={item.productId} className="hover:bg-gray-50/50">
                        <td className="p-3 font-medium text-gray-800">{item.product.productName}</td>
                        <td className="p-3 text-center font-bold text-gray-600">{item.quantity}</td>
                        <td className="p-3 text-right text-gray-500">{item.product.packSize}</td>
                        <td className="p-3 text-right text-gray-600 font-mono">₹{parseFloat(item.product.mrp) * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
              <div>
                <span className="text-xs text-gray-400 block">Bundle Price</span>
                <span className="text-2xl font-black text-primary-600 font-heading">₹{activeModalKit.price}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setActiveModalKit(null); handleBuyOnce(activeModalKit.id) }} 
                  className="btn-outline px-4 py-2 text-sm bg-white border-gray-200 text-gray-700"
                >
                  Buy Once
                </button>
                <button 
                  onClick={() => { setActiveModalKit(null); handleStartSubscription(activeModalKit) }} 
                  className="btn-primary px-6 py-2 text-sm"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. 7-Step Subscription Setup Drawer */}
      {activeDrawerKit && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setActiveDrawerKit(null)} />
          <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250">
            {/* Drawer Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <span className="text-xs font-semibold text-primary-600 uppercase tracking-widest">Step {subscriptionStep} of 7</span>
                <h3 className="text-lg font-bold text-gray-900 mt-0.5">Setup Subscription</h3>
              </div>
              <button onClick={() => setActiveDrawerKit(null)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 h-1.5 shrink-0">
              <div 
                className="bg-primary-600 h-full transition-all duration-300"
                style={{ width: `${(subscriptionStep / 7) * 100}%` }}
              />
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* STEP 1: Basket Summary */}
              {subscriptionStep === 1 && (
                <div className="space-y-4">
                  <div className="border rounded-2xl overflow-hidden bg-gray-50 p-4">
                    <img src={getAbsoluteImageUrl(activeDrawerKit.imageUrl)} alt={activeDrawerKit.name} className="w-full h-36 object-cover rounded-xl border mb-3" />
                    <h4 className="font-bold text-gray-950 text-lg leading-tight">{activeDrawerKit.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">Preselected basket configuration</p>
                  </div>
                  <div className="space-y-2.5 text-sm border-t pt-4">
                    <div className="flex justify-between"><span className="text-gray-500">Products Count:</span><span className="font-semibold text-gray-800">{activeDrawerKit.rawDetails?.items?.length || 0} Items</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Staple Duration:</span><span className="font-semibold text-gray-800">30 Days Estimate</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Cycle Price (with discount):</span><span className="font-bold text-primary-600 text-base">₹{activeDrawerKit.price}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Staple Savings:</span><span className="font-bold text-green-600">₹{activeDrawerKit.originalPrice - activeDrawerKit.price}</span></div>
                  </div>
                </div>
              )}

              {/* STEP 2: Choose Frequency */}
              {subscriptionStep === 2 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Select Delivery Frequency</h4>
                  <p className="text-xs text-gray-400 -mt-2">Choose how often you would like your basket delivered.</p>
                  <div className="space-y-3">
                    {[
                      { value: 'WEEKLY', title: 'Every Week', desc: 'Ideal for fast consuming items' },
                      { value: 'FORTNIGHTLY', title: 'Every 2 Weeks', desc: 'Ideal for medium sized households' },
                      { value: 'MONTHLY', title: 'Every Month (Recommended)', desc: 'Standard Staples replenishing cycle' }
                    ].map(freq => (
                      <label 
                        key={freq.value}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${selectedFrequency === freq.value ? 'border-primary-600 bg-primary-50/50' : 'border-gray-100 hover:border-gray-200'}`}
                      >
                        <input
                          type="radio"
                          name="frequency"
                          value={freq.value}
                          checked={selectedFrequency === freq.value}
                          onChange={() => setSelectedFrequency(freq.value)}
                          className="mt-1 text-primary-600 focus:ring-primary-500"
                        />
                        <div>
                          <p className="font-bold text-sm text-gray-900">{freq.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{freq.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: Choose Start Date */}
              {subscriptionStep === 3 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Choose Subscription Start Date</h4>
                  <p className="text-xs text-gray-400 -mt-2">Pick a date when the first shipment of your basket will be generated.</p>
                  <div className="bg-gray-50 p-4 border rounded-xl flex items-center gap-3">
                    <Calendar className="text-primary-600 shrink-0" size={24} />
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-400 mb-1">First Delivery Start Date</label>
                      <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // Min tomorrow
                        className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-primary-500 font-semibold"
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-800 leading-relaxed border border-amber-100">
                    <strong>Note:</strong> Subscription orders are generated automatically at 12:00 AM on your delivery days. Delivery completes within 24 hours.
                  </div>
                </div>
              )}

              {/* STEP 4: Select Address */}
              {subscriptionStep === 4 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-gray-900">Select Delivery Address</h4>
                    {!showAddressForm && (
                      <button 
                        onClick={() => setShowAddressForm(true)}
                        className="text-xs text-primary-600 hover:text-primary-700 font-bold flex items-center gap-0.5"
                      >
                        <Plus size={14} /> Add New
                      </button>
                    )}
                  </div>

                  {showAddressForm ? (
                    <form onSubmit={handleAddAddress} className="space-y-3 bg-gray-50 border p-4 rounded-xl">
                      <div className="flex justify-between items-center border-b pb-2 mb-2">
                        <span className="text-xs font-bold text-gray-700">New Address Details</span>
                        <button type="button" onClick={() => setShowAddressForm(false)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                      </div>

                      {addressError && <p className="text-xs text-red-500 font-semibold">{addressError}</p>}

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] text-gray-400 font-semibold mb-0.5">Recipient Name *</label>
                          <input 
                            type="text" 
                            required
                            value={newAddress.recipientName}
                            onChange={e => setNewAddress(prev => ({ ...prev, recipientName: e.target.value }))}
                            placeholder="Full name"
                            className="w-full border rounded p-1.5 focus:outline-none focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 font-semibold mb-0.5">Mobile Number (10 digit) *</label>
                          <input 
                            type="tel" 
                            required
                            maxLength={10}
                            value={newAddress.recipientMobile}
                            onChange={e => setNewAddress(prev => ({ ...prev, recipientMobile: e.target.value.replace(/\D/g, '') }))}
                            placeholder="Mobile number"
                            className="w-full border rounded p-1.5 focus:outline-none focus:border-primary-500"
                          />
                        </div>
                      </div>

                      <div className="text-xs">
                        <label className="block text-[10px] text-gray-400 font-semibold mb-0.5">Address Line 1 *</label>
                        <input 
                          type="text" 
                          required
                          value={newAddress.line1}
                          onChange={e => setNewAddress(prev => ({ ...prev, line1: e.target.value }))}
                          placeholder="House No, Apartment Name, Street Name"
                          className="w-full border rounded p-1.5 focus:outline-none focus:border-primary-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] text-gray-400 font-semibold mb-0.5">Line 2 (Optional)</label>
                          <input 
                            type="text" 
                            value={newAddress.line2}
                            onChange={e => setNewAddress(prev => ({ ...prev, line2: e.target.value }))}
                            placeholder="Floor, Block etc."
                            className="w-full border rounded p-1.5 focus:outline-none focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 font-semibold mb-0.5">Landmark</label>
                          <input 
                            type="text" 
                            value={newAddress.landmark}
                            onChange={e => setNewAddress(prev => ({ ...prev, landmark: e.target.value }))}
                            placeholder="Nearby reference"
                            className="w-full border rounded p-1.5 focus:outline-none focus:border-primary-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] text-gray-400 font-semibold mb-0.5">City</label>
                          <input type="text" readOnly value="Hyderabad" className="w-full border rounded p-1.5 bg-gray-100" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 font-semibold mb-0.5">State</label>
                          <input type="text" readOnly value="Telangana" className="w-full border rounded p-1.5 bg-gray-100" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 font-semibold mb-0.5">Pincode (6 digit) *</label>
                          <input 
                            type="text" 
                            required
                            maxLength={6}
                            value={newAddress.pincode}
                            onChange={e => setNewAddress(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '') }))}
                            placeholder="500081"
                            className="w-full border rounded p-1.5 focus:outline-none focus:border-primary-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] text-gray-400 font-semibold mb-0.5">Address Label</label>
                          <input 
                            type="text" 
                            value={newAddress.addressLabel}
                            onChange={e => setNewAddress(prev => ({ ...prev, addressLabel: e.target.value }))}
                            placeholder="Home, Office, Work"
                            className="w-full border rounded p-1.5 focus:outline-none focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 font-semibold mb-0.5">Address Type</label>
                          <select 
                            value={newAddress.addressType}
                            onChange={e => setNewAddress(prev => ({ ...prev, addressType: e.target.value }))}
                            className="w-full border rounded p-1.5 focus:outline-none"
                          >
                            <option value="HOME">HOME</option>
                            <option value="WORK">WORK</option>
                            <option value="OTHER">OTHER</option>
                          </select>
                        </div>
                      </div>

                      <button type="submit" className="w-full btn-primary text-xs py-2 mt-2">Save Address</button>
                    </form>
                  ) : (
                    <div className="space-y-2">
                      {loadingAddresses ? (
                        <div className="flex justify-center items-center py-6 text-gray-400"><Loader2 className="animate-spin text-primary-500 mr-2" size={16} /> Loading addresses...</div>
                      ) : addresses.length === 0 ? (
                        <div className="text-center p-6 border border-dashed rounded-xl bg-gray-50/50">
                          <p className="text-xs text-gray-500 mb-2">No saved addresses found.</p>
                          <button onClick={() => setShowAddressForm(true)} className="btn-primary text-xs px-4 py-1.5">Add Address</button>
                        </div>
                      ) : (
                        addresses.map(addr => (
                          <label 
                            key={addr.addressId}
                            className={`flex items-start gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition ${selectedAddressId === addr.addressId ? 'border-primary-600 bg-primary-50/30' : 'border-gray-100 hover:border-gray-200'}`}
                          >
                            <input
                              type="radio"
                              name="address"
                              value={addr.addressId}
                              checked={selectedAddressId === addr.addressId}
                              onChange={() => setSelectedAddressId(addr.addressId)}
                              className="mt-1 text-primary-600 focus:ring-primary-500"
                            />
                            <div className="text-xs leading-normal">
                              <span className="font-bold text-gray-900 border border-gray-300 rounded px-1.5 py-0.5 bg-gray-50 mr-1 text-[9px] uppercase tracking-wider">{addr.addressLabel || addr.addressType}</span>
                              <strong className="text-gray-950">{addr.recipientName}</strong> <span className="text-gray-400">({addr.recipientMobile})</span>
                              <p className="text-gray-500 mt-1">{addr.line1}, {addr.line2 && `${addr.line2}, `}{addr.landmark && `Near ${addr.landmark}, `}{addr.city}, {addr.state} - <span className="font-semibold text-gray-800">{addr.pincode}</span></p>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: Payment Mode */}
              {subscriptionStep === 5 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Choose Subscription Payment Method</h4>
                  <p className="text-xs text-gray-400 -mt-2">Pay Per Delivery mode allows hassle-free recurring deliveries with payments collected only at delivery.</p>
                  
                  <div className="p-4 rounded-xl border-2 border-primary-600 bg-primary-50/50 flex items-start gap-3">
                    <CreditCard className="text-primary-600 shrink-0 mt-0.5" size={20} />
                    <div className="text-xs">
                      <p className="font-bold text-gray-900">Pay Per Delivery (Preselected)</p>
                      <p className="text-gray-500 mt-1">Payment is collected during delivery using Cash or UPI. No advance lock-in required!</p>
                      <span className="inline-block bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded text-[10px] mt-2 uppercase tracking-wide">Highly Convenient</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: Review Subscription */}
              {subscriptionStep === 6 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Review Details</h4>
                  <p className="text-xs text-gray-400 -mt-2">Confirm details below before starting your subscription.</p>

                  <div className="border rounded-xl divide-y text-xs">
                    <div className="p-3 bg-gray-50/70">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-1">Basket Details</span>
                      <strong className="text-gray-900">{activeDrawerKit.name}</strong>
                      <span className="text-gray-500 block mt-0.5">₹{activeDrawerKit.price} / cycle ({activeDrawerKit.rawDetails?.items?.length || 0} items)</span>
                    </div>
                    <div className="p-3">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-1">Frequency</span>
                      <strong className="text-gray-800">{selectedFrequency}</strong>
                    </div>
                    <div className="p-3">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-1">First Scheduled Ship Date</span>
                      <strong className="text-gray-800">{new Date(startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                    </div>
                    <div className="p-3">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-1">Shipping Destination</span>
                      {addresses.find(a => a.addressId === selectedAddressId) ? (
                        <p className="text-gray-600 mt-1">
                          <strong>{addresses.find(a => a.addressId === selectedAddressId).recipientName}</strong><br />
                          {addresses.find(a => a.addressId === selectedAddressId).line1}, {addresses.find(a => a.addressId === selectedAddressId).pincode}
                        </p>
                      ) : (
                        <span className="text-red-500 font-semibold">No address selected</span>
                      )}
                    </div>
                    <div className="p-3">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block mb-1">Billing Arrangement</span>
                      <strong className="text-gray-800">Pay Per Delivery</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 7: Success Screen */}
              {subscriptionStep === 7 && createdSubscription && (
                <div className="space-y-6 text-center py-6">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <Check size={36} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 font-heading">Subscription Active!</h4>
                    <p className="text-sm text-gray-500 mt-2">Staples will replenish automatically. Your Subscription ID is:</p>
                    <p className="text-sm font-mono font-bold bg-gray-100 p-2 rounded border border-gray-200 mt-2 inline-block max-w-full truncate">{createdSubscription.subscriptionId}</p>
                  </div>
                  
                  <div className="border p-4 rounded-xl text-left bg-gray-50 text-xs space-y-2">
                    <p className="flex justify-between"><span className="text-gray-400">Basket Name:</span><span className="font-semibold text-gray-800">{activeDrawerKit.name}</span></p>
                    <p className="flex justify-between"><span className="text-gray-400">Recurring Price:</span><span className="font-bold text-primary-600">₹{activeDrawerKit.price}</span></p>
                    <p className="flex justify-between"><span className="text-gray-400">Next Scheduled Delivery:</span><span className="font-semibold text-gray-800">
                      {createdSubscription.nextDeliveryDate 
                        ? new Date(createdSubscription.nextDeliveryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : new Date(startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                      }
                    </span></p>
                  </div>

                  <div className="pt-4 space-y-2">
                    <button 
                      onClick={() => { setActiveDrawerKit(null); navigate('/subscriptions') }} 
                      className="w-full btn-primary py-2.5 text-sm"
                    >
                      View Subscriptions
                    </button>
                    <button 
                      onClick={() => setActiveDrawerKit(null)} 
                      className="w-full btn-outline py-2.5 text-sm bg-white"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer (Actions) */}
            {subscriptionStep < 7 && (
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
                <button
                  disabled={subscriptionStep === 1 || submittingSubscription}
                  onClick={() => setSubscriptionStep(prev => prev - 1)}
                  className="btn-outline px-4 py-2 text-xs font-semibold bg-white disabled:opacity-40"
                >
                  Back
                </button>
                
                {subscriptionStep === 6 ? (
                  <button
                    disabled={submittingSubscription || !selectedAddressId}
                    onClick={submitSubscriptionFlow}
                    className="btn-primary px-6 py-2 text-xs font-bold flex items-center gap-1"
                  >
                    {submittingSubscription ? <Loader2 size={14} className="animate-spin" /> : null}
                    Confirm Subscription
                  </button>
                ) : (
                  <button
                    disabled={showAddressForm || (subscriptionStep === 4 && !selectedAddressId)}
                    onClick={() => setSubscriptionStep(prev => prev + 1)}
                    className="btn-primary px-6 py-2 text-xs font-bold inline-flex items-center gap-0.5"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

