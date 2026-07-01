import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import ProductCard from '../common/ProductCard'
import { api } from '../../lib/api'

export default function NewArrivals() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadNewArrivals() {
      try {
        const data = await api.products.list('isActive=true&limit=12')
        if (data && data.items) {
          // Slice products from offset 4 to 8, or filter if there's custom logic
          // (Let's show items 4-8 as new arrivals to keep it different from best sellers)
          const newArrivals = data.items.slice(4, 8)
          setProducts(newArrivals.length > 0 ? newArrivals : data.items.slice(0, 4))
        }
      } catch (err) {
        console.error('Failed to load new arrivals:', err)
      } finally {
        setLoading(false)
      }
    }
    loadNewArrivals()
  }, [])

  if (loading) {
    return (
      <div className="py-12 text-center text-gray-500 font-semibold">
        Loading new arrivals...
      </div>
    )
  }

  if (products.length === 0) return null

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container-custom">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="section-title">New Arrivals</h2>
            <p className="section-subtitle">Latest additions to our collection</p>
          </div>
          <Link to="/search?filter=newarrivals" className="hidden sm:flex items-center gap-1 text-primary-600 font-semibold hover:gap-2 transition-all">
            View All <ArrowRight size={18} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map(product => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
