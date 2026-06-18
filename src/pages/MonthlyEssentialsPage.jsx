import { Link } from 'react-router-dom'
import { Package, Users, Check, ShoppingCart } from 'lucide-react'

const kits = [
  { id: 1, name: 'Small Family Kit', size: '2-3 members', price: 1499, originalPrice: 1799, items: ['5kg Basmati Rice', '2kg Toor Dal', '1L Groundnut Oil', '500g Atta', 'Spice Pack (5 items)'], popular: false },
  { id: 2, name: 'Medium Family Kit', size: '4-5 members', price: 2499, originalPrice: 2999, items: ['10kg Basmati Rice', '3kg Toor Dal', '1kg Moong Dal', '2L Groundnut Oil', '2kg Atta', 'Spice Pack (8 items)', '500g Ghee'], popular: true },
  { id: 3, name: 'Large Family Kit', size: '6+ members', price: 3999, originalPrice: 4799, items: ['25kg Basmati Rice', '5kg Toor Dal', '2kg Moong Dal', '5L Groundnut Oil', '5kg Atta', 'Full Spice Pack (12 items)', '1L Ghee', '500g Honey'], popular: false },
]

export default function MonthlyEssentialsPage() {
  return (
    <div className="pb-20 lg:pb-0">
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
        <div className="grid md:grid-cols-3 gap-6">
          {kits.map(kit => (
            <div key={kit.id} className={`card p-6 relative ${kit.popular ? 'border-2 border-primary-500 ring-2 ring-primary-100' : 'border border-gray-200'}`}>
              {kit.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-bold px-4 py-1 rounded-full">Most Popular</span>
              )}
              <div className="text-center mb-6">
                <h3 className="text-xl font-heading font-bold text-gray-900">{kit.name}</h3>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-1">
                  <Users size={14} /> {kit.size}
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-gray-900">₹{kit.price}</span>
                  <span className="text-gray-400 line-through ml-2">₹{kit.originalPrice}</span>
                  <span className="block text-sm text-gray-500 mt-1">/month</span>
                </div>
              </div>
              <ul className="space-y-2 mb-6">
                {kit.items.map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check size={14} className="text-primary-600 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              <div className="space-y-2">
                <button className="w-full btn-primary flex items-center justify-center gap-2">
                  <ShoppingCart size={18} /> Subscribe Monthly
                </button>
                <button className="w-full btn-outline text-sm">Buy Once</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
