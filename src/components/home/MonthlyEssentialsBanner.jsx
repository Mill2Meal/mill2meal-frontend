import { Link } from 'react-router-dom'
import { Package, ArrowRight } from 'lucide-react'

export default function MonthlyEssentialsBanner() {
  return (
    <section className="py-12 md:py-16">
      <div className="container-custom">
        <div className="relative overflow-hidden bg-gradient-to-r from-primary-700 to-primary-900 rounded-3xl p-8 md:p-12">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm mb-4">
              <Package size={16} /> Save up to 20%
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              Monthly Essentials Kit
            </h2>
            <p className="text-primary-100 mb-6 leading-relaxed">
              Pre-curated family baskets with rice, dal, oil, and spices. Subscribe once, never run out. Free delivery every month.
            </p>
            <Link to="/monthly-essentials" className="inline-flex items-center gap-2 bg-white text-primary-700 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition shadow-lg">
              Explore Kits <ArrowRight size={18} />
            </Link>
          </div>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full" />
          <div className="absolute right-20 top-10 w-32 h-32 bg-white/5 rounded-full" />
        </div>
      </div>
    </section>
  )
}
