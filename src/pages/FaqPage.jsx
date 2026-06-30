import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const faqs = [
  { q: 'How fresh are your products?', a: 'All our grains and pulses are processed on-demand from trusted mills. Cold-pressed oils are extracted weekly. We ensure maximum freshness by maintaining a short supply chain directly from mills to your doorstep.' },
  { q: 'What is your delivery timeline?', a: 'Standard delivery takes 1-2 business days within Hyderabad. Express delivery (same-day) is available for orders placed before 2 PM. We also deliver to select cities across Telangana and AP within 3-5 days.' },
  { q: 'Do you offer free delivery?', a: 'Yes! Delivery is free on all orders above ₹499. For orders below ₹499, a flat delivery fee of ₹49 applies.' },
  { q: 'Can I return or exchange products?', a: 'Absolutely. If you receive a damaged or wrong product, contact us within 48 hours of delivery. We will arrange a replacement or full refund. Opened food products cannot be returned for hygiene reasons.' },
  { q: 'How do subscriptions work?', a: 'Choose a subscription plan (Rice, Dal, Oil, or Snack box). Your selected items will be delivered monthly on your preferred date. You can pause, modify, or cancel anytime from your account.' },
  { q: 'Are your products organic?', a: 'We offer both organic and conventional options. Products labeled "Organic" are certified by authorized bodies. All our products, organic or not, are free from artificial additives and preservatives.' },
  { q: 'What payment methods do you accept?', a: 'We accept UPI (GPay, PhonePe, Paytm), credit/debit cards, net banking, and cash on delivery (COD). All online payments are secured with SSL encryption.' },
  { q: 'Do you offer bulk orders?', a: 'Yes! We cater to restaurants, caterers, hostels, and offices. Bulk orders get special pricing. Contact us at bulk@milltomeal.com or visit our Bulk Orders page for more details.' },
]

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div className="pb-20 lg:pb-0">
      <div className="bg-gray-50 py-8">
        <div className="container-custom">
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-2">Frequently Asked Questions</h1>
          <p className="text-gray-500">Find answers to common questions</p>
        </div>
      </div>

      <div className="container-custom py-12 max-w-3xl">
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition"
              >
                <span className="font-medium text-gray-800 pr-4">{faq.q}</span>
                {openIndex === i ? <ChevronUp size={20} className="text-primary-600 shrink-0" /> : <ChevronDown size={20} className="text-gray-400 shrink-0" />}
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-50 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
