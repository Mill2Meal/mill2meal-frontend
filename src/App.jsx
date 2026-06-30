import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { ThemeProvider } from './context/ThemeContext'
import { WishlistProvider } from './context/WishlistContext'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import CategoriesPage from './pages/CategoriesPage'
import CategoryPage from './pages/CategoryPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import AccountPage from './pages/AccountPage'
import OrdersPage from './pages/OrdersPage'
import OrderTrackingPage from './pages/OrderTrackingPage'
import SubscriptionsPage from './pages/SubscriptionsPage'
import MonthlyEssentialsPage from './pages/MonthlyEssentialsPage'
import StoreLocatorPage from './pages/StoreLocatorPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import FaqPage from './pages/FaqPage'
import QualityPromisePage from './pages/QualityPromisePage'
import BulkOrdersPage from './pages/BulkOrdersPage'
import FranchisePage from './pages/FranchisePage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsPage from './pages/TermsPage'
import RefundPolicyPage from './pages/RefundPolicyPage'
import ShippingPolicyPage from './pages/ShippingPolicyPage'
import SearchResultsPage from './pages/SearchResultsPage'
import LoginPage from './pages/LoginPage'
import AddressesPage from './pages/AddressesPage'
import PaymentMethodsPage from './pages/PaymentMethodsPage'
import NotificationsPage from './pages/NotificationsPage'
import OffersPage from './pages/OffersPage'
import WishlistPage from './pages/WishlistPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <WishlistProvider>
          <Router basename="/mill2meal-frontend">
            <ScrollToTop />
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/account/addresses" element={<AddressesPage />} />
              <Route path="/account/payment-methods" element={<PaymentMethodsPage />} />
              <Route path="/account/notifications" element={<NotificationsPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:id" element={<OrderTrackingPage />} />
              <Route path="/subscriptions" element={<SubscriptionsPage />} />
              <Route path="/monthly-essentials" element={<MonthlyEssentialsPage />} />
              <Route path="/offers" element={<OffersPage />} />
              <Route path="/stores" element={<StoreLocatorPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/quality-promise" element={<QualityPromisePage />} />
              <Route path="/bulk-orders" element={<BulkOrdersPage />} />
              <Route path="/franchise" element={<FranchisePage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/refund-policy" element={<RefundPolicyPage />} />
              <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/login" element={<LoginPage />} />
            </Routes>
          </Layout>
        </Router>
      </WishlistProvider>
    </CartProvider>
  </ThemeProvider>
)
}

export default App
