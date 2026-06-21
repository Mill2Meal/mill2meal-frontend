import { useEffect, useState } from 'react'
import { MapPin, Clock, Phone, Navigation, Loader2, ArrowLeft, CheckCircle2, ShoppingBag, MessageSquare } from 'lucide-react'
import { api, getAbsoluteImageUrl } from '../lib/api'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function StoreLocatorPage() {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStore, setSelectedStore] = useState(null)
  
  // Details lists
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [detailsLoading, setDetailsLoading] = useState(false)

  const navigate = useNavigate()
  const { addToCart } = useCart()

  useEffect(() => {
    async function loadStores() {
      try {
        const response = await api.stores.list('isActive=true')
        const list = response?.items || response || []
        setStores(list)
      } catch (err) {
        console.error('Failed to load stores:', err)
      } finally {
        setLoading(false)
      }
    }
    loadStores()
  }, [])

  // Load products and categories when a store is selected
  useEffect(() => {
    if (!selectedStore) return

    async function loadStoreInventory() {
      setDetailsLoading(true)
      try {
        const [catResponse, prodResponse] = await Promise.all([
          api.categories.list('isActive=true&limit=10'),
          api.products.list('isActive=true&limit=12')
        ])
        setCategories(catResponse?.items || [])
        setProducts(prodResponse?.items || [])
      } catch (err) {
        console.error('Failed to load store catalog details:', err)
      } finally {
        setDetailsLoading(false)
      }
    }
    loadStoreInventory()
  }, [selectedStore])

  const handleShopFromStore = (store) => {
    localStorage.setItem('activeStore', JSON.stringify({
      storeId: store.storeId,
      storeName: store.storeName,
      storeCode: store.storeCode,
      city: store.city,
      pincode: store.pincode
    }))
    navigate('/')
  }

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center gap-2 text-gray-500 font-semibold">
        <Loader2 className="animate-spin text-primary-600" /> Loading store locator...
      </div>
    )
  }

  // STORE DETAILS VIEW
  if (selectedStore) {
    const store = selectedStore
    const addressString = `${store.addressLine1}${store.addressLine2 ? `, ${store.addressLine2}` : ''}${store.landmark ? ` (Landmark: ${store.landmark})` : ''}, ${store.city}, ${store.state} - ${store.pincode}`
    
    return (
      <div className="pb-20 lg:pb-12 bg-gray-50 min-h-screen">
        {/* Header navigation bar */}
        <div className="bg-white border-b border-gray-100 py-6">
          <div className="container-custom flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedStore(null)} 
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-heading font-bold text-gray-900">{store.storeName}</h1>
                <p className="text-xs text-gray-500 mt-0.5">Store details, hours, and available items</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container-custom py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Store Details & Actions */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
                <h3 className="font-bold text-lg text-gray-900 border-b border-gray-100 pb-3">Store Details</h3>
                
                {/* Timings */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="mt-0.5 shrink-0 text-primary-600" />
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Address</p>
                      <p className="text-sm text-gray-700 mt-1">{addressString}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock size={18} className="mt-0.5 shrink-0 text-primary-600" />
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Opening Hours</p>
                      <p className="text-sm text-gray-700 mt-1">{store.storeTimings || '9:00 AM - 9:00 PM'}</p>
                    </div>
                  </div>

                  {store.contactMobile && (
                    <div className="flex items-start gap-3">
                      <Phone size={18} className="mt-0.5 shrink-0 text-primary-600" />
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Contact Phone</p>
                        <p className="text-sm text-gray-700 mt-1">{store.contactMobile}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Available Services */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3">Available Services</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                      <span>Home Delivery</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                      <span>Store Pickup</span>
                    </div>
                  </div>
                </div>

                {/* Serviceable Pincodes */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2">Serviceable Pincodes</p>
                  <p className="text-xs text-gray-600 font-mono leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                    {store.serviceablePincodes || 'All surrounding delivery zones'}
                  </p>
                </div>

                {/* Main Action buttons */}
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <button
                    onClick={() => handleShopFromStore(store)}
                    className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-xl text-sm transition shadow-sm"
                  >
                    <ShoppingBag size={16} /> Shop From This Store
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    {store.contactMobile && (
                      <a
                        href={`tel:${store.contactMobile}`}
                        className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-xs transition text-center"
                      >
                        <Phone size={14} /> Call Store
                      </a>
                    )}
                    <a
                      href="https://wa.me/919059503227"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-xs transition text-center"
                    >
                      <MessageSquare size={14} /> WhatsApp Support
                    </a>
                  </div>

                  <button
                    onClick={() => window.open(store.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.storeName + ' ' + addressString)}`, '_blank')}
                    className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-xs transition text-center"
                  >
                    <Navigation size={14} /> Google Map / Directions
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Catalog Categories & Products */}
            <div className="lg:col-span-2 space-y-6">
              {detailsLoading ? (
                <div className="py-20 text-center text-gray-400 font-semibold flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin text-primary-600" /> Loading store catalog...
                </div>
              ) : (
                <>
                  {/* Categories */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-lg text-gray-900 border-b border-gray-100 pb-3 mb-4">Available Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(cat => (
                        <Link
                          key={cat.categoryId}
                          to={`/category/${cat.slug}`}
                          className="px-4 py-2 bg-gray-50 hover:bg-primary-50 text-gray-700 hover:text-primary-700 text-xs font-semibold rounded-xl border border-gray-100 transition-all"
                        >
                          {cat.categoryName}
                        </Link>
                      ))}
                      {categories.length === 0 && (
                        <p className="text-sm text-gray-500">No categories loaded.</p>
                      )}
                    </div>
                  </div>

                  {/* Products Grid */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-lg text-gray-900 border-b border-gray-100 pb-3 mb-6">Available Products</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {products.map(prod => {
                        const price = parseFloat(prod.salePrice || prod.price);
                        const mrp = parseFloat(prod.mrp || price);
                        
                        return (
                          <div key={prod.productId} className="flex gap-4 p-4 border border-gray-100 rounded-xl hover:shadow-sm transition">
                            <img
                              src={getAbsoluteImageUrl(prod.primaryImageUrl || prod.productImages?.[0]?.imageUrl)}
                              alt={prod.productName}
                              className="w-20 h-20 object-cover rounded-lg border border-gray-100 shrink-0"
                            />
                            <div className="flex flex-col justify-between flex-1">
                              <div>
                                <h4 className="font-bold text-sm text-gray-800 line-clamp-1">{prod.productName}</h4>
                                <p className="text-xs text-gray-400 mt-0.5">{prod.packSize || '1 Unit'}</p>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-baseline gap-1">
                                  <span className="font-bold text-gray-900 text-sm">₹{price}</span>
                                  {mrp > price && (
                                    <span className="text-[10px] text-gray-400 line-through">₹{mrp}</span>
                                  )}
                                </div>
                                <button
                                  onClick={() => {
                                    addToCart(prod, 1);
                                    navigate('/cart');
                                  }}
                                  className="text-xs bg-primary-600 hover:bg-primary-700 text-white font-bold py-1 px-3 rounded-lg transition"
                                >
                                  + ADD
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {products.length === 0 && (
                        <p className="text-sm text-gray-500">No products configured.</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // STORE GRID LISTING VIEW (NO MAP, GRID-ALIGNED)
  return (
    <div className="pb-20 lg:pb-12 bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-100 py-8">
        <div className="container-custom">
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-2">Our Store Locator</h1>
          <p className="text-gray-500 text-sm">Select a store below to view hours, directions, available services, and shop online.</p>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500">
              No active stores found. Please check back later.
            </div>
          ) : (
            stores.map(store => {
              const addressString = `${store.addressLine1}${store.addressLine2 ? `, ${store.addressLine2}` : ''}, ${store.city}, ${store.state} - ${store.pincode}`
              
              return (
                <div 
                  key={store.storeId} 
                  onClick={() => setSelectedStore(store)}
                  className="bg-white rounded-2xl p-6 border border-gray-150 hover:border-primary-500 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-primary-600 line-clamp-1">{store.storeName}</h3>
                    <div className="space-y-2.5">
                      <div className="flex items-start gap-2.5 text-xs text-gray-600">
                        <MapPin size={16} className="mt-0.5 shrink-0 text-primary-600" />
                        <span className="line-clamp-2">{addressString}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-gray-600">
                        <Clock size={16} className="shrink-0 text-primary-600" />
                        <span>{store.storeTimings || '9:00 AM - 9:00 PM'}</span>
                      </div>
                      {store.contactMobile && (
                        <div className="flex items-center gap-2.5 text-xs text-gray-600">
                          <Phone size={16} className="shrink-0 text-primary-600" />
                          <span>{store.contactMobile}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-primary-600">
                    <span>View Store Details →</span>
                    <span className="px-2 py-0.5 bg-primary-50 border border-primary-100 text-[10px] rounded-full text-primary-700 uppercase tracking-wider">
                      {store.storeType === 'DARK_STORE' ? 'Fulfillment Center' : 'Retail Outlet'}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
