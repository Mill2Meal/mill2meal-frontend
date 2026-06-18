import { MapPin, Clock, Phone, Navigation } from 'lucide-react'
import { stores } from '../data/products'

export default function StoreLocatorPage() {
  return (
    <div className="pb-20 lg:pb-0">
      <div className="bg-gray-50 py-8">
        <div className="container-custom">
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-2">Our Stores</h1>
          <p className="text-gray-500">Visit us for a walk-in shopping experience</p>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Store List */}
          <div className="space-y-4">
            {stores.map(store => (
              <div key={store.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
                <h3 className="font-semibold text-lg text-gray-900 mb-3">{store.name}</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-primary-600" />
                    <span>{store.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} className="shrink-0 text-primary-600" />
                    <span>{store.hours}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={16} className="shrink-0 text-primary-600" />
                    <span>{store.phone}</span>
                  </div>
                </div>
                <button className="mt-4 flex items-center gap-2 text-primary-600 font-medium text-sm hover:underline">
                  <Navigation size={14} /> Get Directions
                </button>
              </div>
            ))}
          </div>

          {/* Map Placeholder */}
          <div className="bg-gray-200 rounded-2xl overflow-hidden h-[400px] lg:h-auto flex items-center justify-center">
            <div className="text-center p-8">
              <MapPin size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 font-medium">Interactive Map</p>
              <p className="text-sm text-gray-400 mt-1">Map will load here with store locations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
