import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { SlidersHorizontal, ChevronDown, Grid3X3, LayoutList } from 'lucide-react'
import ProductCard from '../components/common/ProductCard'
import { products, categories } from '../data/products'

export default function CategoryPage() {
  const { slug } = useParams()
  const [sortBy, setSortBy] = useState('popular')
  const [showFilters, setShowFilters] = useState(false)

  const category = categories.find(c => c.slug === slug)
  const categoryProducts = products.filter(p => p.category === slug)
  const displayProducts = categoryProducts.length > 0 ? categoryProducts : products

  const sorted = [...displayProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price
    if (sortBy === 'price-high') return b.price - a.price
    if (sortBy === 'rating') return b.rating - a.rating
    return b.reviews - a.reviews
  })

  return (
    <div className="pb-20 lg:pb-0">
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="container-custom">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Home</span> / <span className="text-gray-800 font-medium">{category?.name || 'All Products'}</span>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900">{category?.name || 'All Products'}</h1>
            <p className="text-gray-500 text-sm mt-1">{sorted.length} products available</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:border-primary-500 transition lg:hidden"
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:border-primary-500"
            >
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-40 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Categories</h3>
                <ul className="space-y-2">
                  {categories.map(cat => (
                    <li key={cat.id}>
                      <a href={`/category/${cat.slug}`} className={`block px-3 py-2 rounded-lg text-sm transition ${cat.slug === slug ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                        {cat.name} ({cat.count})
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Price Range</h3>
                <div className="space-y-2">
                  {['Under ₹100', '₹100 - ₹300', '₹300 - ₹500', 'Above ₹500'].map(range => (
                    <label key={range} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
                      {range}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Availability</h3>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
                  In Stock Only
                </label>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {sorted.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
