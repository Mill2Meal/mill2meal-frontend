import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter, Youtube } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* WhatsApp CTA */}
      <div className="bg-primary-700 py-6">
        <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-white font-heading text-xl font-semibold">Order on WhatsApp</h3>
            <p className="text-primary-100 text-sm">Quick ordering for recurring purchases</p>
          </div>
          <a
            href="https://wa.me/919876543210?text=Hi%20Mill2Meal%2C%20I%20want%20to%20place%20an%20order"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-primary-700 px-8 py-3 rounded-full font-semibold hover:bg-primary-50 transition shadow-lg"
          >
            Chat with us on WhatsApp
          </a>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-heading font-bold text-white">Mill2Meal</span>
            </Link>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              Premium quality grains, pulses, oils and spices delivered fresh from the mill to your table. Trusted by 50,000+ families.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition"><Instagram size={18} /></a>
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition"><Facebook size={18} /></a>
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition"><Twitter size={18} /></a>
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition"><Youtube size={18} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm hover:text-primary-400 transition">About Us</Link></li>
              <li><Link to="/quality-promise" className="text-sm hover:text-primary-400 transition">Quality Promise</Link></li>
              <li><Link to="/stores" className="text-sm hover:text-primary-400 transition">Store Locator</Link></li>
              <li><Link to="/bulk-orders" className="text-sm hover:text-primary-400 transition">Bulk Orders</Link></li>
              <li><Link to="/franchise" className="text-sm hover:text-primary-400 transition">Franchise Enquiry</Link></li>
              <li><Link to="/faq" className="text-sm hover:text-primary-400 transition">FAQs</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="text-white font-semibold mb-4">Policies</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy-policy" className="text-sm hover:text-primary-400 transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm hover:text-primary-400 transition">Terms & Conditions</Link></li>
              <li><Link to="/refund-policy" className="text-sm hover:text-primary-400 transition">Refund Policy</Link></li>
              <li><Link to="/shipping-policy" className="text-sm hover:text-primary-400 transition">Shipping Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm">
                <MapPin size={16} className="mt-0.5 shrink-0 text-primary-400" />
                <span>Plot 45, Hitech City Main Road, Madhapur, Hyderabad - 500081</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone size={16} className="shrink-0 text-primary-400" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail size={16} className="shrink-0 text-primary-400" />
                <span>hello@mill2meal.com</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-400">FSSAI License No.</p>
              <p className="text-sm text-white font-mono">10016011003146</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">&copy; 2024 Mill2Meal. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/100px-Visa_Inc._logo.svg.png" alt="Visa" className="h-5 opacity-60" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/100px-Mastercard-logo.svg.png" alt="Mastercard" className="h-5 opacity-60" />
            <span className="text-xs text-gray-500 border border-gray-700 px-2 py-0.5 rounded">UPI</span>
            <span className="text-xs text-gray-500 border border-gray-700 px-2 py-0.5 rounded">COD</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
