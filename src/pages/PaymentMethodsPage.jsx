import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CreditCard, Check, ShieldCheck } from 'lucide-react'

export default function PaymentMethodsPage() {
  const navigate = useNavigate()

  const paymentMethods = [
    { name: 'UPI', description: 'Google Pay, PhonePe, Paytm & more' },
    { name: 'Debit Card', description: 'Visa, Mastercard, RuPay & Maestro' },
    { name: 'Credit Card', description: 'Visa, Mastercard, Amex & Diners' },
    { name: 'Net Banking', description: 'All major Indian banks supported' },
    { name: 'Wallets', description: 'Amazon Pay, Mobikwik & others' },
    { name: 'Cash On Delivery', description: 'Pay with cash at your doorstep' },
    { name: 'UPI On Delivery', description: 'Scan QR code when your order arrives' },
  ]

  return (
    <div className="pb-20 lg:pb-0 bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-100 py-6">
        <div className="container-custom flex items-center gap-3">
          <button 
            onClick={() => navigate('/account')} 
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-heading font-bold text-gray-900">Payment Methods</h1>
            <p className="text-xs text-gray-500 mt-0.5">Your payment options explained</p>
          </div>
        </div>
      </div>

      <div className="container-custom py-8 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          
          {/* Security Alert Header */}
          <div className="bg-primary-50 rounded-xl p-4 flex gap-3 items-start border border-primary-100 mb-6">
            <ShieldCheck className="text-primary-600 shrink-0" size={24} />
            <div>
              <h4 className="font-semibold text-primary-950 text-sm">Secure Checkout Process</h4>
              <p className="text-xs text-primary-700 leading-relaxed mt-0.5">
                To guarantee the highest level of security, MillToMeal redirects you directly to our PCI-compliant payment gateway partners during checkout.
              </p>
            </div>
          </div>

          <p className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wider text-xs">
            Supported Payment Methods:
          </p>

          <div className="divide-y divide-gray-100 mb-6">
            {paymentMethods.map((method) => (
              <div key={method.name} className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-850 text-sm">{method.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{method.description}</p>
                </div>
                <div className="w-5 h-5 bg-green-50 border border-green-200 text-green-600 rounded-full flex items-center justify-center shrink-0">
                  <Check size={12} strokeWidth={3} />
                </div>
              </div>
            ))}
          </div>

          {/* Statement Box */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-150 text-center">
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              Payment methods are selected during checkout.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              No payment credentials or card details are stored by MillToMeal.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
