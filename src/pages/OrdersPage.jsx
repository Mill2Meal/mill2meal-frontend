import { Link } from 'react-router-dom'
import { Package, ChevronRight, RotateCcw } from 'lucide-react'

const orders = [
  { id: 'M2M-10234', date: '15 Jun 2024', status: 'Delivered', total: 1247, items: ['Premium Basmati Rice (5kg)', 'Organic Toor Dal (1kg)', 'Cold Pressed Groundnut Oil (1L)'] },
  { id: 'M2M-10198', date: '02 Jun 2024', status: 'In Transit', total: 698, items: ['A2 Cow Ghee (500ml)', 'California Almonds (250g)'] },
  { id: 'M2M-10156', date: '18 May 2024', status: 'Delivered', total: 2349, items: ['Monthly Essentials Kit - Family Pack'] },
]

const statusColors = {
  'Delivered': 'bg-green-100 text-green-700',
  'In Transit': 'bg-blue-100 text-blue-700',
  'Processing': 'bg-yellow-100 text-yellow-700',
  'Cancelled': 'bg-red-100 text-red-700',
}

export default function OrdersPage() {
  return (
    <div className="pb-20 lg:pb-0 bg-gray-50 min-h-screen">
      <div className="container-custom py-8">
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-6">My Orders</h1>

        <div className="space-y-4">
          {orders.map(order => (
            <Link key={order.id} to={`/orders/${order.id}`} className="block bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-800">Order #{order.id}</p>
                  <p className="text-sm text-gray-500">{order.date}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}>
                  {order.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{order.items.join(', ')}</p>
                  <p className="font-bold text-gray-900 mt-1">₹{order.total}</p>
                </div>
                <ChevronRight size={20} className="text-gray-400 shrink-0" />
              </div>
              {order.status === 'Delivered' && (
                <button className="mt-3 flex items-center gap-1 text-sm text-primary-600 font-medium hover:underline">
                  <RotateCcw size={14} /> Reorder
                </button>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
