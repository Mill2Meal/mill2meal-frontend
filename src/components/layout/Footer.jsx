import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter, Youtube } from 'lucide-react'
import { api } from '../../lib/api'

export default function Footer() {
  const [branding, setBranding] = useState({
    brandName: 'MILLTOMEAL',
    tagline: 'Fresh from Mill to Table',
    logoLight: `${import.meta.env.BASE_URL}logo.jpg`,
    primaryColor: '#CE2028',
    secondaryColor: '#F97316',
  })

  useEffect(() => {
    api.branding.get()
      .then(res => {
        if (res) {
          setBranding({
            brandName: res.brandName || 'MILLTOMEAL',
            tagline: res.tagline || 'Fresh from Mill to Table',
            logoLight: res.logoLight || `${import.meta.env.BASE_URL}logo.jpg`,
            primaryColor: res.primaryColor || '#CE2028',
            secondaryColor: res.secondaryColor || '#F97316',
          })
        }
      })
      .catch(err => console.error(err))
  }, [])

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
            href="https://wa.me/919059503227?text=Hi%20MillToMeal%2C%20I%20want%20to%20place%20an%20order"
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
            <Link to="/" className="flex items-center gap-1.5 md:gap-4 select-none mb-4">
              <div className="w-9 h-9 md:w-16 md:h-16 bg-[#CE2028] rounded-xl flex items-center justify-center p-1 overflow-hidden shrink-0">
                <img
                  src={branding.logoLight}
                  alt={`${branding.brandName} Logo`}
                  className="max-h-full max-w-full object-contain scale-[1.35]"
                  style={{ imageRendering: "auto" }}
                />
              </div>
              <div className="flex flex-col justify-center w-auto select-none pl-0">
                <h1 className="text-[16px] md:text-[17px] font-bold uppercase leading-none font-logo tracking-[0.02em]">
                  <span className="text-[#CE2028]">MILL</span>
                  <span className="text-white">To</span>
                  <span className="text-[#CE2028]">MEAL</span>
                </h1>
                <p className="mt-[4px] text-[8px] md:text-[10.2px] font-semibold leading-none text-[#CE2028] tracking-[0.01em]">
                  {branding.tagline}
                </p>
              </div>
            </Link>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              Premium quality grains, pulses, oils and spices delivered fresh from the mill to your table. Trusted by 50,000+ families.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://x.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition"
              >
                <Youtube size={18} />
              </a>
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
                <span>+91 90595 03227</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail size={16} className="shrink-0 text-primary-400" />
                <span>2200080216.aids@gmail.com</span>
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
        <div className="container-custom py-6 flex items-center justify-center">
          <p className="text-xs text-gray-500 text-center">&copy; 2026 MillToMeal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
