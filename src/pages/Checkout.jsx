import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { supabase } from '../lib/supabase'
import { getCartItems } from '../lib/cart'

function Checkout() {
  const [user, setUser] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    const loadCheckoutData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        navigate('/login')
        return
      }

      setUser(user)

      try {
        const cartItems = await getCartItems(user.id)

        if (!cartItems.length) {
          await Swal.fire({
            title: 'ตะกร้าว่าง',
            text: 'กรุณาเพิ่มสินค้าก่อนทำรายการสั่งซื้อ',
            icon: 'warning',
            confirmButtonColor: '#38bdf8',
          })
          navigate('/cart')
          return
        }

        setItems(cartItems)

        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, phone, address')
          .eq('id', user.id)
          .single()

        if (profileData) {
          setFullName(profileData.full_name || '')
          setPhone(profileData.phone || '')
          setAddress(profileData.address || '')
        }
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

    loadCheckoutData()
  }, [navigate])

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = Number(item.products?.price || 0)
      return sum + price * item.quantity
    }, 0)
  }, [items])

  const totalQuantity = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0)
  }, [items])

  const handlePlaceOrder = async (e) => {
    e.preventDefault()

    const trimmedFullName = fullName.trim()
    const trimmedPhone = phone.trim()
    const trimmedAddress = address.trim()

    if (!trimmedFullName || !trimmedPhone || !trimmedAddress) {
      Swal.fire({
        title: 'กรอกข้อมูลไม่ครบ',
        text: 'กรุณากรอกชื่อ เบอร์โทร และที่อยู่ให้ครบ',
        icon: 'warning',
        confirmButtonColor: '#38bdf8',
      })
      return
    }

    if (!user) return

    setSubmitting(true)

    try {
      const orderNumber = `ORD-${Date.now()}`

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            order_number: orderNumber,
            shipping_name: trimmedFullName,
            shipping_phone: trimmedPhone,
            shipping_address: trimmedAddress,
            subtotal,
            discount_amount: 0,
            total_amount: subtotal,
            status: 'pending',
            payment_status: 'unpaid',
          },
        ])
        .select()
        .single()

      if (orderError) throw orderError

      const orderItemsPayload = items.map((item) => {
        const product = item.products
        const price = Number(product?.price || 0)
        const quantity = item.quantity

        return {
          order_id: order.id,
          product_id: product?.id || null,
          product_name: product?.name || 'Unknown Product',
          product_price: price,
          quantity,
        }
      })

      const { error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItemsPayload)

      if (orderItemsError) throw orderItemsError

      const cartItemIds = items.map((item) => item.id)

      const { error: clearCartError } = await supabase
        .from('cart_items')
        .delete()
        .in('id', cartItemIds)

      if (clearCartError) throw clearCartError

      await Swal.fire({
        title: 'สั่งซื้อสำเร็จ',
        text: 'ระบบได้สร้างคำสั่งซื้อของคุณแล้ว',
        icon: 'success',
        confirmButtonColor: '#38bdf8',
      })

      navigate('/orders')
    } catch (error) {
      Swal.fire({
        title: 'สั่งซื้อไม่สำเร็จ',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
          <button
            onClick={() => navigate('/cart')}
            className="rounded-lg bg-sky-100 px-4 py-2 text-sky-700 hover:bg-sky-200"
          >
            กลับไปตะกร้า
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <form
            onSubmit={handlePlaceOrder}
            className="rounded-2xl bg-white p-6 shadow"
          >
            <h2 className="mb-4 text-xl font-bold text-gray-800">
              ข้อมูลสำหรับจัดส่ง
            </h2>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                ชื่อผู้รับ
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border p-3 outline-none focus:border-sky-400"
                placeholder="กรอกชื่อผู้รับ"
              />
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                เบอร์โทร
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border p-3 outline-none focus:border-sky-400"
                placeholder="กรอกเบอร์โทร"
              />
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                ที่อยู่
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows="4"
                className="w-full rounded-lg border p-3 outline-none focus:border-sky-400"
                placeholder="กรอกที่อยู่สำหรับจัดส่ง"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-sky-400 py-3 font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-sky-200"
            >
              {submitting ? 'กำลังสร้างคำสั่งซื้อ...' : 'ยืนยันคำสั่งซื้อ'}
            </button>
          </form>

          <div className="h-fit rounded-2xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold text-gray-800">สรุปคำสั่งซื้อ</h2>

            <div className="mt-4 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 border-b pb-3"
                >
                  <div className="h-16 w-16 overflow-hidden rounded-lg bg-gray-100">
                    {item.products?.image_url ? (
                      <img
                        src={item.products.image_url}
                        alt={item.products.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      {item.products?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      ฿{item.products?.price} × {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-gray-600">
              <span>จำนวนทั้งหมด</span>
              <span>{totalQuantity} ชิ้น</span>
            </div>

            <div className="mt-3 flex items-center justify-between text-lg font-bold text-gray-800">
              <span>ยอดรวมสุทธิ</span>
              <span>฿{subtotal}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout