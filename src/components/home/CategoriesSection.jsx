import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, getAbsoluteImageUrl } from '../../lib/api'

export default function CategoriesSection() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await api.categories.list()
        if (data && data.items) {
          setCategories(data.items.slice(0, 8)) // Get up to 8 categories
        }
      } catch (err) {
        console.error('Failed to load categories:', err)
      } finally {
        setLoading(false)
      }
    }
    loadCategories()
  }, [])

  if (loading) {
    return (
      <div className="py-12 text-center text-gray-500 font-semibold">
        Loading categories...
      </div>
    )
  }

  if (categories.length === 0) return null

  return (
    <section id="categories-section" className="py-12 md:py-16 bg-white">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">Fresh staples for every Indian kitchen</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map(cat => (
            <Link
              key={cat.categoryId}
              to={`/category/${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl aspect-square shadow-md hover:shadow-xl transition-all duration-300"
            >
              <img
                src={getAbsoluteImageUrl(cat.bannerImageUrl)}
                alt={cat.categoryName}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-semibold text-sm md:text-base">{cat.categoryName}</h3>
                <p className="text-white/70 text-xs mt-0.5">Explore Products</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
