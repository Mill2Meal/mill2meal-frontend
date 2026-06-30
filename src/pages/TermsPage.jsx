export default function TermsPage() {
  return (
    <div className="pb-20 lg:pb-0">
      <div className="bg-gray-50 py-8">
        <div className="container-custom">
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900">Terms & Conditions</h1>
          <p className="text-gray-500 text-sm mt-1">Last updated: June 2024</p>
        </div>
      </div>
      <div className="container-custom py-12 max-w-4xl">
        <div className="space-y-6 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-heading font-bold text-gray-900">Acceptance of Terms</h2>
            <p>By accessing and using the MillToMeal website, you agree to be bound by these Terms and Conditions. If you disagree with any part, please do not use our service.</p>
          </section>
          <section>
            <h2 className="text-xl font-heading font-bold text-gray-900">Orders & Pricing</h2>
            <p>All prices are listed in Indian Rupees (INR) and include applicable taxes unless stated otherwise. We reserve the right to modify prices without prior notice. Orders once confirmed cannot be modified.</p>
          </section>
          <section>
            <h2 className="text-xl font-heading font-bold text-gray-900">Account Responsibility</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. Notify us immediately of any unauthorized access.</p>
          </section>
          <section>
            <h2 className="text-xl font-heading font-bold text-gray-900">Intellectual Property</h2>
            <p>All content on this website including logos, images, text, and design elements are property of MillToMeal and protected by intellectual property laws.</p>
          </section>
          <section>
            <h2 className="text-xl font-heading font-bold text-gray-900">Limitation of Liability</h2>
            <p>MillToMeal shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services beyond the order value.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
