import Header from './Header'
import Footer from './Footer'
import MobileBottomNav from './MobileBottomNav'
import QuickViewModal from './QuickViewModal'
import FloatingCartBar from './FloatingCartBar'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#090d16] text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileBottomNav />
      <FloatingCartBar />
      <QuickViewModal />
    </div>
  )
}
