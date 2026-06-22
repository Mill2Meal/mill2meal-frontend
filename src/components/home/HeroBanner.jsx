import { Link } from 'react-router-dom'
import { ArrowRight, Truck, Shield, Leaf } from 'lucide-react'

export default function HeroBanner() {
  return (
    <section 
      className="relative overflow-hidden bg-cover bg-center min-h-[450px] md:min-h-[550px] lg:min-h-[600px] flex items-center"
      style={{ backgroundImage: `url('${import.meta.env.BASE_URL}hero_background.png')` }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/55 z-0" />
      
      <div className="container-custom py-12 md:py-20 lg:py-24 relative z-10 text-white">
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-primary-600/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
            <Leaf size={16} className="text-secondary-400" /> 100% Natural & Fresh
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight">
            Fresh from <span className="text-secondary-400">Mill</span> to Your <span className="text-secondary-400">Table</span>
          </h1>
          <p className="text-lg text-gray-200 leading-relaxed">
            Premium quality grains, pulses, cold-pressed oils, and spices — sourced directly from trusted mills. No middlemen, no compromises.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/category/rice-millets" className="btn-primary inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white border-0">
              Shop Now <ArrowRight size={18} />
            </Link>
            <Link to="/monthly-essentials" className="btn-outline inline-flex items-center justify-center gap-2 border-white text-white hover:bg-white hover:text-gray-900">
              Monthly Essentials
            </Link>
          </div>
          <div className="flex flex-wrap gap-6 pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-200">
              <Truck size={18} className="text-secondary-400" /> Free Delivery 499+
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-200">
              <Shield size={18} className="text-secondary-400" /> FSSAI Certified
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-200">
              <Leaf size={18} className="text-secondary-400" /> No Preservatives
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
