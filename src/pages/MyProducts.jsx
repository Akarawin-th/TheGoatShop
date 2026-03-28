import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { supabase } from '../lib/supabase'

function MyProducts() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()

  useEffect(() => {
    const loadMyProducts = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        navigate('/login')
        return
      }

      setUser(user)

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: profileError.message,
          icon: 'error',
          confirmButtonColor: '#ef4444',
        })
        navigate('/home')
        return
      }

      if (profileData.role !== 'seller' && profileData.role !== 'admin') {
        Swal.fire({
          title: 'ไม่มีสิทธิ์เข้าใช้งาน',
          text: 'หน้านี้สำหรับ Seller หรือ Admin เท่านั้น',
          icon: 'warning',
          confirmButtonColor: '#38bdf8',
        })
        navigate('/home')
        return
      }

      setProfile(profileData)

      const query =
        profileData.role === 'admin'
          ? supabase.from('products').select('*').order('created_at', { ascending: false })
          : supabase
              .from('products')
              .select('*')
              .eq('seller_id', user.id)
              .order('created_at', { ascending: false })

      const { data: productData, error: productError } = await query

      if (productError) {
        Swal.fire({
          title: 'โหลดสินค้าไม่สำเร็จ',
          text: productError.message,
          icon: 'error',
          confirmButtonColor: '#ef4444',
        })
        setLoading(false)
        return
      }

      setProducts(productData || [])
      setLoading(false)
    }

    loadMyProducts()
  }, [navigate])

  const handleDeleteProduct = async (productId) => {
    const result = await Swal.fire({
      title: 'ลบสินค้านี้?',
      text: 'เมื่อลบแล้วจะไม่สามารถกู้คืนได้',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#38bdf8',
    })

    if (!result.isConfirmed) return

    const { error } = await supabase.from('products').delete().eq('id', productId)

    if (error) {
      Swal.fire({
        title: 'ลบสินค้าไม่สำเร็จ',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#ef4444',
      })
      return
    }

    setProducts((prev) => prev.filter((item) => item.id !== productId))

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'ลบสินค้าเรียบร้อยแล้ว',
      showConfirmButton: false,
      timer: 1800,
      timerProgressBar: true,
    })
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">สินค้าของฉัน</h1>
            <p className="mt-1 text-sm text-gray-500">
              {profile?.role === 'admin'
                ? 'คุณกำลังดูสินค้าทั้งหมดในระบบ'
                : 'คุณกำลังดูสินค้าที่คุณเพิ่มไว้'}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/home')}
              className="rounded-lg bg-sky-100 px-4 py-2 text-sky-700 hover:bg-sky-200"
            >
              กลับหน้า Home
            </button>

            <button
              onClick={() => navigate('/seller/add-product')}
              className="rounded-lg bg-sky-400 px-4 py-2 font-semibold text-white hover:bg-sky-500"
            >
              เพิ่มสินค้า
            </button>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow">
            <h2 className="text-xl font-bold text-gray-700">ยังไม่มีสินค้า</h2>
            <p className="mt-2 text-sm text-gray-500">
              เริ่มเพิ่มสินค้าแรกของคุณได้เลย
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <div key={product.id} className="overflow-hidden rounded-2xl bg-white shadow">
                <div className="h-56 bg-gray-100">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h2 className="text-lg font-bold text-gray-800">{product.name}</h2>
                  <p className="mt-2 text-sm text-gray-500">{product.category}</p>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xl font-bold text-sky-500">
                      ฿{product.price}
                    </span>
                    <span className="text-sm text-gray-500">
                      Stock: {product.stock}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                    {product.description}
                  </p>

                  <div className="mt-4 flex gap-2">
                      <button
                          onClick={() => navigate(`/product/${product.id}`)}
                          className="flex-1 rounded-lg bg-sky-100 px-4 py-2 text-sky-700 hover:bg-sky-200"
                      >
                        ดูสินค้า
                    </button>

                      <button
                          onClick={() => navigate(`/seller/edit-product/${product.id}`)}
                          className="rounded-lg bg-yellow-400 px-4 py-2 text-white hover:bg-yellow-500"
                      >
                        แก้ไข
                    </button>

                      <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                      >
                        ลบ
                       </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyProducts