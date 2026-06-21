import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, ChevronRight, RotateCcw, Loader2 } from 'lucide-react'
import { api } from '../lib/api'
import { useCart } from '../context/CartContext'

const statusColors = {
  'ORDER_PLACED': 'bg-yellow-100 text-yellow-700',
  'PAYMENT_CONFIRMED': 'bg-blue-100 text-blue-700',
  'ORDER_ACCEPTED': 'bg-purple-100 text-purple-700',
  'PACKING_IN_PROGRESS': 'bg-indigo-100 text-indigo-700',
  'READY_FOR_DISPATCH': 'bg-indigo-100 text-indigo-700',
  'OUT_FOR_DELIVERY': 'bg-amber-100 text-amber-700',
  'DELIVERED': 'bg-green-100 text-green-700',
  'CANCELLED': 'bg-red-100 text-red-700',
  'RETURNED': 'bg-red-100 text-red-700',
}

const statusLabels = {
  'ORDER_PLACED': 'Order Placed',
  'PAYMENT_CONFIRMED': 'Payment Confirmed',
  'ORDER_ACCEPTED': 'Order Accepted',
  'PACKING_IN_PROGRESS': 'Packing',
  'READY_FOR_DISPATCH': 'Ready to Dispatch',
  'OUT_FOR_DELIVERY': 'Out for Delivery',
  'DELIVERED': 'Delivered',
  'CANCELLED': 'Cancelled',
  'RETURNED': 'Returned',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyOrderId, setBusyOrderId] = useState(null)
  
  const navigate = useNavigate()
  const { fetchCart } = useCart()

  const isLoggedIn = () => !!localStorage.getItem('accessToken')

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login?redirect=/orders')
      return
    }

    async function loadOrders() {
      try {
        const data = await api.orders.list()
        // If the API returns `{ items: [...] }`
        const list = data?.items || data || []
        setOrders(list)
      } catch (err) {
        console.error('Failed to load orders:', err)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [navigate])

  const handleReorder = async (e, orderId) => {
    e.preventDefault()
    e.stopPropagation()
    setBusyOrderId(orderId)
    try {
      await api.orders.reorder(orderId)
      await fetchCart()
      navigate('/cart')
    } catch (err) {
      console.error('Reorder failed:', err)
      alert(err.message || 'Failed to reorder items')
    } finally {
      setBusyOrderId(null)
    }
  }

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center gap-2 text-gray-500 font-semibold">
        <Loader2 className="animate-spin text-primary-600" /> Loading your orders...
      </div>
    )
  }

  return (
    <div className="pb-20 lg:pb-0 bg-gray-50 min-h-screen">
      <div className="container-custom py-8">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-6">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-2xl shadow-sm border border-gray-100">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="font-semibold text-gray-700 mb-1">No Orders Found</h3>
            <p className="text-gray-500 text-sm mb-6">You haven't placed any orders with us yet.</p>
            <Link to="/" className="btn-primary inline-block">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const orderId = order.orderId
              const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })
              const itemsList = order.items?.map(i => i.productNameSnapshot).join(', ') || 'Grocery Item'
              const statusLabel = statusLabels[order.orderStatus] || order.orderStatus
              const colorClass = statusColors[order.orderStatus] || 'bg-gray-100 text-gray-700'

              return (
                <Link key={orderId} to={`/orders/${orderId}`} className="block bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition border border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-800">Order #{order.orderNumber || orderId.slice(0, 8)}</p>
                      <p className="text-sm text-gray-500">{dateStr}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
                      {statusLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm text-gray-600 truncate">{itemsList}</p>
                      <p className="font-bold text-gray-900 mt-1">₹{order.grandTotalAmount}</p>
                    </div>
                    <ChevronRight size={20} className="text-gray-400 shrink-0" />
                  </div>
                  {(order.orderStatus === 'DELIVERED' || order.orderStatus === 'ORDER_PLACED') && (
                    <button
                      onClick={(e) => handleReorder(e, orderId)}
                      disabled={busyOrderId === orderId}
                      className="mt-3 flex items-center gap-1.5 text-sm text-primary-600 font-semibold hover:underline disabled:text-gray-400"
                    >
                      {busyOrderId === orderId ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <RotateCcw size={14} />
                      )}
                      Reorder
                    </button>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
