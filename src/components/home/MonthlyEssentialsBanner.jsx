import { Link } from 'react-router-dom'
import { Package, ArrowRight } from 'lucide-react'

export default function MonthlyEssentialsBanner() {
  return (
    <section className="py-12 md:py-16">
      <div className="container-custom">
        <div className="relative overflow-hidden bg-gradient-to-br from-white via-red-50/40 to-red-100/50 dark:from-[#2A0F11] dark:to-[#12141C] rounded-3xl p-8 md:p-12 border border-red-100/50 dark:border-red-950/30 shadow-lg flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="relative z-10 max-w-xl flex-1 text-left">
            <div className="inline-flex items-center gap-1.5 bg-[#CE2028] text-white px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
              <Package size={14} /> Save up to 20%
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
              <span className="font-logo font-extrabold block mb-1 select-none text-3xl">
                <span className="text-[#CE2028]">Mill</span>
                <span className="text-black dark:text-white">To</span>
                <span className="text-[#CE2028]">Meal</span>
              </span>
              <span className="text-gray-900 dark:text-white font-heading font-bold text-3xl md:text-4xl block">Monthly Essentials Kits</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 mt-4 leading-relaxed text-sm md:text-base max-w-md">
              Pre-curated family baskets with all your kitchen staples. Order once, get delivered every month.
            </p>
            <Link to="/monthly-essentials" className="inline-flex items-center gap-2 bg-[#CE2028] hover:bg-[#A8161D] text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              Explore Kits <ArrowRight size={18} />
            </Link>
          </div>
          <div className="relative flex-1 w-full max-w-xs md:max-w-md flex justify-center items-center">
            <img 
              src={`${import.meta.env.BASE_URL}grocery_basket.png`} 
              alt="Monthly Essentials Basket" 
              className="w-full max-h-[300px] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
