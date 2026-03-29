import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { supabase } from '../lib/supabase'
import { getCartItems } from '../lib/cart'
import { validateCoupon } from '../lib/coupon'

function Coupons() {
  const [user, setUser] = useState(null)
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [subtotal, setSubtotal] = useState(0)

  const navigate = useNavigate()

  useEffect(() => {
    const loadData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          navigate('/login')
          return
        }

        setUser(user)

        const cartItems = await getCartItems(user.id)
        const total = cartItems.reduce((sum, item) => {
          const price = Number(item.products?.price || 0)
          return sum + price * item.quantity
        }, 0)

        setSubtotal(total)

        const { data, error } = await supabase
          .from('coupons')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (error) throw error

        setCoupons(data || [])
      } catch (error) {
        Swal.fire({
          title: 'โหลดคูปองไม่สำเร็จ',
          text: error.message,
          icon: 'error',
          confirmButtonColor: '#ef4444',
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [navigate])

  const handleSelectCoupon = async (coupon) => {
    try {
      const result = await validateCoupon({
        code: coupon.code,
        totalPrice: subtotal,
        userId: user.id,
      })

      if (!result?.valid) {
        Swal.fire({
          title: 'ใช้คูปองไม่ได้',
          text: result?.message || 'คูปองนี้ยังใช้ไม่ได้',
          icon: 'warning',
          confirmButtonColor: '#38bdf8',
        })
        return
      }

      await Swal.fire({
        title: 'เลือกคูปองสำเร็จ',
        text: `ใช้คูปอง ${coupon.code} ได้แล้ว`,
        icon: 'success',
        confirmButtonColor: '#38bdf8',
      })

      navigate('/checkout', {
        state: {
          selectedCoupon: result,
        },
      })
    } catch (error) {
      Swal.fire({
        title: 'เลือกคูปองไม่สำเร็จ',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#ef4444',
      })
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">คูปองทั้งหมด</h1>
            <p className="mt-1 text-sm text-gray-500">
              เลือกคูปองที่ต้องการใช้กับคำสั่งซื้อของคุณ
            </p>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="rounded-lg bg-sky-100 px-4 py-2 text-sky-700 hover:bg-sky-200"
          >
            กลับไป Checkout
          </button>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-4 shadow">
          <p className="text-sm text-gray-500">ยอดสินค้าปัจจุบัน</p>
          <p className="text-2xl font-bold text-gray-800">
            ฿{Number(subtotal).toFixed(2)}
          </p>
        </div>

        {coupons.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center shadow">
            ยังไม่มีคูปองในระบบ
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="rounded-2xl bg-white p-5 shadow transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-2 text-sm text-sky-500">คูปองส่วนลด</div>

                <h2 className="text-2xl font-bold text-gray-800">
                  {coupon.code}
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  {coupon.description || 'คูปองสำหรับใช้ลดราคาสินค้า'}
                </p>

                <div className="mt-4 space-y-1 text-sm text-gray-500">
                  <p>
                    ส่วนลด:{' '}
                    {coupon.discount_type === 'percent'
                      ? `${coupon.discount_value}%`
                      : `฿${coupon.discount_value}`}
                  </p>
                  <p>ยอดขั้นต่ำ: ฿{Number(coupon.min_order_amount || 0)}</p>
                  {coupon.max_discount && (
                    <p>ลดสูงสุด: ฿{Number(coupon.max_discount)}</p>
                  )}
                  {coupon.expires_at && (
                    <p>
                      หมดอายุ:{' '}
                      {new Date(coupon.expires_at).toLocaleString('th-TH')}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleSelectCoupon(coupon)}
                  className="mt-4 w-full rounded-lg bg-sky-400 py-2 font-semibold text-white hover:bg-sky-500"
                >
                  เลือกใช้คูปองนี้
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Coupons