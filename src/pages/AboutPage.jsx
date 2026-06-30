import { Wheat, Heart, Users, Award } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="pb-20 lg:pb-0">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-50 to-cream py-16 md:py-20">
        <div className="container-custom text-center">
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-gray-900 mb-4">Our Story</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            MillToMeal was born from a simple idea — every Indian family deserves access to fresh, unadulterated staples directly from the source.
          </p>
        </div>
      </div>

      <div className="container-custom py-12 md:py-16">
        {/* Mission */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-4">From the Mill, Straight to Your Meal</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We partner directly with over 50 trusted mills and farms across India to bring you the freshest grains, pulses, oils, and spices. By eliminating middlemen, we ensure you get premium quality at fair prices.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Every product is quality-tested, FSSAI certified, and packaged with care. Our cold-pressed oils are extracted using traditional wooden ghani methods, and our grains are processed on-demand to preserve nutrition and freshness.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <img src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&h=400&fit=crop" alt="Mill" className="w-full h-80 object-cover" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { icon: Users, value: '50,000+', label: 'Happy Families' },
            { icon: Wheat, value: '200+', label: 'Products' },
            { icon: Award, value: '50+', label: 'Mill Partners' },
            { icon: Heart, value: '4.8/5', label: 'Customer Rating' },
          ].map(stat => (
            <div key={stat.label} className="text-center p-6 bg-primary-50 rounded-2xl">
              <stat.icon size={28} className="mx-auto text-primary-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="text-center">
          <h2 className="section-title mb-8">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6">
              <h3 className="font-heading font-bold text-xl mb-2 text-gray-900">Purity First</h3>
              <p className="text-gray-600">No adulterants, no artificial colors, no preservatives. Just pure, natural goodness as nature intended.</p>
            </div>
            <div className="p-6">
              <h3 className="font-heading font-bold text-xl mb-2 text-gray-900">Fair Pricing</h3>
              <p className="text-gray-600">Direct sourcing means better prices for you and fair compensation for our farmer and mill partners.</p>
            </div>
            <div className="p-6">
              <h3 className="font-heading font-bold text-xl mb-2 text-gray-900">Sustainability</h3>
              <p className="text-gray-600">Eco-friendly packaging, supporting local mills, and promoting traditional processing methods.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
