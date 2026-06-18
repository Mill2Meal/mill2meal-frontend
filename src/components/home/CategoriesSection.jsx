import { Link } from 'react-router-dom'
import { categories } from '../../data/products'

export default function CategoriesSection() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">Fresh staples for every Indian kitchen</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl aspect-square shadow-md hover:shadow-xl transition-all duration-300"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-semibold text-sm md:text-base">{cat.name}</h3>
                <p className="text-white/70 text-xs mt-0.5">{cat.count} products</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
