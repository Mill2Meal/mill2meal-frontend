import { useParams, Link } from 'react-router-dom'
import { Check, Package, Truck, MapPin, Clock } from 'lucide-react'

const trackingSteps = [
  { label: 'Order Placed', time: '15 Jun, 10:30 AM', completed: true, icon: Check },
  { label: 'Order Confirmed', time: '15 Jun, 10:35 AM', completed: true, icon: Check },
  { label: 'Packed & Ready', time: '15 Jun, 2:00 PM', completed: true, icon: Package },
  { label: 'Out for Delivery', time: '16 Jun, 9:00 AM', completed: true, icon: Truck },
  { label: 'Delivered', time: '16 Jun, 11:30 AM', completed: true, icon: MapPin },
]

export default function OrderTrackingPage() {
  const { id } = useParams()

  return (
    <div className="pb-20 lg:pb-0 bg-gray-50 min-h-screen">
      <div className="container-custom py-8">
        <Link to="/orders" className="text-sm text-primary-600 font-medium hover:underline mb-4 inline-block">&larr; Back to Orders</Link>
        <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">Order #{id || 'M2M-10234'}</h1>
        <p className="text-gray-500 text-sm mb-8">Placed on 15 Jun, 2024</p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Tracking Timeline */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-lg mb-6">Order Status</h2>
            <div className="space-y-0">
              {trackingSteps.map((step, i) => (
                <div key={step.label} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.completed ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                      <step.icon size={18} />
                    </div>
                    {i < trackingSteps.length - 1 && (
                      <div className={`w-0.5 h-12 ${step.completed ? 'bg-primary-600' : 'bg-gray-200'}`} />
                    )}
                  </div>
                  <div className="pt-2">
                    <p className={`font-medium ${step.completed ? 'text-gray-800' : 'text-gray-400'}`}>{step.label}</p>
                    <p className="text-sm text-gray-500">{step.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-lg mb-4">Items Ordered</h2>
              <div className="space-y-3">
                {['Premium Basmati Rice (5kg) - ₹1,149', 'Organic Toor Dal (1kg) - ₹189', 'Cold Pressed Groundnut Oil (1L) - ₹399'].map(item => (
                  <div key={item} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <Package size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
              <hr className="my-3" />
              <div className="flex justify-between font-bold">
                <span>Total</span><span>₹1,247</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-lg mb-3">Delivery Address</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Flat 302, Prestige Heights<br />
                Madhapur, Hitech City<br />
                Hyderabad - 500081<br />
                Phone: +91 98765 43210
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
