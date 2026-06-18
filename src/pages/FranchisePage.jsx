import { Store, TrendingUp, Handshake, MapPin } from 'lucide-react'

export default function FranchisePage() {
  return (
    <div className="pb-20 lg:pb-0">
      <div className="bg-gradient-to-br from-secondary-500 to-secondary-700 py-16">
        <div className="container-custom text-center">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">Franchise Opportunity</h1>
          <p className="text-secondary-100 text-lg max-w-2xl mx-auto">Partner with Mill2Meal and bring premium grocery retail to your city.</p>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { icon: Store, label: 'Low Investment', desc: 'Start with as low as ₹15 lakhs' },
            { icon: TrendingUp, label: 'High ROI', desc: 'Break-even within 12-18 months' },
            { icon: Handshake, label: 'Full Support', desc: 'Training, inventory & marketing' },
            { icon: MapPin, label: '50+ Locations', desc: 'Growing pan-India network' },
          ].map(item => (
            <div key={item.label} className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <item.icon size={32} className="mx-auto text-secondary-500 mb-3" />
              <p className="font-semibold text-gray-800 mb-1">{item.label}</p>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-heading font-bold text-gray-900 mb-6">Express Your Interest</h2>
          <form className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <input type="text" placeholder="Full Name" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500" />
              <input type="tel" placeholder="Phone Number" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500" />
            </div>
            <input type="email" placeholder="Email Address" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500" />
            <div className="grid sm:grid-cols-2 gap-4">
              <input type="text" placeholder="City" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500" />
              <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-gray-600">
                <option>Investment Budget</option>
                <option>₹15-25 Lakhs</option>
                <option>₹25-50 Lakhs</option>
                <option>₹50 Lakhs+</option>
              </select>
            </div>
            <textarea rows={3} placeholder="Tell us about your background and why you're interested..." className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 resize-none" />
            <button type="submit" className="btn-secondary w-full">Submit Application</button>
          </form>
        </div>
      </div>
    </div>
  )
}
