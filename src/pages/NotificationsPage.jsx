import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell, BellOff, Settings, CheckCheck, Trash2, Shield, CreditCard, RefreshCw, Gift, Package, RefreshCcw } from 'lucide-react'
import { api } from '../lib/api'

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('center') // 'center' or 'preferences'
  const [notifications, setNotifications] = useState([])
  const [filterType, setFilterType] = useState('ALL')
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Preference switches
  const [preferences, setPreferences] = useState({
    orderInApp: true,
    orderEmail: true,
    orderWhatsApp: true,
    orderSms: true,
    subInApp: true,
    subEmail: true,
    subWhatsApp: true,
    promoInApp: true,
    promoEmail: false,
    promoSms: false,
    promoWhatsApp: false
  })
  const [prefLoading, setPrefLoading] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    loadNotifications()
    loadPreferences()
  }, [])

  async function loadNotifications() {
    try {
      setLoading(true)
      const data = await api.notifications.list()
      setNotifications(data.items || [])
      
      const countData = await api.notifications.unreadCount()
      setUnreadCount(countData.count || 0)
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
      setError('Failed to fetch notifications.')
    } finally {
      setLoading(false)
    }
  }

  async function loadPreferences() {
    try {
      const data = await api.notifications.getPreferences()
      if (data) {
        setPreferences(data)
      }
    } catch (err) {
      console.error('Failed to fetch preferences:', err)
    }
  }

  const handleMarkRead = async (id) => {
    try {
      await api.notifications.markRead(id)
      setNotifications(prev => 
        prev.map(item => item.id === id ? { ...item, isRead: true } : item)
      )
      // Recalculate unread count
      setUnreadCount(c => Math.max(0, c - 1))
    } catch (err) {
      console.error('Failed to mark read:', err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead()
      setNotifications(prev => prev.map(item => ({ ...item, isRead: true })))
      setUnreadCount(0)
      setSuccess('All notifications marked as read!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Failed to mark all read:', err)
    }
  }

  const handleDelete = async (id) => {
    try {
      const wasRead = notifications.find(item => item.id === id)?.isRead
      await api.notifications.delete(id)
      setNotifications(prev => prev.filter(item => item.id !== id))
      if (!wasRead) {
        setUnreadCount(c => Math.max(0, c - 1))
      }
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }

  const handlePreferenceChange = (field) => {
    setPreferences(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleSavePreferences = async (e) => {
    e.preventDefault()
    setPrefLoading(true)
    setError('')
    setSuccess('')
    try {
      await api.notifications.updatePreferences(preferences)
      setSuccess('Notification preferences saved successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Failed to save preferences:', err)
      setError('Failed to update notification preferences.')
    } finally {
      setPrefLoading(false)
    }
  }

  const handleNotificationClick = (item) => {
    // Route mapping
    if (!item.isRead) {
      handleMarkRead(item.id)
    }

    if (item.referenceType && item.referenceId) {
      const refType = item.referenceType.toUpperCase()
      const refId = item.referenceId
      
      switch (refType) {
        case 'ORDER':
          navigate(`/orders/${refId}`)
          break
        case 'SUBSCRIPTION':
          navigate(`/subscriptions`)
          break
        case 'PRODUCT':
          navigate(`/product/${refId}`)
          break
        default:
          break
      }
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ORDER':
      case 'DELIVERY':
        return <Package className="text-blue-600" size={18} />
      case 'PAYMENT':
        return <CreditCard className="text-green-600" size={18} />
      case 'REFUND':
        return <RefreshCcw className="text-amber-600" size={18} />
      case 'SUBSCRIPTION':
        return <RefreshCw className="text-indigo-600" size={18} />
      case 'COUPON':
        return <Gift className="text-pink-600" size={18} />
      case 'AUTH':
      case 'SYSTEM':
      default:
        return <Shield className="text-gray-600" size={18} />
    }
  }

  const getNotificationBg = (type) => {
    switch (type) {
      case 'ORDER':
      case 'DELIVERY':
        return 'bg-blue-50 border-blue-100'
      case 'PAYMENT':
        return 'bg-green-50 border-green-100'
      case 'REFUND':
        return 'bg-amber-50 border-amber-100'
      case 'SUBSCRIPTION':
        return 'bg-indigo-50 border-indigo-100'
      case 'COUPON':
        return 'bg-pink-50 border-pink-100'
      case 'AUTH':
      case 'SYSTEM':
      default:
        return 'bg-gray-100 border-gray-200'
    }
  }

  const filterNotifications = () => {
    if (filterType === 'ALL') return notifications
    
    return notifications.filter(item => {
      const type = item.type.toUpperCase()
      if (filterType === 'ORDERS') return type === 'ORDER' || type === 'DELIVERY'
      if (filterType === 'PAYMENTS') return type === 'PAYMENT'
      if (filterType === 'REFUNDS') return type === 'REFUND'
      if (filterType === 'SUBSCRIPTIONS') return type === 'SUBSCRIPTION'
      if (filterType === 'COUPONS') return type === 'COUPON'
      if (filterType === 'SYSTEM') return type === 'SYSTEM' || type === 'AUTH'
      return true
    })
  }

  const filteredItems = filterNotifications()

  return (
    <div className="pb-20 lg:pb-0 bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-100 py-6">
        <div className="container-custom flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/account')} 
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-heading font-bold text-gray-900 flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full select-none">
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">Order updates, promo alerts & preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8 max-w-4xl">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-sm text-red-700 font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg text-sm text-green-700 font-medium">
            {success}
          </div>
        )}

        {/* Tab Buttons */}
        <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-xl overflow-hidden">
          <button
            onClick={() => setActiveTab('center')}
            className={`flex-1 py-4 text-center font-semibold text-sm transition flex justify-center items-center gap-2 ${
              activeTab === 'center' 
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/20' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Bell size={16} /> Notification Center
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex-1 py-4 text-center font-semibold text-sm transition flex justify-center items-center gap-2 ${
              activeTab === 'preferences' 
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/20' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Settings size={16} /> Settings & Channels
          </button>
        </div>

        {activeTab === 'center' ? (
          <div>
            {/* Toolbar */}
            <div className="bg-white rounded-xl border border-gray-150 p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5 self-start md:self-auto overflow-x-auto max-w-full pb-2 md:pb-0">
                {['ALL', 'ORDERS', 'PAYMENTS', 'REFUNDS', 'SUBSCRIPTIONS', 'COUPONS', 'SYSTEM'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterType(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase transition shrink-0 select-none ${
                      filterType === cat
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              
              {/* Mark all read */}
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-semibold self-end md:self-auto transition"
                >
                  <CheckCheck size={16} /> Mark All Read
                </button>
              )}
            </div>

            {/* List */}
            {loading ? (
              <div className="bg-white rounded-xl border border-gray-100 py-16 text-center text-gray-500 font-semibold shadow-sm">
                Loading notifications...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 py-16 text-center text-gray-400 shadow-sm max-w-md mx-auto">
                <BellOff className="mx-auto text-gray-250 mb-3" size={40} />
                <p className="font-semibold text-gray-700 text-sm">No Notifications Found</p>
                <p className="text-gray-500 text-xs mt-1">We'll alert you here when something requires your attention.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-xl border transition p-4 md:p-5 flex items-start gap-4 relative shadow-sm hover:border-gray-300 ${
                      !item.isRead ? 'border-primary-100 ring-2 ring-primary-50/50' : 'border-gray-150'
                    } ${item.referenceType ? 'cursor-pointer' : ''}`}
                    onClick={() => handleNotificationClick(item)}
                  >
                    {/* Circle icon type */}
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${getNotificationBg(item.type)}`}>
                      {getNotificationIcon(item.type)}
                    </div>

                    <div className="flex-1 min-w-0 pr-8">
                      {/* Unread circle dot indicator */}
                      {!item.isRead && (
                        <span className="inline-block w-2.5 h-2.5 bg-primary-600 rounded-full mr-2" />
                      )}
                      <span className="font-bold text-gray-900 text-sm">{item.title}</span>
                      <p className="text-gray-600 text-sm leading-relaxed mt-1">{item.message}</p>
                      
                      {/* Details & Timestamp */}
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-2 font-medium">
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        {item.referenceType && (
                          <span className="text-primary-600 bg-primary-50 px-2 py-0.5 rounded uppercase text-[10px] font-bold">
                            View {item.referenceType}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions panel */}
                    <div className="absolute right-4 top-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {!item.isRead && (
                        <button
                          onClick={() => handleMarkRead(item.id)}
                          title="Mark as Read"
                          className="p-1 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded transition"
                        >
                          <CheckCheck size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        title="Delete"
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-150 p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-heading font-bold text-gray-900 mb-6">Channels & Notification Preferences</h2>
            <form onSubmit={handleSavePreferences} className="space-y-6">
              
              {/* Category 1: Orders */}
              <div className="border-b border-gray-100 pb-5">
                <h3 className="font-semibold text-gray-800 text-sm mb-3">Order Status Notifications</h3>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                  Triggered during order placement, accept, packaging, dispatch, out for delivery, and delivery completions.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'In-App Alert', field: 'orderInApp' },
                    { label: 'Email', field: 'orderEmail' },
                    { label: 'WhatsApp', field: 'orderWhatsApp' },
                    { label: 'SMS', field: 'orderSms' }
                  ].map(chan => (
                    <label key={chan.field} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={preferences[chan.field]}
                        onChange={() => handlePreferenceChange(chan.field)}
                        className="h-4.5 w-4.5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                      />
                      <span className="text-sm font-medium text-gray-600">{chan.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category 2: Subscriptions */}
              <div className="border-b border-gray-100 pb-5">
                <h3 className="font-semibold text-gray-800 text-sm mb-3">Subscription Alerts</h3>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                  Sent on subscription creation, pause, resume, cancellations, and upcoming delivery cycles.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: 'In-App Alert', field: 'subInApp' },
                    { label: 'Email', field: 'subEmail' },
                    { label: 'WhatsApp', field: 'subWhatsApp' }
                  ].map(chan => (
                    <label key={chan.field} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={preferences[chan.field]}
                        onChange={() => handlePreferenceChange(chan.field)}
                        className="h-4.5 w-4.5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                      />
                      <span className="text-sm font-medium text-gray-600">{chan.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category 3: Promotions */}
              <div className="pb-5">
                <h3 className="font-semibold text-gray-800 text-sm mb-3">Offers & Promotional Campaigns</h3>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                  Alerts on discount coupons, seasonal events, and upcoming expiring voucher deals.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'In-App Alert', field: 'promoInApp' },
                    { label: 'Email', field: 'promoEmail' },
                    { label: 'WhatsApp', field: 'promoWhatsApp' },
                    { label: 'SMS', field: 'promoSms' }
                  ].map(chan => (
                    <label key={chan.field} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={preferences[chan.field]}
                        onChange={() => handlePreferenceChange(chan.field)}
                        className="h-4.5 w-4.5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                      />
                      <span className="text-sm font-medium text-gray-600">{chan.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Save Panel */}
              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={prefLoading}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition shadow-sm inline-flex items-center"
                >
                  {prefLoading ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
