import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../lib/api'

const LocationContext = createContext()

export function useLocationContext() {
  return useContext(LocationContext)
}

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem('m2m_user_location')
    return saved ? JSON.parse(saved) : null
  })

  const [showModal, setShowModal] = useState(false)
  const [modalState, setModalState] = useState('prompt') // 'prompt' | 'detecting' | 'result'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // On mount, check if location exists or if we should show the prompt
  useEffect(() => {
    const hasPrompted = localStorage.getItem('m2m_location_prompted')
    const manualLocation = localStorage.getItem('m2m_manual_location')

    if (!location && !hasPrompted && !manualLocation) {
      // First visit, show premium modal
      setShowModal(true)
    } else if (location) {
      // Returning user with active location, check for coordinates change or verify serviceability silently
      silentlyVerifyLocation(location)
    }
  }, [])

  // Setup geolocation watching to detect significant location changes
  useEffect(() => {
    if (!navigator.geolocation || !location?.lat || !location?.lng) return

    const handleWatch = (position) => {
      const { latitude, longitude } = position.coords
      const distance = getCoordinatesDistance(location.lat, location.lng, latitude, longitude)

      // Significant change threshold: ~2km (approx 0.018 degrees)
      if (distance > 2) {
        console.log('Significant location change detected, updating silently...')
        silentlyUpdateLocation(latitude, longitude)
      }
    }

    const handleError = (err) => {
      console.warn('Geolocation watch error:', err)
    }

    const watchId = navigator.geolocation.watchPosition(handleWatch, handleError, {
      enableHighAccuracy: true,
      maximumAge: 60000,
      timeout: 15000,
    })

    return () => navigator.geolocation.clearWatch(watchId)
  }, [location?.lat, location?.lng])

  // Haversine formula to compute distance in km
  function getCoordinatesDistance(lat1, lon1, lat2, lon2) {
    const R = 6371 // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180)
    const dLon = (lon2 - lon1) * (Math.PI / 180)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  async function silentlyVerifyLocation(currentLoc) {
    try {
      if (currentLoc.pincode) {
        const serviceRes = await api.stores.serviceability(currentLoc.pincode)
        const updated = {
          ...currentLoc,
          isServiceable: serviceRes?.isServiceable || false,
          deliveryDetails: serviceRes?.isServiceable ? serviceRes : null,
        }
        setLocation(updated)
        localStorage.setItem('m2m_user_location', JSON.stringify(updated))
      }
    } catch (err) {
      console.error('Silent serviceability check failed:', err)
    }
  }

  async function silentlyUpdateLocation(lat, lng) {
    try {
      const geoRes = await api.stores.reverseGeocode(lat, lng)
      if (geoRes && geoRes.pincode) {
        const serviceRes = await api.stores.serviceability(geoRes.pincode)
        const updated = {
          lat,
          lng,
          pincode: geoRes.pincode,
          city: geoRes.city || '',
          area: geoRes.area || '',
          formattedAddress: geoRes.formattedAddress || '',
          isServiceable: serviceRes?.isServiceable || false,
          deliveryDetails: serviceRes?.isServiceable ? serviceRes : null,
          permissionGranted: true,
        }
        setLocation(updated)
        localStorage.setItem('m2m_user_location', JSON.stringify(updated))
      }
    } catch (err) {
      console.error('Silent location refresh failed:', err)
    }
  }

  // Request browser location and query serviceability
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      setModalState('result')
      return
    }

    setModalState('detecting')
    setLoading(true)
    setError('')

    localStorage.setItem('m2m_location_prompted', 'true')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          // Reverse geocode via backend
          const geoRes = await api.stores.reverseGeocode(latitude, longitude)
          if (!geoRes || !geoRes.pincode) {
            throw new Error('Could not identify pincode for your location')
          }

          // Serviceability check via backend
          const serviceRes = await api.stores.serviceability(geoRes.pincode)

          const newLoc = {
            lat: latitude,
            lng: longitude,
            pincode: geoRes.pincode,
            city: geoRes.city || '',
            area: geoRes.area || '',
            formattedAddress: geoRes.formattedAddress || '',
            isServiceable: serviceRes?.isServiceable || false,
            deliveryDetails: serviceRes?.isServiceable ? serviceRes : null,
            permissionGranted: true,
          }

          setLocation(newLoc)
          localStorage.setItem('m2m_user_location', JSON.stringify(newLoc))
          localStorage.removeItem('m2m_manual_location') // Clear manual override since GPS succeeded
          setModalState('result')
        } catch (err) {
          console.error(err)
          setError(err.message || 'Unable to detect your location. Please enter pincode manually.')
          setModalState('result')
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        console.error('Geolocation permission/access denied:', err)
        setError('Location permission denied or unavailable. Please enter pincode manually.')
        setModalState('result')
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // Handle manual override
  const setManualLocation = async (pincodeStr) => {
    if (!pincodeStr || pincodeStr.length !== 6) return false

    setLoading(true)
    try {
      const serviceRes = await api.stores.serviceability(pincodeStr)

      const manualLoc = {
        lat: null,
        lng: null,
        pincode: pincodeStr,
        city: serviceRes?.store?.city || 'Selected Area',
        area: serviceRes?.store?.storeName || '',
        formattedAddress: `Pincode ${pincodeStr}`,
        isServiceable: serviceRes?.isServiceable || false,
        deliveryDetails: serviceRes?.isServiceable ? serviceRes : null,
        permissionGranted: false,
      }

      setLocation(manualLoc)
      localStorage.setItem('m2m_user_location', JSON.stringify(manualLoc))
      localStorage.setItem('m2m_manual_location', pincodeStr) // Mark manual override active
      setLoading(false)
      return true
    } catch (err) {
      console.error(err)
      setLoading(false)
      return false
    }
  }

  const handleNotNow = () => {
    localStorage.setItem('m2m_location_prompted', 'true')
    setShowModal(false)
  }

  const clearLocation = () => {
    setLocation(null)
    localStorage.removeItem('m2m_user_location')
    localStorage.removeItem('m2m_manual_location')
    setModalState('prompt')
  }

  return (
    <LocationContext.Provider
      value={{
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
      }}
    >
      {children}
    </LocationContext.Provider>
  )
}
