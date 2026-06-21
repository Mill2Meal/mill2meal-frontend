import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, Minus, Plus, ShoppingCart, Heart, Truck, Shield, RotateCcw, Leaf, Loader2 } from 'lucide-react'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/common/ProductCard'
import { api, getAbsoluteImageUrl } from '../lib/api'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { addToCart } = useCart()
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [activeTab, setActiveTab] = useState('description')
  const [mainImage, setMainImage] = useState(0)
  const [relatedProducts, setRelatedProducts] = useState([])

  useEffect(() => {
    async function loadProductDetail() {
      setLoading(true)
      try {
        const p = await api.products.get(id)
        setProduct(p)
        setQuantity(1)
        setSelectedVariant(0)
        setMainImage(0)

        // Fetch related products from same category if category ID is available
        if (p.category?.categoryId) {
          const related = await api.products.list(`limit=5&categoryId=${p.category.categoryId}&isActive=true`)
          if (related && related.items) {
            setRelatedProducts(related.items.filter(item => item.productId !== p.productId).slice(0, 4))
          }
        }
      } catch (err) {
        console.error('Failed to load product details:', err)
      } finally {
        setLoading(false)
      }
    }
    loadProductDetail()
  }, [id])

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center gap-2 text-gray-500 font-semibold">
        <Loader2 className="animate-spin text-primary-600" /> Loading product details...
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container-custom py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Product not found</h2>
        <p className="text-gray-500 mt-2">The product you are looking for does not exist or has been removed.</p>
        <Link to="/" className="btn-primary inline-block mt-6">Go to Homepage</Link>
      </div>
    )
  }

  // Map backend fields
  const name = product.productName
  const price = parseFloat(product.salePrice)
  const originalPrice = product.mrp ? parseFloat(product.mrp) : price
  const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0
  const rating = product.rating || 4.5
  const reviews = product.reviews || 12
  const description = product.detailedDescription || product.shortDescription || 'No description available.'
  const packSize = product.packSize || 'Standard'
  const unit = product.unitOfMeasure || 'Unit'
  const shelfLife = product.shelfLifeDays ? `${product.shelfLifeDays} days` : 'Check label'
  const storage = product.storageInstructions || 'Store in a cool, dry place'
  
  // Images mapping
  const images = product.productImages && product.productImages.length > 0
    ? product.productImages.map(img => getAbsoluteImageUrl(img.imageUrl))
    : [getAbsoluteImageUrl(product.primaryImageUrl)]

  // Variants mapping (since backend might not support variants directly, we treat the packSize as standard variant)
  const variants = [packSize]
  const variantPrices = [price]

  const handleAddToCart = () => {
    addToCart(product, quantity, variants[selectedVariant])
  }

  return (
    <div className="pb-20 lg:pb-0">
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="container-custom">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-primary-600">Home</Link> /
            {product.category && (
              <>
                <Link to={`/category/${product.category.slug}`} className="hover:text-primary-600 capitalize">
                  {product.category.categoryName}
                </Link> /
              </>
            )}
            <span className="text-gray-800 font-medium">{name}</span>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div>
            <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-square mb-4">
              <img src={images[mainImage]} alt={name} className="w-full h-full object-cover" />
              {product.isBestSeller && (
                <span className="absolute top-4 left-4 px-4 py-1.5 rounded-full text-sm font-semibold text-white bg-primary-600">
                  Best Seller
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setMainImage(i)} className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition ${mainImage === i ? 'border-primary-600' : 'border-transparent'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-2">{name}</h1>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                <Star size={18} className="fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{rating}</span>
              </div>
              <span className="text-gray-400">|</span>
              <span className="text-sm text-gray-500">{reviews} reviews</span>
              <span className="text-gray-400">|</span>
              <span className={`text-sm font-medium ${product.availabilityStatus === 'In Stock' ? 'text-green-600' : 'text-amber-600'}`}>
                {product.availabilityStatus || 'In Stock'}
              </span>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-gray-900">₹{variantPrices[selectedVariant]}</span>
              {originalPrice > price && (
                <>
                  <span className="text-lg text-gray-400 line-through">₹{originalPrice}</span>
                  <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">Save {discount}%</span>
                </>
              )}
            </div>

            {/* Variants */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Size / Quantity</p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v, i) => (
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
                onClick={handleAddToCart}
                disabled={product.availabilityStatus === 'Out Of Stock'}
                className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={20} /> {product.availabilityStatus === 'Out Of Stock' ? 'Out of Stock' : 'Add to Cart'}
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
                {['description', 'details', 'storage'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-medium capitalize transition border-b-2 -mb-px ${activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {activeTab === 'description' && <p className="text-gray-600 leading-relaxed">{description}</p>}
              {activeTab === 'details' && (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Pack Size</span>
                    <span className="font-medium text-gray-800">{packSize}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Unit</span>
                    <span className="font-medium text-gray-800">{unit}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Shelf Life</span>
                    <span className="font-medium text-gray-800">{shelfLife}</span>
                  </div>
                  {product.fssaiLicenseNumber && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">FSSAI Number</span>
                      <span className="font-medium text-gray-800">{product.fssaiLicenseNumber}</span>
                    </div>
                  )}
                  {product.ingredients && (
                    <div className="col-span-2 py-2 border-b border-gray-100">
                      <span className="text-gray-500 block mb-1">Ingredients</span>
                      <span className="font-medium text-gray-800">{product.ingredients}</span>
                    </div>
                  )}
                  {product.nutritionalInfo && (
                    <div className="col-span-2 py-2 border-b border-gray-100">
                      <span className="text-gray-500 block mb-1">Nutritional Info</span>
                      <span className="font-medium text-gray-800">{product.nutritionalInfo}</span>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'storage' && (
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">{storage}</p>
                  {product.manufacturerDetails && (
                    <p className="text-xs text-gray-400">Manufacturer: {product.manufacturerDetails}</p>
                  )}
                  {product.countryOfOrigin && (
                    <p className="text-xs text-gray-400">Origin: {product.countryOfOrigin}</p>
                  )}
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
              {relatedProducts.map(p => <ProductCard key={p.productId} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
