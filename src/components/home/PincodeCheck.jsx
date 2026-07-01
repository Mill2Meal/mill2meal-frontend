import { useState, useEffect } from 'react'
import { MapPin, Check, X, Loader2 } from 'lucide-react'
import { useLocationContext } from '../../context/LocationContext'

export default function PincodeCheck() {
  const { location, setManualLocation, loading: contextLoading } = useLocationContext()
  const [pincode, setPincode] = useState('')
  const [loading, setLoading] = useState(false)

  // Sync input value with location from context
  useEffect(() => {
    if (location?.pincode) {
      setPincode(location.pincode)
    }
  }, [location?.pincode])

  const checkPincode = async () => {
    if (pincode.length === 6) {
      setLoading(true)
      await setManualLocation(pincode)
      setLoading(false)
    }
  }

  const isServiceable = location?.isServiceable
  const displayMessage = location?.isServiceable
    ? (location.deliveryDetails?.estimatedDeliveryTimeMins
        ? `Delivery Available! Est: ${location.deliveryDetails.estimatedDeliveryTimeMins} mins`
        : `Serviceable by ${location.deliveryDetails?.store?.storeName || 'nearest store'}`)
    : (location ? (location.deliveryDetails?.message || 'Delivery not available at this location') : '')

  return (
    <section className="bg-white py-6 border-b">
      <div className="container-custom">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin size={20} className="text-[#CE2028]" />
            <span className="font-medium text-gray-800 dark:text-gray-250">Check delivery at your pincode</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={pincode}
              onChange={(e) => {
                setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))
              }}
              placeholder="Enter pincode"
              className="px-4 py-2 border border-[#CE2028] bg-white rounded-lg w-36 focus:outline-none focus:ring-1 focus:ring-[#CE2028] focus:border-[#CE2028] text-gray-850 dark:text-white placeholder-gray-400"
            />
            <button onClick={checkPincode} disabled={loading || contextLoading || pincode.length !== 6} className="px-4 py-2 bg-[#CE2028] hover:bg-[#A8161D] text-white rounded-lg font-medium shadow-sm hover:shadow transition disabled:bg-gray-400 border-none flex items-center justify-center min-w-[70px]">
              {(loading || contextLoading) ? <Loader2 size={16} className="animate-spin" /> : 'Check'}
            </button>
          </div>
          {location && isServiceable && (
            <span className="flex items-center gap-1 text-green-600 text-sm font-medium"><Check size={16} /> {displayMessage}</span>
          )}
          {location && !isServiceable && (
            <span className="flex items-center gap-1 text-red-500 text-sm font-medium"><X size={16} /> {displayMessage}</span>
          )}
        </div>
      </div>
    </section>
  )
}
