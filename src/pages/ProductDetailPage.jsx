import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, Minus, Plus, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Leaf, ChevronDown, ChevronUp } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { products } from '../data/products'
import ProductCard from '../components/common/ProductCard'

export default function ProductDetailPage() {
  const { id } = useParams()
  const product = products.find(p => p.id === parseInt(id)) || products[0]
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [activeTab, setActiveTab] = useState('description')
  const [mainImage, setMainImage] = useState(0)

  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4)

  return (
    <div className="pb-20 lg:pb-0">
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="container-custom">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-primary-600">Home</Link> /
            <Link to={`/category/${product.category}`} className="hover:text-primary-600 capitalize">{product.category.replace('-', ' ')}</Link> /
            <span className="text-gray-800 font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div>
            <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-square mb-4">
              <img src={product.images[mainImage]} alt={product.name} className="w-full h-full object-cover" />
              {product.badge && (
                <span className="absolute top-4 left-4 px-4 py-1.5 rounded-full text-sm font-semibold text-white bg-primary-600">
                  {product.badge}
                </span>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setMainImage(i)} className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition ${mainImage === i ? 'border-primary-600' : 'border-transparent'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                <Star size={18} className="fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{product.rating}</span>
              </div>
              <span className="text-gray-400">|</span>
              <span className="text-sm text-gray-500">{product.reviews} reviews</span>
              <span className="text-gray-400">|</span>
              <span className="text-sm text-green-600 font-medium">In Stock</span>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-gray-900">₹{product.variantPrices[selectedVariant]}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-lg text-gray-400 line-through">₹{product.originalPrice}</span>
                  <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">Save {product.discount}%</span>
                </>
              )}
            </div>

            {/* Variants */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Size / Quantity</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v, i) => (
                  <button
                    key={v}
                    onClick={() => setSelectedVariant(i)}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition ${selectedVariant === i ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-gray-50 transition"><Minus size={16} /></button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-gray-50 transition"><Plus size={16} /></button>
              </div>
              <button
                onClick={() => addToCart({ ...product, price: product.variantPrices[selectedVariant] }, quantity, product.variants[selectedVariant])}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} /> Add to Cart
              </button>
              <button className="p-3 border border-gray-300 rounded-lg hover:border-red-300 hover:text-red-500 transition">
                <Heart size={20} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-sm text-gray-600"><Truck size={16} className="text-primary-600" /> Free delivery above ₹499</div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><Shield size={16} className="text-primary-600" /> FSSAI Certified</div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><RotateCcw size={16} className="text-primary-600" /> Easy Returns</div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><Leaf size={16} className="text-primary-600" /> No Preservatives</div>
            </div>

            {/* Tabs */}
            <div className="border-t pt-6">
              <div className="flex gap-6 border-b mb-4">
                {['description', 'nutrition', 'storage'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-medium capitalize transition border-b-2 -mb-px ${activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {activeTab === 'description' && <p className="text-gray-600 leading-relaxed">{product.description}</p>}
              {activeTab === 'nutrition' && (
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(product.nutrition).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500 capitalize">{key}</span>
                      <span className="text-sm font-medium text-gray-800">{val}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'storage' && (
                <div className="space-y-2">
                  <p className="text-gray-600">{product.storage}</p>
                  <p className="text-sm text-gray-500">FSSAI License: {product.fssai}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="section-title mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
