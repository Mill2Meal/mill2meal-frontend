import { useState } from 'react'
import { MapPin, Check, X, Loader2 } from 'lucide-react'
import { api } from '../../lib/api'

export default function PincodeCheck() {
  const [pincode, setPincode] = useState('')
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const checkPincode = async () => {
    if (pincode.length === 6) {
      setLoading(true)
      setStatus(null)
      try {
        const response = await api.stores.serviceability(pincode)
        if (response && response.isServiceable) {
          setStatus('available')
          setMessage(response.message || `Serviceable by ${response.store?.storeName || 'our nearest store'}`)
        } else {
          setStatus('unavailable')
          setMessage(response?.message || 'Delivery is currently not available at this location')
        }
      } catch (err) {
        console.error('Failed to verify serviceability:', err)
        setStatus('unavailable')
        setMessage('Failed to check serviceability. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <section className="bg-white py-6 border-b">
      <div className="container-custom">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin size={20} className="text-primary-600" />
            <span className="font-medium">Check delivery at your pincode</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={pincode}
              onChange={(e) => { setPincode(e.target.value.replace(/\D/g, '').slice(0, 6)); setStatus(null) }}
              placeholder="Enter pincode"
              className="px-4 py-2 border border-gray-300 rounded-lg w-36 focus:outline-none focus:border-primary-500"
            />
            <button onClick={checkPincode} disabled={loading || pincode.length !== 6} className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:bg-gray-400">
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Check'}
            </button>
          </div>
          {status === 'available' && (
            <span className="flex items-center gap-1 text-green-600 text-sm font-medium"><Check size={16} /> {message || 'Delivery available!'}</span>
          )}
          {status === 'unavailable' && (
            <span className="flex items-center gap-1 text-red-500 text-sm font-medium"><X size={16} /> {message || 'Not serviceable yet'}</span>
          )}
        </div>
      </div>
    </section>
  )
}
