import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Grid3X3, ShoppingCart, User, Heart, Bell } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { api } from '../../lib/api'

export default function MobileBottomNav() {
  const location = useLocation()
  const { cartCount } = useCart()

  const isLoggedIn = !!localStorage.getItem('accessToken')
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!isLoggedIn) return
    async function fetchUnread() {
      try {
        const countData = await api.notifications.unreadCount()
        setUnreadCount(countData.count || 0)
      } catch (err) {
        console.error(err)
      }
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [isLoggedIn])

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Grid3X3, label: 'Categories', path: '/category/rice-millets' },
    { icon: ShoppingCart, label: 'Cart', path: '/cart', badge: cartCount },
    isLoggedIn 
      ? { icon: Bell, label: 'Notifications', path: '/account/notifications', badge: unreadCount }
      : { icon: Heart, label: 'Subscriptions', path: '/subscriptions' },
    isLoggedIn 
      ? { icon: User, label: 'Account', path: '/account' }
      : { icon: User, label: 'Login', path: '/login' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-40 pb-safe">
      <div className="flex items-center justify-around py-2">
        {navItems.map(item => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 relative ${isActive ? 'text-primary-600' : 'text-gray-500'}`}
            >
              <item.icon size={22} />
              {item.badge > 0 && (
                <span className="absolute -top-1 right-0 w-4 h-4 bg-secondary-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {item.badge}
                </span>
              )}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
