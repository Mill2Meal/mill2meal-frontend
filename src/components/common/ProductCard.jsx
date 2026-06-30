import { Link, useNavigate } from 'react-router-dom'
import { Star, Plus } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { getAbsoluteImageUrl, resolveProductImage } from '../../lib/api'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const navigate = useNavigate()

  const id = product.productId || product.id
  const name = product.productName || product.name
  const imageUrl = resolveProductImage(product)
  const unit = product.packSize ? `${product.packSize} ${product.unitOfMeasure || ''}` : (product.unit || '1 Unit')
  const price = parseFloat(product.salePrice || product.price)
  const originalPrice = parseFloat(product.mrp || product.originalPrice || price)
  const rating = product.rating || 4.5
  const reviews = product.reviews || 12
  const badge = product.isBestSeller ? 'Best Seller' : product.badge
  const discount = product.discount || (originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await addToCart(product, 1)
      navigate('/cart')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 group border border-gray-100/80 dark:border-gray-700">
      {/* Image Sub-Card Container */}
      <div className="relative rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900/50 border border-gray-100/50 dark:border-gray-700/50 p-2 shrink-0">
        <Link to={`/product/${id}`} className="block relative overflow-hidden rounded-lg">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500 rounded-lg"
          />
          {badge && (
            <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white ${
              badge === 'Best Seller' ? 'bg-secondary-500' :
              badge === 'Organic' ? 'bg-green-600' :
              badge === 'Premium' ? 'bg-gold' :
              badge === 'New' ? 'bg-purple-600' :
              badge === 'Healthy' ? 'bg-teal-600' :
              'bg-primary-600'
            }`}>
              {badge}
            </span>
          )}
          {discount > 0 && (
            <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </span>
          )}
        </Link>
      </div>

      {/* Details Sub-Card Container */}
      <div className="flex flex-col flex-1 bg-gray-50/50 dark:bg-gray-900/10 p-3 rounded-xl border border-gray-100/50 dark:border-gray-700/20">
        <Link to={`/product/${id}`}>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1 line-clamp-1 hover:text-primary-600 dark:hover:text-primary-400 transition">{name}</h3>
        </Link>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{unit}</p>
        <div className="flex items-center gap-1 mb-3">
          <Star size={14} className="fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{rating}</span>
          <span className="text-xs text-gray-400">({reviews})</span>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">₹{price}</span>
            {originalPrice > price && (
              <span className="text-sm text-gray-400 line-through ml-2">₹{originalPrice}</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition shadow-md hover:shadow-lg"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
