import { useState, useEffect } from 'react'
import Header from './Header'
import Footer from './Footer'
import MobileBottomNav from './MobileBottomNav'
import QuickViewModal from './QuickViewModal'
import FloatingCartBar from './FloatingCartBar'
import LocationModal from './LocationModal'

export default function Layout({ children }) {
  const [headerHeight, setHeaderHeight] = useState(0)

  useEffect(() => {
    const headerElement = document.querySelector('header')
    if (!headerElement) return

    // Set initial height
    setHeaderHeight(headerElement.offsetHeight)

    // Observe size changes
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeaderHeight(entry.target.offsetHeight)
      }
    })

    resizeObserver.observe(headerElement)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#090d16] text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <Header />
      <main className="flex-1" style={{ paddingTop: `${headerHeight}px` }}>
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
      <FloatingCartBar />
      <QuickViewModal />
      <LocationModal />
    </div>
  )
}
