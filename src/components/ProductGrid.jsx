import { useNavigate } from 'react-router-dom'

function ProductGrid({ products }) {
  const navigate = useNavigate()

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">สินค้าแนะนำ</h2>
        <button className="text-sm font-medium text-sky-500 hover:underline">
          ดูทั้งหมด
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => navigate(`/product/${product.id}`)}
            className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative">
              <img
                src={product.image || product.image_url || 'https://placehold.co/600x600?text=No+Image'}
                alt={product.name}
                className="h-52 w-full object-cover"
              />
              {product.discount && (
                <span className="absolute left-2 top-2 rounded bg-red-500 px-2 py-1 text-xs font-bold text-white">
                  -{product.discount}
                </span>
              )}
            </div>

            <div className="p-4">
              <h3 className="min-h-[48px] text-sm font-medium text-gray-800">
                {product.name}
              </h3>

              <div className="mt-3 flex items-center gap-2">
                <span className="text-lg font-bold text-sky-500">
                  ฿{product.price}
                </span>

                {product.oldPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    ฿{product.oldPrice}
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {product.stock !== undefined ? `คงเหลือ ${product.stock}` : 'พร้อมขาย'}
                </span>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-lg bg-sky-400 px-3 py-1.5 text-sm text-white opacity-0 transition group-hover:opacity-100"
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