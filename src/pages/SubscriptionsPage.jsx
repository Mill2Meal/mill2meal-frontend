import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, Calendar, Check, AlertCircle, Loader2, Minus, Plus, CalendarDays } from 'lucide-react'
import { api } from '../lib/api'

export default function SubscriptionsPage() {
  const navigate = useNavigate()
  const [activeSubscriptions, setActiveSubscriptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState(null)
  
  // Track which subscription has its calendar open
  const [openCalendarId, setOpenCalendarId] = useState(null)

  const isLoggedIn = () => !!localStorage.getItem('accessToken')

  async function loadSubscriptions() {
    if (!isLoggedIn()) return
    setLoading(true)
    try {
      const response = await api.subscriptions.list()
      const list = response?.items || response || []
      setActiveSubscriptions(list)
    } catch (err) {
      console.error('Failed to load subscriptions:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubscriptions()
  }, [])

  const handlePause = async (id) => {
    setBusyId(id)
    try {
      await api.subscriptions.pause(id, 'User requested pause')
      await loadSubscriptions()
      alert('Subscription paused successfully')
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to pause subscription')
    } finally {
      setBusyId(null)
    }
  }

  const handleResume = async (id) => {
    setBusyId(id)
    try {
      await api.subscriptions.resume(id)
      await loadSubscriptions()
      alert('Subscription resumed successfully')
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to resume subscription')
    } finally {
      setBusyId(null)
    }
  }

  const handleSkip = async (id) => {
    setBusyId(id)
    try {
      await api.subscriptions.skip(id)
      await loadSubscriptions()
      alert('Skipped next delivery')
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to skip delivery')
    } finally {
      setBusyId(null)
    }
  }

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return
    setBusyId(id)
    try {
      await api.subscriptions.cancel(id, 'User requested cancellation')
      await loadSubscriptions()
      alert('Subscription cancelled successfully')
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to cancel subscription')
    } finally {
      setBusyId(null)
    }
  }

  const handleUpdateQuantity = async (sub, productId, newQty) => {
    if (newQty < 1) return
    setBusyId(sub.subscriptionId)
    try {
      const updatedItems = sub.items.map(item => ({
        productId: item.productId,
        quantity: item.productId === productId ? newQty : item.quantity,
        unitPrice: parseFloat(item.unitPrice)
      }))

      // Recalculate pricePerCycle
      const pricePerCycle = updatedItems.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0)

      await api.subscriptions.update(sub.subscriptionId, {
        items: updatedItems,
        pricePerCycle
      })
      
      await loadSubscriptions()
      alert('Subscription updated successfully!')
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to update subscription quantity')
    } finally {
      setBusyId(null)
    }
  }

  // Generate 4 upcoming delivery dates based on startDate/nextDeliveryDate and frequency
  const getUpcomingDeliveries = (startDate, nextDeliveryDate, frequency) => {
    const dates = []
    let baseDate = nextDeliveryDate ? new Date(nextDeliveryDate) : new Date(startDate)
    
    // If the base date is in the past, adjust it to tomorrow
    if (baseDate < new Date()) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      baseDate = tomorrow
    }

    let intervalDays = 30
    if (frequency === 'WEEKLY') intervalDays = 7
    if (frequency === 'FORTNIGHTLY') intervalDays = 14
    if (frequency === 'MONTHLY') intervalDays = 30

    for (let i = 0; i < 4; i++) {
      const futureDate = new Date(baseDate.getTime())
      futureDate.setDate(baseDate.getDate() + (i * intervalDays))
      dates.push(futureDate)
    }
    return dates
  }

  return (
    <div className="pb-20 lg:pb-0 bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-700 to-primary-900 py-12 md:py-16">
        <div className="container-custom text-center">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-3">Subscriptions</h1>
          <p className="text-primary-100 text-lg max-w-2xl mx-auto">Never run out of essentials. Subscribe and save up to 20% with free monthly delivery.</p>
        </div>
      </div>

      <div className="container-custom py-12">
        {/* User Active Subscriptions */}
        {isLoggedIn() ? (
          <div>
            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">My Subscriptions</h2>
            {loading ? (
              <div className="flex justify-center items-center py-10 text-gray-500 font-semibold">
                <Loader2 className="animate-spin text-primary-600 mr-2" /> Loading subscriptions...
              </div>
            ) : activeSubscriptions.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
                <p className="text-gray-500 text-sm">You have no active subscription plans currently.</p>
                <Link to="/monthly-essentials" className="btn-primary inline-block text-xs py-2 px-4 mt-4">Browse Baskets</Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {activeSubscriptions.map((sub) => {
                  const nextDelivery = sub.nextDeliveryDate ? new Date(sub.nextDeliveryDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  }) : 'Not Scheduled'

                  const upcomingDates = getUpcomingDeliveries(sub.startDate, sub.nextDeliveryDate, sub.frequency)

                  return (
                    <div key={sub.subscriptionId} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                      <div>
                        {/* Header details */}
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-[10px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded uppercase tracking-wider">
                              Frequency: {sub.frequency}
                            </span>
                            <h3 className="font-bold text-gray-900 mt-2 font-heading text-lg">{sub.subscriptionName || 'Staples Basket'}</h3>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                            sub.subscriptionStatus === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                            sub.subscriptionStatus === 'PAUSED' ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {sub.subscriptionStatus}
                          </span>
                        </div>

                        {/* Subscription Items List with Quantity Toggles */}
                        <div className="border border-gray-100 rounded-xl bg-gray-50/50 p-4 mb-4">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Subscription Items</h4>
                          <div className="space-y-3">
                            {sub.items?.map((item) => (
                              <div key={item.subscriptionItemId} className="flex justify-between items-center text-xs">
                                <span className="font-medium text-gray-800 flex-1 pr-2 truncate">
                                  {item.product?.productName || item.productNameSnapshot || 'Essential Item'}
                                </span>
                                
                                {sub.subscriptionStatus === 'ACTIVE' ? (
                                  <div className="flex items-center gap-2 border bg-white rounded-lg p-1">
                                    <button 
                                      disabled={busyId === sub.subscriptionId || item.quantity <= 1}
                                      onClick={() => handleUpdateQuantity(sub, item.productId, item.quantity - 1)}
                                      className="p-1 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30"
                                    >
                                      <Minus size={12} />
                                    </button>
                                    <span className="w-5 text-center font-bold text-gray-700">{item.quantity}</span>
                                    <button 
                                      disabled={busyId === sub.subscriptionId}
                                      onClick={() => handleUpdateQuantity(sub, item.productId, item.quantity + 1)}
                                      className="p-1 hover:bg-gray-100 rounded text-gray-500"
                                    >
                                      <Plus size={12} />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="font-semibold text-gray-600">Qty: {item.quantity}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <p className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1"><Calendar size={14} /> Next Delivery Date:</span>
                            <span className="font-bold text-gray-800">{nextDelivery}</span>
                          </p>
                          <p className="flex items-center justify-between font-semibold text-primary-700 pt-1.5 border-t border-gray-200">
                            <span>Cycle Total Price:</span>
                            <span>₹{sub.pricePerCycle || 0}</span>
                          </p>
                        </div>
                      </div>

                      {/* Calendar Deliveries Schedule toggler */}
                      {sub.subscriptionStatus === 'ACTIVE' && (
                        <div className="mb-4">
                          <button 
                            onClick={() => setOpenCalendarId(openCalendarId === sub.subscriptionId ? null : sub.subscriptionId)}
                            className="w-full border border-gray-200 hover:bg-gray-50 rounded-xl p-2.5 flex items-center justify-between text-xs text-gray-700 transition"
                          >
                            <span className="flex items-center gap-1.5 font-semibold"><CalendarDays size={15} className="text-primary-600" /> View Upcoming Deliveries</span>
                            <span className="text-gray-400 font-bold">{openCalendarId === sub.subscriptionId ? 'Hide' : 'Show'}</span>
                          </button>

                          {openCalendarId === sub.subscriptionId && (
                            <div className="mt-2 p-3 bg-primary-50/40 border border-primary-100 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
                              <p className="text-[10px] font-bold text-primary-700 uppercase tracking-widest mb-1.5">Estimated Shipments Schedule</p>
                              {upcomingDates.map((date, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs text-gray-600 border-b border-dashed border-gray-200 last:border-b-0 pb-1 last:pb-0">
                                  <span>Delivery #{idx + 1}</span>
                                  <span className="font-semibold text-gray-800">
                                    {date.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                        {sub.subscriptionStatus === 'ACTIVE' ? (
                          <>
                            <button
                              disabled={busyId === sub.subscriptionId}
                              onClick={() => handlePause(sub.subscriptionId)}
                              className="px-4 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl text-xs font-bold transition"
                            >
                              Pause
                            </button>
                            <button
                              disabled={busyId === sub.subscriptionId}
                              onClick={() => handleSkip(sub.subscriptionId)}
                              className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition"
                            >
                              Skip Next
                            </button>
                          </>
                        ) : sub.subscriptionStatus === 'PAUSED' ? (
                          <button
                            disabled={busyId === sub.subscriptionId}
                            onClick={() => handleResume(sub.subscriptionId)}
                            className="px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl text-xs font-bold transition"
                          >
                            Resume
                          </button>
                        ) : null}
                        
                        {sub.subscriptionStatus !== 'CANCELLED' && (
                          <button
                            disabled={busyId === sub.subscriptionId}
                            onClick={() => handleCancel(sub.subscriptionId)}
                            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition ml-auto"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center bg-white p-12 rounded-2xl border border-gray-100 shadow-sm max-w-md mx-auto">
            <Package className="text-gray-300 mx-auto mb-4" size={48} />
            <h2 className="text-xl font-bold font-heading text-gray-900 mb-2">Subscribe to Staples</h2>
            <p className="text-gray-500 text-sm mb-6">Create subscriptions for pre-curated baskets of fresh daily groceries. Lock in discounts and enjoy auto-delivery.</p>
            <Link to="/login?redirect=/subscriptions" className="btn-primary py-2.5 px-6 text-sm inline-block">Login to View Subscriptions</Link>
          </div>
        )}

        {/* Benefits */}
        <div className="mt-16 text-center">
          <h2 className="section-title mb-8 font-heading font-bold text-2xl text-gray-900">Why Subscribe?</h2>
          <div className="grid sm:grid-cols-3 gap-8 text-sm">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-3 bg-primary-100 rounded-2xl flex items-center justify-center"><Package size={24} className="text-primary-600" /></div>
              <h3 className="font-semibold mb-1 text-base text-gray-800">Save More</h3>
              <p className="text-gray-500">Up to 20% off on subscription orders</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-3 bg-primary-100 rounded-2xl flex items-center justify-center"><Calendar size={24} className="text-primary-600" /></div>
              <h3 className="font-semibold mb-1 text-base text-gray-800">Auto Delivery</h3>
              <p className="text-gray-500">Delivered to your door every month</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-3 bg-primary-100 rounded-2xl flex items-center justify-center"><Check size={24} className="text-primary-600" /></div>
              <h3 className="font-semibold mb-1 text-base text-gray-800">Flexible</h3>
              <p className="text-gray-500">Pause, skip, or cancel anytime</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
