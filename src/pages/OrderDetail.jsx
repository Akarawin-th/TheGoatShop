import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import { supabase } from '../lib/supabase'

function OrderDetail() {
  const { orderId } = useParams()
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrderDetail = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        navigate('/login')
        return
      }

      try {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single()

        if (orderError) throw orderError

        const { data: itemData, error: itemError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderId)

        if (itemError) throw itemError

        setOrder(orderData)
        setItems(itemData || [])
      } catch (error) {
        Swal.fire({
          title: 'โหลดรายละเอียดออเดอร์ไม่สำเร็จ',
          text: error.message,
          icon: 'error',
          confirmButtonColor: '#ef4444',
        })
        navigate('/orders')
      } finally {
        setLoading(false)
      }
    }

    loadOrderDetail()
  }, [navigate, orderId])

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  if (!order) {
    return <div className="p-6">ไม่พบข้อมูลออเดอร์</div>
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">รายละเอียดคำสั่งซื้อ</h1>
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg bg-sky-100 px-4 py-2 text-sky-700 hover:bg-sky-200"
          >
            กลับ
          </button>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="grid gap-4 border-b pb-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">เลขคำสั่งซื้อ</p>
              <h2 className="text-lg font-bold text-gray-800">{order.order_number}</h2>
            </div>

            <div>
              <p className="text-sm text-gray-500">ยอดรวม</p>
              <h2 className="text-lg font-bold text-sky-600">
                ฿{Number(order.total_amount || 0).toFixed(2)}
              </h2>
            </div>

            <div>
              <p className="text-sm text-gray-500">ชื่อผู้รับ</p>
              <p className="font-medium text-gray-800">{order.shipping_name || '-'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">เบอร์โทร</p>
              <p className="font-medium text-gray-800">{order.shipping_phone || '-'}</p>
            </div>

            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">ที่อยู่จัดส่ง</p>
              <p className="font-medium text-gray-800">{order.shipping_address || '-'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">สถานะออเดอร์</p>
              <p className="font-medium text-gray-800">{order.status}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">สถานะการชำระเงิน</p>
              <p className="font-medium text-gray-800">{order.payment_status}</p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="mb-4 text-xl font-bold text-gray-800">รายการสินค้า</h3>

            {items.length === 0 ? (
              <p className="text-sm text-gray-500">ไม่พบรายการสินค้า</p>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border p-4"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{item.product_name}</p>
                      <p className="text-sm text-gray-500">
                        ฿{Number(item.product_price || 0).toFixed(2)} × {item.quantity}
                      </p>
                    </div>

                    <p className="font-bold text-sky-600">
                      ฿{(Number(item.product_price || 0) * Number(item.quantity || 0)).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail