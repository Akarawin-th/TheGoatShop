import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
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
        // ✅ Step 1: ดึง product ของ seller
        const { data: products, error: productError } = await supabase
          .from('products')
          .select('id')
          .eq('seller_id', user.id)

        if (productError) throw productError

        const productIds = (products || []).map(p => p.id)

        if (productIds.length === 0) {
          setOrders([])
          setLoading(false)
          return
        }

        // ✅ Step 2: ดึง order_items ที่มี product ของ seller
        const { data: orderItems, error: oiError } = await supabase
          .from('order_items')
          .select('order_id')
          .in('product_id', productIds)

        if (oiError) throw oiError

        const orderIds = [...new Set(orderItems.map(i => i.order_id))]

        if (orderIds.length === 0) {
          setOrders([])
          setLoading(false)
          return
        }

        // ✅ Step 3: ดึง orders จริง
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
        })
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [navigate])

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">ออเดอร์ของร้าน</h1>

        {orders.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow">
            ยังไม่มีออเดอร์
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="bg-white p-6 mb-4 rounded-xl shadow">
              <h2 className="font-bold">{order.order_number}</h2>
              <p>สถานะ: {order.status}</p>
              <p>การชำระเงิน: {order.payment_status}</p>
              <p>ยอด: ฿{order.total_amount}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default SellerOrders