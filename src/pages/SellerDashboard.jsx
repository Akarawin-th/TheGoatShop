import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { supabase } from '../lib/supabase'

function SellerDashboard() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()

  useEffect(() => {
    const loadSellerDashboard = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        navigate('/login')
        return
      }

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
      setLoading(false)
    }

    loadSellerDashboard()
  }, [navigate])

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Seller Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              ยินดีต้อนรับ, {profile?.username || profile?.email || 'Seller'}
            </p>
          </div>

          <button
            onClick={() => navigate('/home')}
            className="rounded-lg bg-sky-100 px-4 py-2 text-sky-700 hover:bg-sky-200"
          >
            กลับหน้า Home
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold text-gray-800">เพิ่มสินค้า</h2>
            <p className="mt-2 text-sm text-gray-500">
              เพิ่มสินค้าใหม่เข้าสู่ร้านของคุณ
            </p>

            <button
              onClick={() => navigate('/seller/add-product')}
              className="mt-6 w-full rounded-lg bg-sky-400 py-3 font-semibold text-white hover:bg-sky-500"
            >
              ไปหน้าเพิ่มสินค้า
            </button>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold text-gray-800">สินค้าของฉัน</h2>
            <p className="mt-2 text-sm text-gray-500">
              ดูสินค้า แก้ไขข้อมูล หรือลบสินค้า
            </p>

            <button
              onClick={() => navigate('/seller/my-products')}
              className="mt-6 w-full rounded-lg bg-sky-400 py-3 font-semibold text-white hover:bg-sky-500"
            >
              ไปหน้าสินค้าของฉัน
            </button>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold text-gray-800">ออเดอร์ของร้าน</h2>
            <p className="mt-2 text-sm text-gray-500">
              ดูคำสั่งซื้อและตรวจสอบสถานะการชำระเงิน
            </p>

            <button
              onClick={() => navigate('/seller/orders')}
              className="mt-6 w-full rounded-lg bg-sky-400 py-3 font-semibold text-white hover:bg-sky-500"
            >
              ไปหน้าออเดอร์ร้าน
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SellerDashboard