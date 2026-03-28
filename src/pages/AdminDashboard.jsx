import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { supabase } from '../lib/supabase'

function AdminDashboard() {
  const [orders, setOrders] = useState([])
  const [slips, setSlips] = useState({})
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    const loadAdminData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        navigate('/login')
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError || profileData.role !== 'admin') {
        Swal.fire({
          title: 'ไม่มีสิทธิ์เข้าใช้งาน',
          text: 'หน้านี้สำหรับ Admin เท่านั้น',
          icon: 'warning',
          confirmButtonColor: '#38bdf8',
        })
        navigate('/home')
        return
      }

      setProfile(profileData)

      try {
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })

        if (ordersError) throw ordersError

        const { data: slipsData, error: slipsError } = await supabase
          .from('payment_slips')
          .select('*')
          .order('created_at', { ascending: false })

        if (slipsError) throw slipsError

        const latestSlipByOrder = {}
        ;(slipsData || []).forEach((slip) => {
          if (!latestSlipByOrder[slip.order_id]) {
            latestSlipByOrder[slip.order_id] = slip
          }
        })

        setOrders(ordersData || [])
        setSlips(latestSlipByOrder)
      } catch (error) {
        Swal.fire({
          title: 'โหลดข้อมูลไม่สำเร็จ',
          text: error.message,
          icon: 'error',
          confirmButtonColor: '#ef4444',
        })
      } finally {
        setLoading(false)
      }
    }

    loadAdminData()
  }, [navigate])

  const updatePaymentStatus = async (orderId, paymentStatus, slipStatus) => {
    try {
      const { error: orderError } = await supabase
        .from('orders')
        .update({ payment_status: paymentStatus })
        .eq('id', orderId)

      if (orderError) throw orderError

      const slip = slips[orderId]
      if (slip) {
        const { error: slipError } = await supabase
          .from('payment_slips')
          .update({ status: slipStatus })
          .eq('id', slip.id)

        if (slipError) throw slipError
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, payment_status: paymentStatus } : order
        )
      )

      if (slips[orderId]) {
        setSlips((prev) => ({
          ...prev,
          [orderId]: { ...prev[orderId], status: slipStatus },
        }))
      }

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'อัปเดตสถานะเรียบร้อย',
        showConfirmButton: false,
        timer: 1800,
      })
    } catch (error) {
      Swal.fire({
        title: 'อัปเดตสถานะไม่สำเร็จ',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#ef4444',
      })
    }
  }

  const updateOrderStatus = async (orderId, status) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)

      if (error) throw error

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status } : order
        )
      )

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'อัปเดตสถานะออเดอร์แล้ว',
        showConfirmButton: false,
        timer: 1800,
      })
    } catch (error) {
      Swal.fire({
        title: 'อัปเดตสถานะออเดอร์ไม่สำเร็จ',
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
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              ยินดีต้อนรับ, {profile?.username || profile?.email || 'Admin'}
            </p>
          </div>

          <button
            onClick={() => navigate('/home')}
            className="rounded-lg bg-sky-100 px-4 py-2 text-sky-700 hover:bg-sky-200"
          >
            กลับหน้า Home
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow">
            <h2 className="text-xl font-bold text-gray-700">ยังไม่มีคำสั่งซื้อ</h2>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const slip = slips[order.id]

              return (
                <div key={order.id} className="rounded-2xl bg-white p-6 shadow">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-sm text-gray-500">เลขคำสั่งซื้อ</p>
                      <h2 className="text-lg font-bold text-gray-800">
                        {order.order_number}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        User ID: {order.user_id}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        วันที่สั่งซื้อ:{' '}
                        {order.created_at
                          ? new Date(order.created_at).toLocaleString('th-TH')
                          : '-'}
                      </p>
                    </div>

                    <div className="text-left lg:text-right">
                      <p className="text-sm text-gray-600">
                        สถานะออเดอร์: <span className="font-semibold">{order.status}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        การชำระเงิน:{' '}
                        <span className="font-semibold">{order.payment_status}</span>
                      </p>
                      <p className="mt-2 text-xl font-bold text-sky-600">
                        ฿{Number(order.total_amount || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 border-t pt-4 lg:grid-cols-[1fr_auto]">
                    <div>
                      {slip ? (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">
                            หลักฐานการชำระเงิน
                          </p>

                          <a
                            href={slip.slip_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block rounded-lg bg-gray-100 px-4 py-2 text-sm text-sky-700 hover:bg-gray-200"
                          >
                            เปิดดูสลิป
                          </a>

                          <p className="text-sm text-gray-500">
                            สถานะสลิป: {slip.status}
                          </p>

                          {slip.note && (
                            <p className="text-sm text-gray-500">หมายเหตุ: {slip.note}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">ยังไม่มีการอัปโหลดสลิป</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() =>
                          updatePaymentStatus(order.id, 'paid', 'approved')
                        }
                        className="rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
                      >
                        อนุมัติการชำระเงิน
                      </button>

                      <button
                        onClick={() =>
                          updatePaymentStatus(order.id, 'rejected', 'rejected')
                        }
                        className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                      >
                        ปฏิเสธการชำระเงิน
                      </button>

                      <button
                        onClick={() => updateOrderStatus(order.id, 'shipped')}
                        className="rounded-lg bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
                      >
                        เปลี่ยนเป็นจัดส่งแล้ว
                      </button>

                      <button
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="rounded-lg bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600"
                      >
                        เปลี่ยนเป็นสำเร็จ
                      </button>

                      <button
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
                      >
                        ดูรายละเอียดออเดอร์
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

export default AdminDashboard