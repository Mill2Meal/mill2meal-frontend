import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import ProductCard from '../common/ProductCard'
import { api } from '../../lib/api'

export default function BestSellers() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBestSellers() {
      try {
        const data = await api.products.list('isActive=true&limit=10')
        if (data && data.items) {
          // If product isBestSeller is flag, filter by that, otherwise slice first 4
          const bestSellers = data.items.filter(p => p.isBestSeller).slice(0, 4)
          setProducts(bestSellers.length > 0 ? bestSellers : data.items.slice(0, 4))
        }
      } catch (err) {
        console.error('Failed to load best sellers:', err)
      } finally {
        setLoading(false)
      }
    }
    loadBestSellers()
  }, [])

  if (loading) {
    return (
      <div className="py-12 text-center text-gray-500 font-semibold">
        Loading best sellers...
      </div>
    )
  }

  if (products.length === 0) return null

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container-custom">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="section-title">Best Sellers</h2>
            <p className="section-subtitle">Loved by 50,000+ families</p>
          </div>
          <Link to="/search?q=" className="hidden sm:flex items-center gap-1 text-primary-600 font-semibold hover:gap-2 transition-all">
            View All <ArrowRight size={18} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map(product => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Link to="/search?q=" className="btn-outline inline-flex items-center gap-2">
            View All Products <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  )
}
