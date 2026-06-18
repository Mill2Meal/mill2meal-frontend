import { Link } from 'react-router-dom'
import { ArrowRight, Truck, Shield, Leaf } from 'lucide-react'

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-cream">
      <div className="container-custom py-12 md:py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium">
              <Leaf size={16} /> 100% Natural & Fresh
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-gray-900 leading-tight">
              Fresh from <span className="text-gradient">Mill</span> to Your <span className="text-gradient">Table</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
              Premium quality grains, pulses, cold-pressed oils, and spices — sourced directly from trusted mills. No middlemen, no compromises.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/category/rice-millets" className="btn-primary inline-flex items-center justify-center gap-2">
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link to="/monthly-essentials" className="btn-outline inline-flex items-center justify-center gap-2">
                Monthly Essentials
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck size={18} className="text-primary-600" /> Free Delivery 499+
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield size={18} className="text-primary-600" /> FSSAI Certified
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Leaf size={18} className="text-primary-600" /> No Preservatives
              </div>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="relative z-10">
              <img
                src="https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=500&fit=crop"
                alt="Premium Grains"
                className="rounded-3xl shadow-2xl w-full object-cover h-[500px]"
              />
            </div>
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary-200 rounded-full opacity-30 blur-3xl" />
            <div className="absolute -bottom-8 -left-8 w-56 h-56 bg-secondary-200 rounded-full opacity-30 blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
