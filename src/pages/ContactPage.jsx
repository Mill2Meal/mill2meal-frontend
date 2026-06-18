import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="pb-20 lg:pb-0">
      <div className="bg-gray-50 py-8">
        <div className="container-custom">
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-2">Contact Us</h1>
          <p className="text-gray-500">We're here to help. Reach out anytime!</p>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <div className="space-y-6 mb-8">
              {[
                { icon: Phone, label: 'Call Us', value: '+91 98765 43210', subtext: 'Mon-Sat, 9 AM - 7 PM' },
                { icon: Mail, label: 'Email', value: 'hello@mill2meal.com', subtext: 'We reply within 24 hours' },
                { icon: MessageCircle, label: 'WhatsApp', value: '+91 98765 43210', subtext: 'Quick responses' },
                { icon: MapPin, label: 'Head Office', value: 'Plot 45, Hitech City Main Road, Madhapur, Hyderabad - 500081', subtext: '' },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                    <item.icon size={20} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{item.label}</p>
                    <p className="text-gray-600 text-sm">{item.value}</p>
                    {item.subtext && <p className="text-xs text-gray-400 mt-0.5">{item.subtext}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-heading font-bold text-gray-900 mb-6">Send us a Message</h2>
            <form className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500" placeholder="Phone number" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500" placeholder="your@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-gray-600">
                  <option>Order Related</option>
                  <option>Product Inquiry</option>
                  <option>Bulk Order</option>
                  <option>Franchise</option>
                  <option>Feedback</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 resize-none" placeholder="How can we help?" />
              </div>
              <button type="submit" className="btn-primary w-full">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
