import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { SlidersHorizontal, Loader2, X } from 'lucide-react'
import ProductCard from '../components/common/ProductCard'
import { api } from '../lib/api'

export default function CategoryPage() {
  const { slug } = useParams()
  const [sortBy, setSortBy] = useState('popular')
  const [showFilters, setShowFilters] = useState(false)
  const [category, setCategory] = useState(null)
  const [categoriesList, setCategoriesList] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Filter States
  const [selectedPrices, setSelectedPrices] = useState([])
  const [inStockOnly, setInStockOnly] = useState(false)
  const [appliedPrices, setAppliedPrices] = useState([])
  const [appliedInStock, setAppliedInStock] = useState(false)

  useEffect(() => {
    async function loadCategoryData() {
      setLoading(true)
      try {
        const catResponse = await api.categories.list('limit=100&isActive=true')
        if (catResponse && catResponse.items) {
          setCategoriesList(catResponse.items)
          const currentCat = catResponse.items.find(c => c.slug === slug)
          setCategory(currentCat)

          if (currentCat) {
            const prodResponse = await api.products.list(`limit=100&categoryId=${currentCat.categoryId}&isActive=true`)
            if (prodResponse && prodResponse.items) {
              setProducts(prodResponse.items)
            } else {
              setProducts([])
            }
          } else {
            const prodResponse = await api.products.list('limit=100&isActive=true')
            setProducts(prodResponse?.items || [])
          }
        }
      } catch (err) {
        console.error('Failed to load category products:', err)
      } finally {
        setLoading(false)
      }
    }
    loadCategoryData()
  }, [slug])

  const handlePriceChange = (range) => {
    setSelectedPrices(prev => {
      const next = prev.includes(range) ? prev.filter(r => r !== range) : [...prev, range];
      setAppliedPrices(next);
      return next;
    });
  }

  const handleStockChange = (checked) => {
    setInStockOnly(checked);
    setAppliedInStock(checked);
  }

  const applyFilters = () => {
    setAppliedPrices(selectedPrices)
    setAppliedInStock(inStockOnly)
    setShowFilters(false)
  }

  const clearFilters = () => {
    setSelectedPrices([])
    setInStockOnly(false)
    setAppliedPrices([])
    setAppliedInStock(false)
    setShowFilters(false)
  }

  const getFilteredAndSortedProducts = () => {
    let filtered = [...products]

    // 1. Price filters
    if (appliedPrices.length > 0) {
      filtered = filtered.filter(p => {
        const price = parseFloat(p.salePrice || p.price || 0)
        return appliedPrices.some(range => {
          if (range === 'under-100') return price < 100
          if (range === '100-300') return price >= 100 && price <= 300
          if (range === '300-500') return price >= 300 && price <= 500
          if (range === 'above-500') return price > 500
          return false
        })
      })
    }

    // 2. Stock Availability filter
    if (appliedInStock) {
      filtered = filtered.filter(p => p.availabilityStatus !== 'Out Of Stock')
    }

    // 3. Sorting
    return filtered.sort((a, b) => {
      const priceA = parseFloat(a.salePrice || a.price || 0)
      const priceB = parseFloat(b.salePrice || b.price || 0)
      const ratingA = a.rating || 4.5
      const ratingB = b.rating || 4.5
      const reviewsA = a.reviews || 12
      const reviewsB = b.reviews || 12

      if (sortBy === 'price-low') return priceA - priceB
      if (sortBy === 'price-high') return priceB - priceA
      if (sortBy === 'rating') return ratingB - ratingA
      return reviewsB - reviewsA // 'popular'
    })
  }

  const sortedAndFiltered = getFilteredAndSortedProducts()

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center gap-2 text-gray-500 font-semibold">
        <Loader2 className="animate-spin text-primary-600" /> Loading products...
      </div>
    )
  }

  return (
    <div className="pb-20 lg:pb-0">
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="container-custom">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-primary-600">Home</Link> / <span className="text-gray-800 font-medium">{category?.categoryName || 'All Products'}</span>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900">{category?.categoryName || 'All Products'}</h1>
            <p className="text-gray-500 text-sm mt-1">{sortedAndFiltered.length} products available</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(true)}
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
                  {categoriesList.map(cat => (
                    <li key={cat.categoryId}>
                      <Link to={`/category/${cat.slug}`} className={`block px-3 py-2 rounded-lg text-sm transition ${cat.slug === slug ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                        {cat.categoryName}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Price Range</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Under ₹100', value: 'under-100' },
                    { label: '₹100 - ₹300', value: '100-300' },
                    { label: '₹300 - ₹500', value: '300-500' },
                    { label: 'Above ₹500', value: 'above-500' }
                  ].map(item => (
                    <label key={item.value} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPrices.includes(item.value)}
                        onChange={() => handlePriceChange(item.value)}
                        className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Availability</h3>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => handleStockChange(e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                  />
                  In Stock Only
                </label>
              </div>

              <div className="pt-4 flex gap-2">
                <button
                  onClick={applyFilters}
                  className="flex-1 btn-primary text-xs py-2 rounded-lg text-center font-bold"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="flex-1 btn-outline text-xs py-2 rounded-lg text-center font-semibold border-gray-300 text-gray-700"
                >
                  Clear
                </button>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {sortedAndFiltered.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <p className="text-gray-500">No products found matching filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {sortedAndFiltered.map(product => (
                  <ProductCard key={product.productId} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <div className="relative ml-0 mr-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-12 px-6 shadow-xl">
            <div className="flex items-center justify-between px-2 pb-4 border-b">
              <h2 className="text-lg font-bold text-gray-900 font-heading">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="text-gray-500 p-2"><X size={20} /></button>
            </div>
            <div className="mt-4 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Categories</h3>
                <ul className="space-y-2">
                  {categoriesList.map(cat => (
                    <li key={cat.categoryId}>
                      <Link
                        to={`/category/${cat.slug}`}
                        onClick={() => setShowFilters(false)}
                        className={`block px-3 py-2 rounded-lg text-sm transition ${cat.slug === slug ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        {cat.categoryName}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Price Range</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Under ₹100', value: 'under-100' },
                    { label: '₹100 - ₹300', value: '100-300' },
                    { label: '₹300 - ₹500', value: '300-500' },
                    { label: 'Above ₹500', value: 'above-500' }
                  ].map(item => (
                    <label key={item.value} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPrices.includes(item.value)}
                        onChange={() => handlePriceChange(item.value)}
                        className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Availability</h3>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => handleStockChange(e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                  />
                  In Stock Only
                </label>
              </div>

              <div className="pt-4 flex gap-2">
                <button
                  onClick={applyFilters}
                  className="flex-1 btn-primary text-xs py-2 rounded-lg text-center font-bold"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="flex-1 btn-outline text-xs py-2 rounded-lg text-center font-semibold border-gray-300 text-gray-700"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
