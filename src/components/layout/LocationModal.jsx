import { useState } from 'react'
import { MapPin, X, Loader2, CheckCircle2, XCircle, Truck } from 'lucide-react'
import { useLocationContext } from '../../context/LocationContext'

export default function LocationModal() {
  const {
    location,
    showModal,
    setShowModal,
    modalState,
    setModalState,
    loading,
    error,
    detectLocation,
    setManualLocation,
    handleNotNow,
    clearLocation,
  } = useLocationContext()

  const [manualPincode, setManualPincode] = useState('')
  const [manualError, setManualError] = useState('')

  if (!showModal) return null

  const handleManualCheck = async (e) => {
    e.preventDefault()
    setManualError('')
    if (manualPincode.length !== 6 || isNaN(manualPincode)) {
      setManualError('Please enter a valid 6-digit pincode.')
      return
    }

    const success = await setManualLocation(manualPincode)
    if (success) {
      setModalState('result')
    } else {
      setManualError('Failed to verify pincode. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleNotNow}
      />

      {/* Modal Card */}
      <div className="relative bg-white dark:bg-[#0c1424] w-full max-w-md rounded-3xl shadow-2xl p-8 overflow-hidden transform transition-all duration-300 scale-100 border border-gray-100 dark:border-gray-800 text-center">
        {/* Close Button */}
        <button
          onClick={handleNotNow}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X size={20} />
        </button>

        {/* 1. Prompt Stage */}
        {modalState === 'prompt' && (
          <div className="flex flex-col items-center">
            {/* Header/Banner/Icon */}
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center animate-bounce">
                <MapPin className="text-[#CE2028] w-10 h-10" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#CE2028] rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                ✓
              </div>
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Deliver faster to your doorstep
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
              Enable your location to automatically check delivery availability and show products available in your area.
            </p>

            <div className="w-full flex flex-col gap-3">
              <button
                onClick={detectLocation}
                className="w-full py-3.5 bg-[#CE2028] hover:bg-[#B51622] text-white font-semibold rounded-2xl shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all duration-200 flex items-center justify-center gap-2 border-none"
              >
                <MapPin size={18} />
                Enable Location
              </button>
              <button
                onClick={handleNotNow}
                className="w-full py-3.5 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-300 font-semibold rounded-2xl border border-gray-200 dark:border-gray-700 transition-all duration-200"
              >
                Not Now
              </button>
            </div>

            <span className="mt-6 text-xs text-gray-450 dark:text-gray-500 flex items-center gap-1.5 justify-center">
              📍 You can change this anytime from the location selector.
            </span>
          </div>
        )}

        {/* 2. Detecting Stage */}
        {modalState === 'detecting' && (
          <div className="flex flex-col items-center py-6">
            <div className="relative mb-8">
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 rounded-full bg-red-100 dark:bg-red-950/20 animate-ping opacity-75" />
              <div className="relative w-20 h-20 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center">
                <MapPin className="text-[#CE2028] w-10 h-10 animate-pulse" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Detecting your location...
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Please wait while we find the best serviceability for you.
            </p>

            {/* Horizontal progress/loader bar */}
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-8">
              <div className="h-full bg-gradient-to-r from-[#CE2028] to-red-400 animate-infinite-loading rounded-full" />
            </div>

            <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1.5 font-medium">
              🛡️ Your location is secure and will only be used for delivery check.
            </span>
          </div>
        )}

        {/* 3. Result Stage */}
        {modalState === 'result' && (
          <div className="flex flex-col items-center">
            {location && location.isServiceable ? (
              // Serviceable view
              <>
                <div className="w-16 h-16 bg-green-50 dark:bg-green-950/30 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="text-green-500 w-10 h-10" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Great! We deliver to you
                </h3>

                {/* Location Capsule */}
                <div className="w-full bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-850 rounded-2xl p-4 mb-4 flex items-start gap-3 text-left">
                  <MapPin className="text-[#CE2028] shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {location.area ? `${location.area}, ` : ''}{location.city || 'Selected Location'}
                    </p>
                    <p className="text-xs text-gray-450 dark:text-gray-450">
                      Pincode: {location.pincode}
                    </p>
                  </div>
                </div>

                {/* Estimated Delivery Time Banner */}
                {location.deliveryDetails?.estimatedDeliveryTimeMins && (
                  <div className="w-full bg-red-50/50 dark:bg-red-950/10 border border-red-100/50 dark:border-red-950/30 rounded-2xl p-4 mb-8 flex items-center gap-3 text-left">
                    <Truck className="text-[#CE2028]" size={20} />
                    <div>
                      <p className="text-xs text-gray-450 dark:text-gray-400">Estimated delivery</p>
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                        {location.deliveryDetails.estimatedDeliveryTimeMins} mins
                      </p>
                    </div>
                  </div>
                )}

                <div className="w-full flex flex-col gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full py-3.5 bg-[#CE2028] hover:bg-[#B51622] text-white font-semibold rounded-2xl shadow-lg shadow-red-500/20 transition-all duration-200 border-none"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={clearLocation}
                    className="text-sm font-semibold text-[#CE2028] hover:underline bg-transparent border-none mt-2"
                  >
                    Change Location
                  </button>
                </div>
              </>
            ) : (
              // Unserviceable or error view
              <>
                <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center mb-6">
                  <XCircle className="text-red-500 w-10 h-10" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Currently we don't deliver here
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                  We are expanding fast! Join our waitlist or enter another pincode to check.
                </p>

                {/* Pincode Entry Form */}
                <form onSubmit={handleManualCheck} className="w-full mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualPincode}
                      onChange={(e) => setManualPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit pincode"
                      className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl focus:outline-none focus:border-[#CE2028] text-gray-800 dark:text-white text-sm"
                    />
                    <button
                      type="submit"
                      disabled={loading || manualPincode.length !== 6}
                      className="px-5 bg-[#CE2028] text-white font-semibold rounded-xl hover:bg-[#B51622] transition disabled:bg-gray-300 border-none flex items-center justify-center"
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : 'Check'}
                    </button>
                  </div>
                  {manualError && (
                    <p className="text-xs text-red-500 text-left mt-1.5 font-medium">{manualError}</p>
                  )}
                  {error && (
                    <p className="text-xs text-red-500 text-left mt-1.5 font-medium">{error}</p>
                  )}
                </form>

                <div className="w-full flex flex-col gap-2">
                  <button
                    onClick={detectLocation}
                    className="text-sm font-semibold text-[#CE2028] hover:underline bg-transparent border-none"
                  >
                    Try detecting location again
                  </button>
                  <button
                    onClick={handleNotNow}
                    className="text-sm font-semibold text-[#CE2028] hover:underline bg-transparent border-none mt-2"
                  >
                    Not Now
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
