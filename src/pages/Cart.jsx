import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { supabase } from '../lib/supabase'
import { getCartItems, removeCartItem, updateCartItemQuantity } from '../lib/cart'

function Cart() {
  const [user, setUser] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const loadCart = async () => {
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
        setItems(cartItems)
      } catch (error) {
        Swal.fire({
          title: 'โหลดตะกร้าไม่สำเร็จ',
          text: error.message,
          icon: 'error',
          confirmButtonColor: '#ef4444',
        })
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [navigate])

  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = item.products?.price || 0
      return sum + price * item.quantity
    }, 0)
  }, [items])

  const handleIncrease = async (item) => {
    try {
      await updateCartItemQuantity(item.id, item.quantity + 1)
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      )
    } catch (error) {
      Swal.fire({
        title: 'เพิ่มจำนวนไม่สำเร็จ',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#ef4444',
      })
    }
  }

  const handleDecrease = async (item) => {
    if (item.quantity <= 1) return

    try {
      await updateCartItemQuantity(item.id, item.quantity - 1)
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i
        )
      )
    } catch (error) {
      Swal.fire({
        title: 'ลดจำนวนไม่สำเร็จ',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#ef4444',
      })
    }
  }

  const handleRemove = async (itemId) => {
    const result = await Swal.fire({
      title: 'ลบสินค้านี้ออกจากตะกร้า?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#38bdf8',
    })

    if (!result.isConfirmed) return

    try {
      await removeCartItem(itemId)
      setItems((prev) => prev.filter((item) => item.id !== itemId))
    } catch (error) {
      Swal.fire({
        title: 'ลบสินค้าไม่สำเร็จ',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#ef4444',
      })
    }
  }

  const handleCheckout = () => {
    navigate('/checkout')
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">ตะกร้าสินค้า</h1>
          <button
            onClick={() => navigate('/home')}
            className="rounded-lg bg-sky-100 px-4 py-2 text-sky-700 hover:bg-sky-200"
          >
            กลับหน้า Home
          </button>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow">
            <h2 className="text-xl font-bold text-gray-700">ยังไม่มีสินค้าในตะกร้า</h2>
            <p className="mt-2 text-sm text-gray-500">
              ลองเลือกสินค้าที่คุณสนใจแล้วเพิ่มลงตะกร้าได้เลย
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-2xl bg-white p-4 shadow"
                >
                  <div className="h-28 w-28 overflow-hidden rounded-xl bg-gray-100">
                    {item.products?.image_url ? (
                      <img
                        src={item.products.image_url}
                        alt={item.products.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">
                        {item.products?.name}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        ราคา ฿{item.products?.price}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDecrease(item)}
                          className="rounded-lg bg-sky-100 px-3 py-1 text-sky-700"
                        >
                          -
                        </button>
                        <span className="min-w-[24px] text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleIncrease(item)}
                          className="rounded-lg bg-sky-100 px-3 py-1 text-sky-700"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemove(item.id)}
                        className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-fit rounded-2xl bg-white p-6 shadow">
              <h2 className="text-xl font-bold text-gray-800">สรุปคำสั่งซื้อ</h2>

              <div className="mt-4 flex items-center justify-between text-gray-600">
                <span>จำนวนสินค้า</span>
                <span>{items.length} รายการ</span>
              </div>

              <div className="mt-3 flex items-center justify-between text-lg font-bold text-gray-800">
                <span>รวมทั้งหมด</span>
                <span>฿{totalPrice}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="mt-6 w-full rounded-lg bg-sky-400 py-3 font-semibold text-white hover:bg-sky-500"
              >
                ดำเนินการสั่งซื้อ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart