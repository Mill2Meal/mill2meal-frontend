import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import CategoryCard from '../components/common/CategoryCard'

const SkeletonLoader = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 animate-pulse">
    {[...Array(12)].map((_, i) => (
      <div key={i} className="aspect-square bg-gray-200 rounded-2xl relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
)

const EmptyState = () => (
  <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200 my-8">
    <p className="text-gray-500 text-lg font-medium">No active categories found.</p>
  </div>
)

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'All Categories | Mill2Meal'

    // Add/Update meta description
    let metaDescription = document.querySelector('meta[name="description"]')
    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.setAttribute('name', 'description')
      document.head.appendChild(metaDescription)
    }
    metaDescription.setAttribute(
      'content',
      'Explore all product categories at Mill2Meal. From fresh flour and grains to premium cold-pressed oils, view all categories.'
    )

    // Ensure indexable
    let metaRobots = document.querySelector('meta[name="robots"]')
    if (!metaRobots) {
      metaRobots = document.createElement('meta')
      metaRobots.setAttribute('name', 'robots')
      document.head.appendChild(metaRobots)
    }
    metaRobots.setAttribute('content', 'index, follow')
  }, [])

  useEffect(() => {
    async function loadAllCategories() {
      setLoading(true)
      try {
        let allItems = []
        let page = 1
        let hasMore = true

        while (hasMore) {
          const data = await api.categories.list(`page=${page}&limit=50&isActive=true`)
          if (data && data.items) {
            allItems = [...allItems, ...data.items]
            if (data.pagination && data.pagination.page < data.pagination.totalPages) {
              page++
            } else {
              hasMore = false
            }
          } else {
            hasMore = false
          }
        }
        setCategories(allItems)
      } catch (err) {
        console.error('Failed to load categories:', err)
      } finally {
        setLoading(false)
      }
    }
    loadAllCategories()
  }, [])

  return (
    <div className="bg-cream/20 min-h-screen py-10 md:py-16">
      <div className="container-custom">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-2">
            All Categories
          </h1>
          <p className="text-gray-600">
            Fresh staples and quality items curated for your kitchen
          </p>
        </div>

        {loading ? (
          <SkeletonLoader />
        ) : categories.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {categories.map((cat) => (
              <CategoryCard key={cat.categoryId} category={cat} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
