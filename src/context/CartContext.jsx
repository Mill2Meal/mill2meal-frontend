import { createContext, useContext, useState, useEffect } from 'react'
import { api, getAbsoluteImageUrl, resolveProductImage } from '../lib/api'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartTotal, setCartTotal] = useState(0)
  const [cartCount, setCartCount] = useState(0)
  const [loading, setLoading] = useState(false)

  // Billing & Coupon States
  const [subtotal, setSubtotal] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [tax, setTax] = useState(0)
  const [grandTotal, setGrandTotal] = useState(0)
  const [appliedCoupon, setAppliedCoupon] = useState(null)

  const isLoggedIn = () => !!localStorage.getItem('accessToken')

  const fetchCart = async () => {
    if (!isLoggedIn()) {
      const guestCart = localStorage.getItem('guestCart')
      const items = guestCart ? JSON.parse(guestCart) : []
      setCartItems(items)
      calculateTotals(items)
      return
    }

    setLoading(true)
    try {
      const response = await api.cart.get()
      if (response && response.items) {
        const resolvedItems = await Promise.all(
          response.items.map(async (item) => {
            try {
              const p = await api.products.get(item.productId)
              return {
                id: item.productId,
                cartItemId: item.cartItemId,
                name: item.productNameSnapshot,
                variant: item.skuSnapshot || p.packSize || 'Standard',
                price: parseFloat(item.unitPrice),
                quantity: item.quantity,
                image: resolveProductImage(p),
                slug: p.slug
              }
            } catch (err) {
              return {
                id: item.productId,
                cartItemId: item.cartItemId,
                name: item.productNameSnapshot,
                variant: item.skuSnapshot || 'Standard',
                price: parseFloat(item.unitPrice),
                quantity: item.quantity,
                image: 'https://placehold.co/600x400?text=No+Image',
                slug: ''
              }
            }
          })
        )
        setCartItems(resolvedItems)
        setCartTotal(parseFloat(response.grandTotalAmount || response.subtotalAmount || 0))
        setCartCount(response.itemCount || resolvedItems.reduce((sum, item) => sum + item.quantity, 0))
        
        // Map backend billing fields
        setSubtotal(parseFloat(response.subtotalAmount || 0))
        setDiscount(parseFloat(response.discountAmount || 0))
        setDeliveryFee(parseFloat(response.deliveryFeeAmount || 0))
        setTax(parseFloat(response.taxAmount || 0))
        setGrandTotal(parseFloat(response.grandTotalAmount || 0))
        setAppliedCoupon(response.coupon || null)
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotals = (items) => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const count = items.reduce((sum, item) => sum + item.quantity, 0)
    setCartTotal(total)
    setCartCount(count)
    
    // Estimate for guest mode
    setSubtotal(total)
    setDiscount(0)
    const fee = total >= 500 || total === 0 ? 0 : 40
    setDeliveryFee(fee)
    setTax(0)
    setGrandTotal(total + fee)
    setAppliedCoupon(null)
  }

  const applyCoupon = async (code) => {
    if (!isLoggedIn()) {
      alert('Please login to apply coupons.')
      return
    }
    try {
      await api.cart.applyCoupon(code)
      await fetchCart()
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  const removeCoupon = async () => {
    if (!isLoggedIn()) return
    try {
      await api.cart.removeCoupon()
      await fetchCart()
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  const addToCart = async (product, quantity = 1, variant = null) => {
    const productId = product.productId || product.id
    if (!isLoggedIn()) {
      setCartItems(prev => {
        const existingIndex = prev.findIndex(
          item => item.id === productId && item.variant === variant
        )
        let updated
        if (existingIndex > -1) {
          updated = [...prev]
          updated[existingIndex].quantity += quantity
        } else {
          updated = [...prev, {
            id: productId,
            name: product.productName || product.name,
            variant: variant || product.packSize || 'Standard',
            price: parseFloat(product.salePrice || product.price),
            quantity,
            image: resolveProductImage(product),
            slug: product.slug
          }]
        }
        localStorage.setItem('guestCart', JSON.stringify(updated))
        calculateTotals(updated)
        return updated
      })
      return
    }

    try {
      await api.cart.addItem(productId, quantity)
      await fetchCart()
    } catch (error) {
      console.error('Failed to add to cart:', error)
      alert(error.message || 'Failed to add item to cart')
    }
  }

  const removeFromCart = async (productId, variant = null) => {
    if (!isLoggedIn()) {
      setCartItems(prev => {
        const updated = prev.filter(item => !(item.id === productId && item.variant === variant))
        localStorage.setItem('guestCart', JSON.stringify(updated))
        calculateTotals(updated)
        return updated
      })
      return
    }

    const item = cartItems.find(i => i.id === productId)
    if (item && item.cartItemId) {
      try {
        await api.cart.removeItem(item.cartItemId)
        await fetchCart()
      } catch (error) {
        console.error('Failed to remove from cart:', error)
      }
    }
  }

  const updateQuantity = async (productId, quantity, variant = null) => {
    if (quantity <= 0) {
      await removeFromCart(productId, variant)
      return
    }

    if (!isLoggedIn()) {
      setCartItems(prev => {
        const updated = prev.map(item =>
          item.id === productId && item.variant === variant
            ? { ...item, quantity }
            : item
        )
        localStorage.setItem('guestCart', JSON.stringify(updated))
        calculateTotals(updated)
        return updated
      })
      return
    }

    const item = cartItems.find(i => i.id === productId)
    if (item && item.cartItemId) {
      try {
        await api.cart.updateItem(item.cartItemId, quantity)
        await fetchCart()
      } catch (error) {
        console.error('Failed to update quantity:', error)
      }
    }
  }

  const clearCart = async () => {
    if (!isLoggedIn()) {
      localStorage.removeItem('guestCart')
      setCartItems([])
      setCartTotal(0)
      setCartCount(0)
      return
    }

    try {
      await api.cart.clear()
      await fetchCart()
    } catch (error) {
      console.error('Failed to clear cart:', error)
    }
  }

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart,
      cartTotal, cartCount, isCartOpen, setIsCartOpen, fetchCart, loading,
      subtotal, discount, deliveryFee, tax, grandTotal, appliedCoupon,
      applyCoupon, removeCoupon
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
