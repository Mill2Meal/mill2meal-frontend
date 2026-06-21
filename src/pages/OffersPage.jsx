import { useEffect, useState } from 'react'
import { Copy, Check, Calendar, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

export default function OffersPage() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState(null)

  useEffect(() => {
    async function loadCoupons() {
      try {
        const data = await api.coupons.active()
        const now = new Date()
        const activeCoupons = (data || []).filter(coupon => {
          return coupon.status && new Date(coupon.endDate) >= now
        })
        setCoupons(activeCoupons)
      } catch (err) {
        console.error('Failed to load coupons:', err)
      } finally {
        setLoading(false)
      }
    }
    loadCoupons()
  }, [])

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => {
      setCopiedCode(null)
    }, 2000)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="pb-20 lg:pb-12 bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-100 py-8">
        <div className="container-custom flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900">Offers & Coupons</h1>
            <p className="text-gray-500 text-xs md:text-sm mt-1">Explore all active promotions and coupon codes available for you</p>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {loading ? (
          <div className="py-20 text-center text-gray-500 font-semibold">
            Loading active offers...
          </div>
        ) : coupons.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border shadow-sm text-center max-w-md mx-auto">
            <p className="text-gray-500 font-medium">No active coupons available at the moment. Please check back later!</p>
            <Link to="/" className="btn-primary inline-block mt-6">
              Go to Home
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map(coupon => {
              const isFlat = coupon.discountType === 'FLAT'
              const discountLabel = isFlat ? `₹${parseFloat(coupon.discountValue)}` : `${parseFloat(coupon.discountValue)}%`
              
              return (
                <div 
                  key={coupon.couponId}
                  className="bg-white border border-gray-150 hover:border-primary-500 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-0.5"
                >
                  <div className="absolute top-1/2 -left-3 w-6 h-6 bg-gray-50 rounded-full border border-gray-150 -translate-y-1/2 z-10" />
                  <div className="absolute top-1/2 -right-3 w-6 h-6 bg-gray-50 rounded-full border border-gray-150 -translate-y-1/2 z-10" />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2 border-b border-dashed border-gray-100 pb-3">
                      <span className="font-mono font-black text-gray-900 bg-primary-50 text-primary-700 border border-primary-100 rounded-lg px-3 py-1 text-xs uppercase tracking-widest shadow-sm">
                        {coupon.code}
                      </span>
                      <span className="text-sm font-extrabold text-primary-600 font-heading">
                        {discountLabel} OFF
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">{coupon.name}</h4>
                      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                        {coupon.description || `Get ${discountLabel} discount on your order.`}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-gray-100 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                      <span>
                        {coupon.minimumOrderAmount && parseFloat(coupon.minimumOrderAmount) > 0 ? (
                          `Min. Order: ₹${parseFloat(coupon.minimumOrderAmount)}`
                        ) : (
                          'No Min. Order'
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={10} /> till {formatDate(coupon.endDate)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopy(coupon.code)}
                      className="w-full flex items-center justify-center gap-1.5 bg-gray-50 hover:bg-primary-50 text-gray-700 hover:text-primary-700 border border-gray-150 hover:border-primary-200 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                      {copiedCode === coupon.code ? (
                        <>
                          <Check size={14} className="text-emerald-500" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> Copy Code
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {copiedCode && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-bounce text-xs font-bold border border-gray-800">
          <Check size={16} className="text-emerald-400" />
          <span>Coupon code "{copiedCode}" copied to clipboard!</span>
        </div>
      )}
    </div>
  )
}
