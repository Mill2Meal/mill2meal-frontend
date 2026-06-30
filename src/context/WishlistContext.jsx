import { createContext, useContext, useState, useEffect } from 'react'
import { useCart } from './CartContext'

const WishlistContext = createContext()

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([])
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const { addToCart } = useCart()

  const isLoggedIn = !!localStorage.getItem('accessToken')

  // Load wishlist items
  useEffect(() => {
    const key = isLoggedIn ? `wishlist_user` : 'wishlist_guest'
    const stored = localStorage.getItem(key)
    if (stored) {
      try {
        setWishlistItems(JSON.parse(stored))
      } catch (err) {
        console.error(err)
      }
    } else {
      setWishlistItems([])
    }
  }, [isLoggedIn])

  // Save wishlist items when changed
  const saveItems = (items) => {
    const key = isLoggedIn ? `wishlist_user` : 'wishlist_guest'
    localStorage.setItem(key, JSON.stringify(items))
    setWishlistItems(items)
  }

  const addToWishlist = (product) => {
    const productId = product.productId || product.id
    if (wishlistItems.some(item => (item.productId || item.id) === productId)) {
      return // Already in wishlist
    }
    const updated = [...wishlistItems, product]
    saveItems(updated)
  }

  const removeFromWishlist = (productId) => {
    const updated = wishlistItems.filter(item => (item.productId || item.id) !== productId)
    saveItems(updated)
  }

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => (item.productId || item.id) === productId)
  }

  const clearWishlist = () => {
    saveItems([])
  }

  const moveAllToCart = async () => {
    for (const item of wishlistItems) {
      await addToCart(item, 1)
    }
    saveItems([])
  }

  const openQuickView = (product) => {
    setQuickViewProduct(product)
  }

  const closeQuickView = () => {
    setQuickViewProduct(null)
  }

  return (
    <WishlistContext.Provider value={{
      wishlistItems, addToWishlist, removeFromWishlist, isInWishlist, clearWishlist, moveAllToCart,
      quickViewProduct, openQuickView, closeQuickView
    }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)
