import { Link } from 'react-router-dom'
import { Package, Calendar, Check, ArrowRight } from 'lucide-react'
import { subscriptionPlans } from '../data/products'

export default function SubscriptionsPage() {
  return (
    <div className="pb-20 lg:pb-0">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-700 to-primary-900 py-12 md:py-16">
        <div className="container-custom text-center">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-3">Subscription Plans</h1>
          <p className="text-primary-100 text-lg max-w-2xl mx-auto">Never run out of essentials. Subscribe and save up to 20% with free monthly delivery.</p>
        </div>
      </div>

      <div className="container-custom py-12">
        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-6">
          {subscriptionPlans.map(plan => (
            <div key={plan.id} className="card p-6 border-2 border-gray-100 hover:border-primary-200 transition">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-heading font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">{plan.description}</p>
                </div>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">Save {plan.savings}</span>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">₹{plan.price}</span>
                <span className="text-gray-500 text-sm">/{plan.frequency.toLowerCase()}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.items.map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check size={16} className="text-primary-600 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              <div className="flex gap-3">
                <button className="flex-1 btn-primary text-sm">Subscribe Now</button>
                <button className="flex-1 btn-outline text-sm">One-Time Purchase</button>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="mt-16 text-center">
          <h2 className="section-title mb-8">Why Subscribe?</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-3 bg-primary-100 rounded-2xl flex items-center justify-center"><Package size={24} className="text-primary-600" /></div>
              <h3 className="font-semibold mb-1">Save More</h3>
              <p className="text-sm text-gray-500">Up to 20% off on subscription orders</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-3 bg-primary-100 rounded-2xl flex items-center justify-center"><Calendar size={24} className="text-primary-600" /></div>
              <h3 className="font-semibold mb-1">Auto Delivery</h3>
              <p className="text-sm text-gray-500">Delivered to your door every month</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-3 bg-primary-100 rounded-2xl flex items-center justify-center"><Check size={24} className="text-primary-600" /></div>
              <h3 className="font-semibold mb-1">Flexible</h3>
              <p className="text-sm text-gray-500">Pause, skip, or cancel anytime</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
