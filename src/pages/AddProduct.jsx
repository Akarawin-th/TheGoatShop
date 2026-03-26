import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { supabase } from '../lib/supabase'
import ProductForm from '../components/ProductForm'

function AddProduct() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  const navigate = useNavigate()

  useEffect(() => {
    const checkSeller = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        navigate('/login')
        return
      }

      setUser(user)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: error.message,
          icon: 'error',
          confirmButtonColor: '#ef4444',
        })
        navigate('/home')
        return
      }

      if (data.role !== 'seller' && data.role !== 'admin') {
        Swal.fire({
          title: 'ไม่มีสิทธิ์เข้าใช้งาน',
          text: 'หน้านี้สำหรับ Seller หรือ Admin เท่านั้น',
          icon: 'warning',
          confirmButtonColor: '#38bdf8',
        })
        navigate('/home')
        return
      }

      setProfile(data)
      setPageLoading(false)
    }

    checkSeller()
  }, [navigate])

  const handleAddProduct = async (formData) => {
    setLoading(true)

    const { error } = await supabase.from('products').insert([
      {
        seller_id: user.id,
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock: formData.stock,
        category: formData.category,
        image_url: formData.image_url || null,
        is_active: true,
      },
    ])

    setLoading(false)

    if (error) {
      Swal.fire({
        title: 'เพิ่มสินค้าไม่สำเร็จ',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#ef4444',
      })
      return
    }

    await Swal.fire({
      title: 'สำเร็จ',
      text: 'เพิ่มสินค้าเรียบร้อยแล้ว',
      icon: 'success',
      confirmButtonColor: '#38bdf8',
    })

    navigate('/seller/my-products')
  }

  if (pageLoading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">เพิ่มสินค้า</h1>
            <p className="mt-1 text-sm text-gray-500">
              Seller: {profile?.username || profile?.email}
            </p>
          </div>

          <button
            onClick={() => navigate('/seller/my-products')}
            className="rounded-lg bg-sky-100 px-4 py-2 text-sky-700 hover:bg-sky-200"
          >
            ไปสินค้าของฉัน
          </button>
        </div>

        <ProductForm onSubmit={handleAddProduct} loading={loading} />
      </div>
    </div>
  )
}

export default AddProduct