import { Link, useNavigate } from 'react-router-dom'
import { Star, Plus } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { getAbsoluteImageUrl } from '../../lib/api'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const navigate = useNavigate()

  const id = product.productId || product.id
  const name = product.productName || product.name
  const imageUrl = getAbsoluteImageUrl(product.primaryImageUrl || product.image || product.productImages?.[0]?.imageUrl)
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
    <div className="card group">
      <Link to={`/product/${id}`} className="block relative overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
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
      <div className="p-4">
        <Link to={`/product/${id}`}>
          <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1 hover:text-primary-600 transition">{name}</h3>
        </Link>
        <p className="text-sm text-gray-500 mb-2">{unit}</p>
        <div className="flex items-center gap-1 mb-3">
          <Star size={14} className="fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium text-gray-700">{rating}</span>
          <span className="text-xs text-gray-400">({reviews})</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900">₹{price}</span>
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
