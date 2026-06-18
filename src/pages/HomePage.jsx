import HeroBanner from '../components/home/HeroBanner'
import PincodeCheck from '../components/home/PincodeCheck'
import CategoriesSection from '../components/home/CategoriesSection'
import BestSellers from '../components/home/BestSellers'
import MonthlyEssentialsBanner from '../components/home/MonthlyEssentialsBanner'
import NewArrivals from '../components/home/NewArrivals'
import WhyChooseUs from '../components/home/WhyChooseUs'
import Testimonials from '../components/home/Testimonials'

export default function HomePage() {
  return (
    <div className="pb-16 lg:pb-0">
      <HeroBanner />
      <PincodeCheck />
      <CategoriesSection />
      <BestSellers />
      <MonthlyEssentialsBanner />
      <NewArrivals />
      <WhyChooseUs />
      <Testimonials />
    </div>
  )
}
