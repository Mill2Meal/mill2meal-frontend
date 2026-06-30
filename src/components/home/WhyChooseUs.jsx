import { Wheat, Droplets, ShieldCheck, Truck, Recycle, Heart } from 'lucide-react'

const features = [
  { icon: Wheat, title: 'Mill Fresh', description: 'Direct from trusted mills, processed on order for maximum freshness' },
  { icon: Droplets, title: 'Cold Pressed', description: 'Traditional wooden ghani extraction retains nutrients and natural flavor' },
  { icon: ShieldCheck, title: 'FSSAI Certified', description: 'All products are quality tested and FSSAI certified for safety' },
  { icon: Truck, title: 'Fast Delivery', description: 'Free delivery on orders above ₹499. Same-day delivery available' },
  { icon: Recycle, title: 'Eco Packaging', description: 'Sustainable packaging made from recycled materials' },
  { icon: Heart, title: 'Family Trusted', description: 'Serving 50,000+ families with premium quality staples' },
]

export default function WhyChooseUs() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="section-title">Why Choose MillToMeal?</h2>
          <p className="section-subtitle">Your trust is our foundation</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, i) => (
            <div key={i} className="text-center p-6 rounded-2xl hover:bg-primary-50 transition-colors duration-300">
              <div className="w-14 h-14 mx-auto mb-4 bg-primary-100 rounded-2xl flex items-center justify-center">
                <feature.icon size={28} className="text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
