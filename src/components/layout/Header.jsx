import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, ShoppingCart, User, Menu, X, MapPin, Phone, Bell, Sun, Moon, Monitor, Heart } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useTheme } from '../../context/ThemeContext'
import { useLocationContext } from '../../context/LocationContext'
import { api } from '../../lib/api'

export default function Header() {
  const location = useLocation()
  const { location: userLocation, setShowModal, setModalState } = useLocationContext()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showThemeMenu, setShowThemeMenu] = useState(false)
  const { theme, selectTheme } = useTheme()
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0)
  const [branding, setBranding] = useState({
    brandName: 'MILLTOMEAL',
    tagline: 'Fresh from Mill to Table',
    logoLight: `${import.meta.env.BASE_URL}logo.jpg`,
    primaryColor: '#CE2028',
    secondaryColor: '#F97316',
  })

  useEffect(() => {
    api.branding.get()
      .then(res => {
        if (res) {
          setBranding({
            brandName: res.brandName || 'MILLTOMEAL',
            tagline: res.tagline || 'Fresh from Mill to Table',
            logoLight: res.logoLight || `${import.meta.env.BASE_URL}logo.jpg`,
            primaryColor: res.primaryColor || '#CE2028',
            secondaryColor: res.secondaryColor || '#F97316',
          })
        }
      })
      .catch(err => console.error(err))
  }, [])
  
  const [categories, setCategories] = useState([
    { name: 'Rice & Millets', slug: 'rice-millets' },
    { name: 'Dals & Pulses', slug: 'dals-pulses' },
    { name: 'Cooking Oils', slug: 'cooking-oils' },
    { name: 'Spices & Masalas', slug: 'spices-masalas' },
    { name: 'Flours & Atta', slug: 'flours-atta' },
    { name: 'Dry Fruits & Nuts', slug: 'dry-fruits-nuts' },
    { name: 'Healthy Snacks', slug: 'healthy-snacks' },
    { name: 'Ghee & Honey', slug: 'ghee-honey' },
  ])

  const { cartCount } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) return

    async function loadUnreadCount() {
      try {
        const countData = await api.notifications.unreadCount()
        setUnreadNotificationsCount(countData.count || 0)
      } catch (err) {
        console.error('Failed to load unread count:', err)
      }
    }

    loadUnreadCount()

    // Refresh every 30s
    const interval = setInterval(loadUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    async function fetchHeaderCategories() {
      try {
        const response = await api.categories.list('limit=10&isActive=true')
        if (response && response.items && response.items.length > 0) {
          setCategories(response.items.map(item => ({
            name: item.categoryName,
            slug: item.slug
          })))
        }
      } catch (err) {
        console.error('Failed to load header categories:', err)
      }
    }
    fetchHeaderCategories()
  }, [])

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const delayDebounceFn = setTimeout(async () => {
        try {
          const response = await api.search.suggestions(searchQuery)
          if (response && response.suggestions) {
            setSuggestions(response.suggestions)
            setShowSuggestions(true)
          } else {
            setSuggestions([])
          }
        } catch (err) {
          console.error('Failed to load suggestions:', err)
        }
      }, 300)
      return () => clearTimeout(delayDebounceFn)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [searchQuery])

  useEffect(() => {
    const handleOutsideClick = () => {
      setShowSuggestions(false)
    }
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setIsSearchOpen(false)
      setShowSuggestions(false)
      setSearchQuery('')
    }
  }

  const handleSuggestionClick = (sug) => {
    setSearchQuery('')
    setShowSuggestions(false)
    setIsSearchOpen(false)
    if (sug.type === 'product' && sug.productId) {
      navigate(`/product/${sug.productId}`)
    } else if (sug.type === 'category' && sug.slug) {
      navigate(`/category/${sug.slug}`)
    } else {
      navigate(`/search?q=${encodeURIComponent(sug.label)}`)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      {/* Top Bar */}
      <div className="bg-[#8F1D1D] text-white text-sm py-2">
        <div className="container-custom flex justify-between items-center gap-1.5 md:gap-4">
          <div className="flex flex-row items-center justify-between w-full md:w-auto md:justify-start gap-4 text-[11px] md:text-sm whitespace-nowrap">
            <span className="flex items-center gap-1">📍 Free Delivery ₹499+</span>
            <span className="flex items-center gap-1">📞 +91 90595 03227</span>
          </div>
          <div className="flex items-center gap-4 hidden md:flex">
            <Link to="/stores" className="hover:text-primary-200 transition">Store Locator</Link>
            <Link to="/bulk-orders" className="hover:text-primary-200 transition">Bulk Orders</Link>
            <Link to="/franchise" className="hover:text-primary-200 transition">Franchise</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container-custom py-4">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          {/* Mobile Menu Button */}
          <button onClick={() => setIsMenuOpen(true)} className="lg:hidden p-2">
            <Menu size={24} />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 md:gap-4 select-none">
          <div className="w-9 h-9 md:w-16 md:h-16 bg-[#CE2028] rounded-xl flex items-center justify-center p-1 overflow-hidden shrink-0">
            <img
            src={branding.logoLight}
            alt={`${branding.brandName} Logo`}
            className="max-h-full max-w-full object-contain scale-[1.35]"
            style={{ imageRendering: "auto" }}
            />
            </div>
             <div className="flex flex-col justify-center w-auto select-none pl-0">
               <h1
               className="text-[16px] md:text-[17px] font-bold uppercase leading-none font-logo tracking-[0.02em]"
               >
                 <span className="text-[#CE2028]">MILL</span>
                 <span className="text-black dark:text-white">To</span>
                 <span className="text-[#CE2028]">MEAL</span>
               </h1>
                 <p
                 className="mt-[4px] text-[8px] md:text-[10.2px] font-semibold leading-none text-[#CE2028] tracking-[0.01em]"
                 >
                   {branding.tagline}
                   </p>
             </div>
                  </Link>

            {/* Desktop Deliver to Location Selector */}
            <div className="hidden lg:flex items-center">
              <button
                onClick={() => {
                  setModalState('prompt')
                  setShowModal(true)
                }}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700/80 border border-gray-255 dark:border-gray-700 rounded-2xl transition text-left cursor-pointer shrink-0 border-none shadow-sm hover:shadow"
              >
                <MapPin size={18} className="text-[#CE2028]" />
                <div className="flex flex-col text-[10px] md:text-[11px] leading-tight">
                  <span className="text-gray-400 dark:text-gray-400 font-medium">Deliver to</span>
                  <span className="font-bold text-gray-800 dark:text-white truncate max-w-[120px] sm:max-w-[150px] mt-0.5">
                    {userLocation ? (
                      userLocation.area 
                        ? `${userLocation.area}, ${userLocation.city}` 
                        : userLocation.city || userLocation.pincode
                    ) : 'Select Area'}
                  </span>
                </div>
                <span className="text-gray-400 dark:text-gray-450 text-[8px] ml-1">▼</span>
              </button>
            </div>

          {/* Desktop Search with Autocomplete */}
          <form onSubmit={handleSearch} onClick={(e) => e.stopPropagation()} className="hidden lg:flex flex-1 max-w-xl mx-8 relative">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(searchQuery.trim().length > 1 && suggestions.length > 0)}
                placeholder="Search for rice, dal, oils, spices..."
                className="w-full px-5 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-primary-500 focus:bg-white transition"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
            {/* desktop suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto">
                {suggestions.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSuggestionClick(sug)}
                    className="w-full text-left px-5 py-3 hover:bg-gray-50 flex items-center justify-between border-b border-gray-50 last:border-b-0 transition-colors"
                  >
                    <span className="font-medium text-gray-800">{sug.label}</span>
                    <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {sug.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1.5 md:gap-3">
            {/* Theme Toggle Switcher */}
            <div className="relative">
              <button 
                type="button"
                onClick={() => setShowThemeMenu(!showThemeMenu)} 
                className="p-1.5 md:p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition"
                title="Change Theme"
              >
                {theme === 'dark' ? <Moon size={22} /> : <Sun size={22} />}
              </button>
              {showThemeMenu && (
                <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg py-1 z-50 min-w-[120px]">
                  <button 
                    type="button"
                    onClick={() => { selectTheme('light'); setShowThemeMenu(false); }} 
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-2"
                  >
                    <Sun size={16} /> Light
                  </button>
                  <button 
                    type="button"
                    onClick={() => { selectTheme('dark'); setShowThemeMenu(false); }} 
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-2"
                  >
                    <Moon size={16} /> Dark
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => setIsSearchOpen(true)} className="lg:hidden p-1.5 text-gray-700">
              <Search size={22} />
            </button>
            <Link to={localStorage.getItem('accessToken') ? "/account" : "/login"} className="hidden sm:flex items-center gap-2 p-2 text-gray-700 hover:text-primary-600 transition">
              <User size={22} />
              <span className="hidden md:inline text-sm font-medium">{localStorage.getItem('accessToken') ? 'Account' : 'Login'}</span>
            </Link>
            {localStorage.getItem('accessToken') && (
              <Link to="/account/notifications" className="relative flex items-center gap-2 p-2 text-gray-700 hover:text-primary-600 transition">
                <Bell size={22} />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {unreadNotificationsCount}
                  </span>
                )}
              </Link>
            )}
            <Link to="/wishlist" className="hidden lg:flex items-center gap-2 p-2 text-gray-700 hover:text-[#CE2028] transition" title="Wishlist">
              <Heart size={22} />
              <span className="hidden md:inline text-sm font-medium">Wishlist</span>
            </Link>
            <Link to="/cart" className="relative flex items-center gap-2 p-1.5 md:p-2 text-gray-700 hover:text-primary-600 transition">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#CE2028] text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
              <span className="hidden md:inline text-sm font-medium">Cart</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Location Bar */}
      <div className="lg:hidden bg-gray-50 dark:bg-[#111827] border-t border-b border-gray-100 dark:border-gray-800 py-2.5 px-4 flex items-center justify-between">
        <button
          onClick={() => {
            setModalState('prompt')
            setShowModal(true)
          }}
          className="flex items-center gap-2 text-left w-full justify-between bg-transparent border-none p-0 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-[#CE2028]" />
            <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-700 dark:text-gray-250">
              <span className="text-gray-400 dark:text-gray-500 font-medium">Deliver to -</span>
              <span className="truncate max-w-[200px]">
                {userLocation ? (
                  userLocation.area 
                    ? `${userLocation.area}, ${userLocation.city}` 
                    : userLocation.city || userLocation.pincode
                ) : 'Select Area'}
              </span>
            </div>
          </div>
          <span className="text-gray-450 dark:text-gray-500 text-[8px]">▼</span>
        </button>
      </div>

      {/* Desktop/Mobile Navigation */}
      <nav className="category-nav border-t border-gray-100 bg-white">
        <div className="container-custom">
          <ul className="flex items-center gap-2">
            {categories.map(cat => {
              const isActive = location.pathname === `/category/${cat.slug}`
              return (
                <li key={cat.slug} className="py-2 shrink-0">
                  <Link
                    to={`/category/${cat.slug}`}
                    className={`block px-3 md:px-4 py-2 text-xs font-semibold rounded-full border transition-all duration-300 transform whitespace-nowrap shadow-sm hover:shadow hover:-translate-y-0.5 ${
                      isActive 
                        ? 'bg-gradient-to-br from-[#CE2028] to-[#E63B44] text-white border-[#CE2028] shadow-md dark:from-[#CE2028] dark:to-[#B51622]' 
                        : 'bg-gradient-to-br from-red-50/50 to-rose-100/40 border-red-100/50 text-red-900 hover:from-red-100 hover:to-rose-200/80 hover:border-[#CE2028]/35 dark:from-[#1E0B0C]/40 dark:to-[#160E12]/30 dark:border-red-950/50 dark:text-gray-300 dark:hover:from-[#2B0A0C] dark:hover:to-[#1E0A0C] dark:hover:border-[#CE2028]/45'
                    }`}
                  >
                    {cat.name}
                  </Link>
                </li>
              )
            })}
            <li className="py-2 shrink-0">
              <Link 
                to="/monthly-essentials" 
                className={`block px-3 md:px-4 py-2 text-xs font-bold rounded-full border transition-all duration-300 transform whitespace-nowrap shadow-sm hover:shadow hover:-translate-y-0.5 ${
                  location.pathname === '/monthly-essentials'
                    ? 'bg-gradient-to-br from-[#CE2028] to-[#E63B44] text-white border-[#CE2028] shadow-md dark:from-[#CE2028] dark:to-[#B51622]'
                    : 'bg-gradient-to-br from-red-50/50 to-rose-100/40 border-red-100/50 text-[#CE2028] hover:from-red-100 hover:to-rose-200/80 hover:border-[#CE2028]/35 dark:from-[#1E0B0C]/40 dark:to-[#160E12]/30 dark:border-red-950/50 dark:text-[#CE2028] dark:hover:from-[#2B0A0C] dark:hover:to-[#1E0A0C]'
                }`}
              >
                Monthly Essentials
              </Link>
            </li>
            <li className="py-2 shrink-0">
              <Link 
                to="/subscriptions" 
                className={`block px-3 md:px-4 py-2 text-xs font-bold rounded-full border transition-all duration-300 transform whitespace-nowrap shadow-sm hover:shadow hover:-translate-y-0.5 ${
                  location.pathname === '/subscriptions'
                    ? 'bg-gradient-to-br from-[#CE2028] to-[#E63B44] text-white border-[#CE2028] shadow-md dark:from-[#CE2028] dark:to-[#B51622]'
                    : 'bg-gradient-to-br from-red-50/50 to-rose-100/40 border-red-100/50 text-[#CE2028] hover:from-red-100 hover:to-rose-200/80 hover:border-[#CE2028]/35 dark:from-[#1E0B0C]/40 dark:to-[#160E12]/30 dark:border-red-950/50 dark:text-[#CE2028] dark:hover:from-[#2B0A0C] dark:hover:to-[#1E0A0C]'
                }`}
              >
                Subscriptions
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-white p-4 lg:hidden flex flex-col">
          <div className="flex items-center gap-3 mb-4 shrink-0">
            <button onClick={() => setIsSearchOpen(false)} className="p-2"><X size={24} /></button>
            <form onSubmit={handleSearch} className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-primary-500"
                autoFocus
              />
            </form>
          </div>
          
          {/* suggestions list for mobile */}
          {searchQuery.trim().length > 1 && suggestions.length > 0 ? (
            <div className="flex-1 overflow-y-auto">
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSuggestionClick(sug)}
                  className="w-full text-left py-3 px-4 hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-b-0"
                >
                  <span className="font-medium text-gray-800">{sug.label}</span>
                  <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full uppercase">
                    {sug.type}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-2">
              <p className="text-sm text-gray-500 mb-3">Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {['Basmati Rice', 'Toor Dal', 'Groundnut Oil', 'Almonds', 'Ghee'].map(term => (
                  <button
                    key={term}
                    onClick={() => { setSearchQuery(term); navigate(`/search?q=${term}`); setIsSearchOpen(false) }}
                    className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2 select-none" onClick={() => setIsMenuOpen(false)}>
                <div className="w-9 h-9 bg-[#CE2028] rounded-xl flex items-center justify-center p-1 overflow-hidden shrink-0">
                  <img
                    src={branding.logoLight}
                    alt={`${branding.brandName} Logo`}
                    className="max-h-full max-w-full object-contain scale-[1.35]"
                    style={{ imageRendering: "auto" }}
                  />
                </div>
                <div className="flex flex-col justify-center w-auto select-none pl-0 text-left">
                  <h1 className="text-[16px] font-bold uppercase leading-none font-logo tracking-[0.02em]">
                    <span className="text-[#CE2028]">MILL</span>
                    <span className="text-black dark:text-white">To</span>
                    <span className="text-[#CE2028]">MEAL</span>
                  </h1>
                  <p className="mt-[4px] text-[8px] font-semibold leading-none text-[#CE2028] tracking-[0.01em]">
                    {branding.tagline}
                  </p>
                </div>
              </Link>
              <button onClick={() => setIsMenuOpen(false)} className="p-2"><X size={24} /></button>
            </div>
            <nav className="p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Categories</p>
              {categories.map(cat => (
                <Link
                  key={cat.slug}
                  to={`/category/${cat.slug}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-3 px-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                >
                  {cat.name}
                </Link>
              ))}
              <hr className="my-4" />
              <Link to="/monthly-essentials" onClick={() => setIsMenuOpen(false)} className="block py-3 px-3 text-[#CE2028] font-semibold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg">Monthly Essentials</Link>
              <Link to="/subscriptions" onClick={() => setIsMenuOpen(false)} className="block py-3 px-3 text-[#CE2028] font-semibold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg">Subscriptions</Link>
              <hr className="my-4" />
              {localStorage.getItem('accessToken') ? (
                <>
                  <Link to="/account" onClick={() => setIsMenuOpen(false)} className="block py-3 px-3 text-gray-700">My Account</Link>
                  <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="block py-3 px-3 text-gray-700">My Orders</Link>
                  <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="block py-3 px-3 text-gray-700">My Wishlist</Link>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block py-3 px-3 text-primary-600 font-semibold">Login</Link>
                  <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="block py-3 px-3 text-gray-700">My Wishlist</Link>
                </>
              )}
              <Link to="/stores" onClick={() => setIsMenuOpen(false)} className="block py-3 px-3 text-gray-700">Store Locator</Link>
              <Link to="/about" onClick={() => setIsMenuOpen(false)} className="block py-3 px-3 text-gray-700">About Us</Link>
              <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="block py-3 px-3 text-gray-700">Contact</Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
