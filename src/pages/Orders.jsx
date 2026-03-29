import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { supabase } from '../lib/supabase'

function Orders() {
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
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            order_number,
            status,
            payment_status,
            total_amount,
            created_at
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        setOrders(data || [])
      } catch (error) {
        Swal.fire({
          title: 'โหลดคำสั่งซื้อไม่สำเร็จ',
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

  // 🔥 STATUS STYLE + TEXT
  const getStatus = (status) => {
    const map = {
      pending: { text: 'รอดำเนินการ', color: 'bg-yellow-100 text-yellow-700' },
      paid: { text: 'ชำระเงินแล้ว', color: 'bg-green-100 text-green-700' },
      shipped: { text: 'จัดส่งแล้ว', color: 'bg-purple-100 text-purple-700' },
      completed: { text: 'สำเร็จ', color: 'bg-emerald-100 text-emerald-700' },
      cancelled: { text: 'ยกเลิก', color: 'bg-red-100 text-red-700' },
    }
    return map[status] || { text: status, color: 'bg-gray-100 text-gray-700' }
  }

  const getPaymentStatus = (status) => {
    const map = {
      unpaid: { text: 'ยังไม่จ่าย', color: 'bg-red-100 text-red-700' },
      pending_verification: {
        text: 'รอตรวจสอบ',
        color: 'bg-yellow-100 text-yellow-700',
      },
      paid: { text: 'ชำระแล้ว', color: 'bg-green-100 text-green-700' },
      rejected: { text: 'ไม่ผ่าน', color: 'bg-gray-200 text-gray-700' },
    }
    return map[status] || { text: status, color: 'bg-gray-100 text-gray-700' }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('th-TH', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">คำสั่งซื้อของฉัน</h1>

          <button
            onClick={() => navigate('/home')}
            className="rounded-lg bg-sky-100 px-4 py-2 text-sky-700 hover:bg-sky-200"
          >
            กลับหน้า Home
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow">
            <h2 className="text-xl font-bold text-gray-700">
              ยังไม่มีคำสั่งซื้อ
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              ลองเลือกสินค้าแล้วสั่งซื้อดู 👀
            </p>

            <button
              onClick={() => navigate('/home')}
              className="mt-6 rounded-lg bg-sky-400 px-5 py-3 font-semibold text-white hover:bg-sky-500"
            >
              ไปเลือกสินค้า
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = getStatus(order.status)
              const payment = getPaymentStatus(order.payment_status)

              return (
                <div
                  key={order.id}
                  className="rounded-2xl bg-white p-6 shadow transition hover:shadow-lg"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm text-gray-500">เลขคำสั่งซื้อ</p>

                      <h2 className="text-lg font-bold text-gray-800">
                        {order.order_number}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${status.color}`}
                      >
                        📦 {status.text}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${payment.color}`}
                      >
                        💳 {payment.text}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-500">ยอดรวม</p>
                      <p className="text-xl font-bold text-sky-600">
                        ฿{Number(order.total_amount || 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
                      >
                        ดูรายละเอียด
                      </button>

                      <button
                        onClick={() =>
                          navigate(`/orders/${order.id}/upload-slip`)
                        }
                        className="rounded-lg bg-sky-400 px-4 py-2 font-medium text-white hover:bg-sky-500"
                      >
                        อัปโหลดสลิป
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders