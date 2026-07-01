import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, Loader2 } from 'lucide-react'
import ProductCard from '../components/common/ProductCard'
import { api } from '../lib/api'

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const filter = searchParams.get('filter') || ''
  
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('Search Results')

  useEffect(() => {
    async function performSearch() {
      setLoading(true)
      try {
        if (filter === 'bestsellers') {
          setTitle('Best Sellers')
          const data = await api.products.list('isActive=true&limit=100')
          if (data && data.items) {
            const bestSellers = data.items.filter(p => p.isBestSeller)
            setResults(bestSellers.length > 0 ? bestSellers : data.items.slice(0, 8))
          } else {
            setResults([])
          }
        } else if (filter === 'newarrivals') {
          setTitle('New Arrivals')
          const data = await api.products.list('isActive=true&limit=100')
          if (data && data.items) {
            setResults(data.items.slice(4, 20))
          } else {
            setResults([])
          }
        } else if (!query) {
          setTitle('All Products')
          const data = await api.products.list('isActive=true&limit=100')
          setResults(data?.items || [])
        } else {
          setTitle(`Search Results for "${query}"`)
          const response = await api.search.products(query, 'isActive=true&limit=40')
          if (response && response.items) {
            setResults(response.items)
          } else {
            setResults([])
          }
        }
      } catch (err) {
        console.error('Failed to perform search:', err)
        setResults([])
      } finally {
        setLoading(false)
      }
    }
    performSearch()
  }, [query, filter])

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center gap-2 text-gray-500 font-semibold">
        <Loader2 className="animate-spin text-primary-600" /> Loading products...
      </div>
    )
  }

  return (
    <div className="pb-20 lg:pb-0">
      <div className="container-custom py-8">
        <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
          {title}
        </h1>
        <p className="text-gray-500 text-sm mb-8">{results.length} products found</p>

        {results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {results.map(product => (
              <ProductCard key={product.productId} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border rounded-2xl p-8">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No products found</h2>
            <p className="text-gray-500 mb-4">We couldn't find any items matching your request.</p>
            <p className="text-xs text-gray-400">Try searching for other terms or visit categories from our navigation menu.</p>
            <Link to="/" className="btn-primary mt-6 inline-block">Return to Home</Link>
          </div>
        )}
      </div>
    </div>
  )
}
