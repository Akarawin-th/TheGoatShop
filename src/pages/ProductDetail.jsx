import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import { supabase } from '../lib/supabase'

function ProductDetail() {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const loadProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        Swal.fire({
          title: 'ไม่พบสินค้า',
          text: error.message,
          icon: 'error',
          confirmButtonColor: '#ef4444',
        })
        navigate('/home')
        return
      }

      setProduct(data)
      setLoading(false)
    }

    loadProduct()
  }, [id, navigate])

  const handleAddToCart = async () => {
    Swal.fire({
      title: 'ยังไม่เปิดใช้งาน',
      text: 'ระบบตะกร้าสินค้าจะทำเป็นขั้นตอนถัดไป',
      icon: 'info',
      confirmButtonColor: '#38bdf8',
    })
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-10">
      <div className="mx-auto max-w-6xl rounded-2xl bg-white p-8 shadow">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl bg-gray-100">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-[420px] items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm text-sky-500">{product.category}</p>
            <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>

            <div className="mt-4">
              <span className="text-3xl font-bold text-sky-500">
                ฿{product.price}
              </span>
            </div>

            <div className="mt-4 rounded-xl bg-sky-50 p-4 text-sm text-gray-700">
              <p>
                <span className="font-semibold">จำนวนคงเหลือ:</span> {product.stock}
              </p>
              <p className="mt-2">
                <span className="font-semibold">สถานะ:</span>{' '}
                {product.is_active ? 'พร้อมขาย' : 'ปิดการขาย'}
              </p>
            </div>

            <div className="mt-6">
              <h2 className="mb-2 text-lg font-bold text-gray-800">รายละเอียดสินค้า</h2>
              <p className="leading-7 text-gray-600">{product.description}</p>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => navigate('/home')}
                className="rounded-lg bg-sky-100 px-5 py-3 text-sky-700 hover:bg-sky-200"
              >
                กลับหน้า Home
              </button>

              <button
                onClick={handleAddToCart}
                className="rounded-lg bg-sky-400 px-5 py-3 font-semibold text-white hover:bg-sky-500"
              >
                เพิ่มลงตะกร้า
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail