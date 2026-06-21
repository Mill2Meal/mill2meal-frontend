import { useEffect, useState } from 'react'
import { Tag, Copy, Check, Calendar, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'

export default function OffersSection() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    async function loadCoupons() {
      try {
        const data = await api.coupons.active()
        // Filter coupons that are active locally just in case
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

  if (loading) return null
  if (coupons.length === 0) return null

  const handleViewAllOffers = () => {
    const el = document.getElementById('categories-section')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="py-12 bg-gray-50 border-y border-gray-100">
      <div className="container-custom">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="section-title text-left flex items-center gap-2">
              🔥 Offers For You
            </h2>
            <p className="text-gray-500 text-xs md:text-sm mt-1">
              Apply these codes at checkout for extra savings on your order
            </p>
          </div>
          <button
            onClick={() => navigate('/offers')}
            className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-primary-600 hover:text-primary-750 transition self-start sm:self-auto shrink-0 bg-white px-4 py-2 rounded-xl border shadow-sm"
          >
            Explore <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map(coupon => {
            const isFlat = coupon.discountType === 'FLAT'
            const discountLabel = isFlat ? `₹${parseFloat(coupon.discountValue)}` : `${parseFloat(coupon.discountValue)}%`
            
            return (
              <div 
                key={coupon.couponId}
                className="bg-white border border-gray-150 hover:border-primary-500 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-0.5"
              >
                {/* Dotted coupon cut effect left and right */}
                <div className="absolute top-1/2 -left-3 w-6 h-6 bg-gray-50 rounded-full border border-gray-150 -translate-y-1/2 z-10" />
                <div className="absolute top-1/2 -right-3 w-6 h-6 bg-gray-50 rounded-full border border-gray-150 -translate-y-1/2 z-10" />
                
                <div className="space-y-3.5">
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
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {coupon.description || `Get ${discountLabel} discount on your order.`}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col gap-3">
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
      </div>

      {/* Copied Floating Toast */}
      {copiedCode && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-bounce text-xs font-bold border border-gray-800">
          <Check size={16} className="text-emerald-400" />
          <span>Coupon code "{copiedCode}" copied to clipboard!</span>
        </div>
      )}
    </section>
  )
}
