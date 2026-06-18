export default function ShippingPolicyPage() {
  return (
    <div className="pb-20 lg:pb-0">
      <div className="bg-gray-50 py-8">
        <div className="container-custom">
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900">Shipping Policy</h1>
          <p className="text-gray-500 text-sm mt-1">Last updated: June 2024</p>
        </div>
      </div>
      <div className="container-custom py-12 max-w-4xl">
        <div className="space-y-6 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-heading font-bold text-gray-900">Delivery Areas</h2>
            <p>We currently deliver across Hyderabad, Secunderabad, and surrounding areas. Select cities in Telangana and Andhra Pradesh are also serviceable. Check availability by entering your pincode.</p>
          </section>
          <section>
            <h2 className="text-xl font-heading font-bold text-gray-900">Delivery Timelines</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Hyderabad city: 1-2 business days (standard), Same-day (express)</li>
              <li>Telangana & AP cities: 3-5 business days</li>
              <li>Subscription orders: Delivered on your chosen date each month</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-heading font-bold text-gray-900">Shipping Charges</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Free delivery on orders above ₹499</li>
              <li>Flat ₹49 for orders below ₹499</li>
              <li>Express delivery: ₹99 (Hyderabad only)</li>
              <li>Subscription orders: Always free delivery</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-heading font-bold text-gray-900">Order Tracking</h2>
            <p>Once your order is shipped, you'll receive a tracking link via SMS and WhatsApp. You can also track your order from the "My Orders" section in your account.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
