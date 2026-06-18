import { Link } from 'react-router-dom'
import { User, MapPin, Package, Heart, CreditCard, Bell, LogOut, ChevronRight } from 'lucide-react'

export default function AccountPage() {
  const menuItems = [
    { icon: Package, label: 'My Orders', description: 'Track, return or reorder', link: '/orders' },
    { icon: MapPin, label: 'Saved Addresses', description: 'Manage delivery addresses', link: '#' },
    { icon: Heart, label: 'Subscriptions', description: 'Manage your subscriptions', link: '/subscriptions' },
    { icon: CreditCard, label: 'Payment Methods', description: 'Saved cards and UPI', link: '#' },
    { icon: Bell, label: 'Notifications', description: 'Order updates and offers', link: '#' },
  ]

  return (
    <div className="pb-20 lg:pb-0 bg-gray-50 min-h-screen">
      <div className="container-custom py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <User size={32} className="text-primary-600" />
            </div>
            <div>
              <h1 className="text-xl font-heading font-bold text-gray-900">Welcome Back!</h1>
              <p className="text-gray-500 text-sm">+91 98765 43210</p>
            </div>
            <button className="ml-auto text-sm text-primary-600 font-medium hover:underline">Edit Profile</button>
          </div>
        </div>

        {/* Menu */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {menuItems.map((item, i) => (
            <Link
              key={item.label}
              to={item.link}
              className={`flex items-center gap-4 p-5 hover:bg-gray-50 transition ${i < menuItems.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                <item.icon size={20} className="text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{item.label}</p>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </Link>
          ))}
        </div>

        {/* Help & Support */}
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3">Need Help?</h3>
          <div className="flex flex-wrap gap-3">
            <Link to="/faq" className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition">FAQs</Link>
            <Link to="/contact" className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition">Contact Us</Link>
            <a href="https://wa.me/919876543210" className="px-4 py-2 bg-green-50 rounded-lg text-sm font-medium text-green-700 hover:bg-green-100 transition">WhatsApp Support</a>
          </div>
        </div>

        <button className="mt-6 flex items-center gap-2 text-red-500 font-medium hover:text-red-600 transition">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  )
}
