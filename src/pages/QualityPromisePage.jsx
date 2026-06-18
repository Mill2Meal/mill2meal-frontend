import { Shield, Leaf, Award, FlaskConical, Truck, Eye } from 'lucide-react'

export default function QualityPromisePage() {
  return (
    <div className="pb-20 lg:pb-0">
      <div className="bg-gradient-to-br from-primary-50 to-white py-16">
        <div className="container-custom text-center">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">Our Quality Promise</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Every product that reaches your kitchen goes through a rigorous quality journey.</p>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: Leaf, title: 'No Adulterants', desc: 'Every batch is tested for purity. Zero tolerance for mixing or adulteration of any kind.' },
            { icon: FlaskConical, title: 'Lab Tested', desc: 'Regular testing at NABL-accredited labs for pesticides, heavy metals, and microbial contamination.' },
            { icon: Shield, title: 'FSSAI Certified', desc: 'All our products comply with FSSAI standards and carry valid license numbers on every pack.' },
            { icon: Award, title: 'Grade-A Sourcing', desc: 'We only source from Grade-A mills and farms with proven track records of quality.' },
            { icon: Truck, title: 'Cold Chain Oils', desc: 'Our cold-pressed oils are stored and transported in temperature-controlled environments.' },
            { icon: Eye, title: 'Full Transparency', desc: 'Every product displays source mill details, batch number, and test certificates.' },
          ].map(item => (
            <div key={item.title} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <item.icon size={24} className="text-primary-600" />
              </div>
              <h3 className="font-heading font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
