import { useNavigate } from 'react-router-dom'

function ProductGrid({ products, selectedCategory, onClearCategory }) {
  const navigate = useNavigate()

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">สินค้าทั้งหมด</h2>
          {selectedCategory && selectedCategory !== 'ทั้งหมด' && (
            <p className="mt-1 text-sm text-gray-500">
              หมวดหมู่: {selectedCategory}
            </p>
          )}
        </div>

        <button
          onClick={onClearCategory}
          className="text-sm font-medium text-sky-500 hover:underline"
        >
          ดูทั้งหมด
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => navigate(`/product/${product.id}`)}
            className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
          >
            <div className="relative overflow-hidden">
              <img
                src={
                  product.image ||
                  product.image_url ||
                  'https://placehold.co/600x600?text=No+Image'
                }
                alt={product.name}
                className="h-52 w-full object-cover transition duration-300 group-hover:scale-110"
              />

              {product.discount && (
                <span className="absolute left-2 top-2 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow">
                  -{product.discount}
                </span>
              )}
            </div>

            <div className="p-4">
              <h3 className="min-h-[48px] line-clamp-2 text-sm font-medium text-gray-800">
                {product.name}
              </h3>

              <div className="mt-2">
                <span className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                  {product.category || 'ไม่มีหมวดหมู่'}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span className="text-lg font-bold text-sky-500">
                  ฿{Number(product.price || 0).toLocaleString()}
                </span>

                {product.oldPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    ฿{product.oldPrice}
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {product.stock !== undefined
                    ? `คงเหลือ ${product.stock}`
                    : 'พร้อมขาย'}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/product/${product.id}`)
                  }}
                  className="translate-y-2 rounded-lg bg-sky-400 px-3 py-1.5 text-sm text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-sky-500"
                >
                  ดูสินค้า
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ProductGrid