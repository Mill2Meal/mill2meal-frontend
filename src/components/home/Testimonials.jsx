import { Star, Quote } from 'lucide-react'
import { testimonials } from '../../data/products'

export default function Testimonials() {
  return (
    <section className="py-12 md:py-16 bg-primary-50">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-subtitle">Real stories from real families</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map(t => (
            <div key={t.id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">
              <Quote size={24} className="text-primary-200 mb-3" />
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{t.text}</p>
              <div className="flex items-center gap-1 mb-2">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="font-semibold text-gray-800 text-sm">{t.name}</p>
              <p className="text-xs text-gray-500">{t.location}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
