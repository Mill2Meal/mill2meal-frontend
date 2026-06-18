import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import ProductCard from '../components/common/ProductCard'
import { products } from '../data/products'

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

  const results = products.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.category.toLowerCase().includes(query.toLowerCase()) ||
    p.description.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="pb-20 lg:pb-0">
      <div className="container-custom py-8">
        <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
          Search Results for "{query}"
        </h1>
        <p className="text-gray-500 text-sm mb-8">{results.length} products found</p>

        {results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {results.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No products found</h2>
            <p className="text-gray-500">Try searching for "rice", "dal", "oil" or "ghee"</p>
          </div>
        )}
      </div>
    </div>
  )
}
