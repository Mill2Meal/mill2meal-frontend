import { Link } from 'react-router-dom'
import { getAbsoluteImageUrl } from '../../lib/api'

export default function CategoryCard({ category }) {
  const productCount = category._count?.products

  return (
    <Link
      to={`/category/${category.slug}`}
      className="group relative overflow-hidden rounded-2xl aspect-square shadow-md hover:shadow-xl transition-all duration-300"
    >
      <img
        src={getAbsoluteImageUrl(category.bannerImageUrl)}
        alt={category.categoryName}
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
        <h3 className="text-white font-semibold text-sm md:text-base">{category.categoryName}</h3>
        <p className="text-white/70 text-xs mt-0.5">
          {productCount !== undefined
            ? `${productCount} ${productCount === 1 ? 'Product' : 'Products'}`
            : 'Explore Products'}
        </p>
      </div>
    </Link>
  )
}
