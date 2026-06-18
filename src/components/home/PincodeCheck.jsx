import { useState } from 'react'
import { MapPin, Check, X } from 'lucide-react'

export default function PincodeCheck() {
  const [pincode, setPincode] = useState('')
  const [status, setStatus] = useState(null)

  const checkPincode = () => {
    if (pincode.length === 6) {
      const serviceable = ['500081', '500082', '500084', '500032', '500034', '500008', '500016', '500072', '500073', '500075']
      setStatus(serviceable.includes(pincode) ? 'available' : 'unavailable')
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
            <button onClick={checkPincode} className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition">
              Check
            </button>
          </div>
          {status === 'available' && (
            <span className="flex items-center gap-1 text-green-600 text-sm font-medium"><Check size={16} /> Delivery available! (1-2 days)</span>
          )}
          {status === 'unavailable' && (
            <span className="flex items-center gap-1 text-red-500 text-sm font-medium"><X size={16} /> Not serviceable yet</span>
          )}
        </div>
      </div>
    </section>
  )
}
