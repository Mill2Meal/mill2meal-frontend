import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import CategoryCard from '../common/CategoryCard'

export default function CategoriesSection() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showViewAll, setShowViewAll] = useState(false)

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await api.categories.list('limit=8&isActive=true')
        if (data && data.items) {
          setCategories(data.items)
          if (data.pagination && data.pagination.total > 8) {
            setShowViewAll(true)
          }
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
            <CategoryCard key={cat.categoryId} category={cat} />
          ))}
        </div>
        {showViewAll && (
          <div className="text-center mt-10">
            <Link
              to="/categories"
              className="inline-flex items-center justify-center px-6 py-3 border border-primary text-primary hover:bg-primary hover:text-white font-medium rounded-full transition-all duration-300 shadow-sm hover:shadow-md"
            >
              View All Categories &rarr;
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
