import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'

function SellerOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const loadOrders = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        navigate('/login')
        return
      }

      try {
        const { data: products, error: productError } = await supabase
          .from('products')
          .select('id')
          .eq('seller_id', user.id)

        if (productError) throw productError

        const productIds = (products || []).map((p) => p.id)

        if (productIds.length === 0) {
          setOrders([])
          setLoading(false)
          return
        }

        const { data: orderItems, error: oiError } = await supabase
          .from('order_items')
          .select('order_id')
          .in('product_id', productIds)

        if (oiError) throw oiError

        const orderIds = [...new Set((orderItems || []).map((i) => i.order_id))]

        if (orderIds.length === 0) {
          setOrders([])
          setLoading(false)
          return
        }

        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .in('id', orderIds)
          .order('created_at', { ascending: false })

        if (ordersError) throw ordersError

        setOrders(ordersData || [])
      } catch (error) {
        Swal.fire({
          title: 'โหลดออเดอร์ไม่สำเร็จ',
          text: error.message,
          icon: 'error',
          confirmButtonColor: '#ef4444',
        })
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [navigate])

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">ออเดอร์ของร้าน</h1>

          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 rounded-lg bg-sky-400 px-4 py-2 font-medium text-white transition hover:bg-sky-500"
          >
            <ArrowLeft size={16} />
            กลับ Home
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-xl bg-white p-8 shadow">
            <h2 className="text-lg font-semibold text-gray-800">ยังไม่มีออเดอร์</h2>
            <p className="mt-2 text-sm text-gray-500">
              เมื่อมีลูกค้าสั่งซื้อสินค้า ออเดอร์จะมาแสดงที่หน้านี้
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl bg-white p-6 shadow transition hover:shadow-md"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      {order.order_number}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      สถานะคำสั่งซื้อ: {order.status}
                    </p>
                    <p className="text-sm text-gray-500">
                      การชำระเงิน: {order.payment_status}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-sm text-gray-500">ยอดรวม</p>
                    <p className="text-xl font-bold text-sky-600">
                      ฿{Number(order.total_amount || 0).toLocaleString()}
                    </p>
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

export default SellerOrders