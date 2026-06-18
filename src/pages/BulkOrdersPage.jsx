import { Building2, Utensils, GraduationCap, Users } from 'lucide-react'

export default function BulkOrdersPage() {
  return (
    <div className="pb-20 lg:pb-0">
      <div className="bg-gradient-to-br from-primary-700 to-primary-900 py-16">
        <div className="container-custom text-center">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">Bulk Orders</h1>
          <p className="text-primary-100 text-lg max-w-2xl mx-auto">Special pricing for restaurants, caterers, hostels, and offices. Get premium quality at wholesale rates.</p>
        </div>
      </div>

      <div className="container-custom py-12">
        {/* Who We Serve */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { icon: Utensils, label: 'Restaurants & Cafes' },
            { icon: Users, label: 'Catering Services' },
            { icon: GraduationCap, label: 'Hostels & Mess' },
            { icon: Building2, label: 'Offices & Corporates' },
          ].map(item => (
            <div key={item.label} className="text-center p-6 bg-primary-50 rounded-2xl">
              <item.icon size={32} className="mx-auto text-primary-600 mb-3" />
              <p className="font-semibold text-gray-800">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-heading font-bold text-gray-900 mb-6">Request a Quote</h2>
          <form className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <input type="text" placeholder="Business Name" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500" />
              <input type="text" placeholder="Contact Person" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <input type="tel" placeholder="Phone Number" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500" />
              <input type="email" placeholder="Email" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500" />
            </div>
            <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-gray-600">
              <option>Business Type</option>
              <option>Restaurant</option>
              <option>Catering</option>
              <option>Hostel/Mess</option>
              <option>Corporate Office</option>
              <option>Other</option>
            </select>
            <textarea rows={4} placeholder="Products needed and estimated monthly quantity..." className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 resize-none" />
            <button type="submit" className="btn-primary w-full">Submit Enquiry</button>
          </form>
        </div>
      </div>
    </div>
  )
}
