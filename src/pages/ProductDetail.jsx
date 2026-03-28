import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import { supabase } from '../lib/supabase'
import { addToCart, getCartItemCount } from '../lib/cart'

import Header from '../components/Header'
import logo from '../assets/goat-logoreee.png'

function ProductDetail() {
  const [product, setProduct] = useState(null)
  const [profile, setProfile] = useState(null)
  const [cartCount, setCartCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  const [flyItem, setFlyItem] = useState(null)
  const [isFlying, setIsFlying] = useState(false)
  const [cartBounce, setCartBounce] = useState(false)

  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const loadPageData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        navigate('/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profileData || null)

      try {
        const count = await getCartItemCount(user.id)
        setCartCount(count)
      } catch {
        setCartCount(0)
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        Swal.fire({
          title: 'ไม่พบสินค้า',
          text: error.message,
          icon: 'error',
          confirmButtonColor: '#ef4444',
        })
        navigate('/home')
        return
      }

      setProduct(data)
      setLoading(false)
    }

    loadPageData()
  }, [id, navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const animateToCart = () => {
    const productImage = document.getElementById('product-main-image')
    const cartIcon = document.getElementById('cart-icon')

    if (!productImage || !cartIcon || !product?.image_url) return

    const imageRect = productImage.getBoundingClientRect()
    const cartRect = cartIcon.getBoundingClientRect()

    setFlyItem({
      image: product.image_url,
      startX: imageRect.left + imageRect.width / 2 - 40,
      startY: imageRect.top + imageRect.height / 2 - 40,
      endX: cartRect.left + cartRect.width / 2 - 20,
      endY: cartRect.top + cartRect.height / 2 - 20,
    })

    setIsFlying(false)

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsFlying(true)
      })
    })

    setTimeout(() => {
      setCartBounce(true)
    }, 750)

    setTimeout(() => {
      setFlyItem(null)
      setIsFlying(false)
    }, 950)

    setTimeout(() => {
      setCartBounce(false)
    }, 1200)
  }

  const handleAddToCart = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      navigate('/login')
      return
    }

    try {
      animateToCart()

      await addToCart(user.id, product.id, 1)

      const count = await getCartItemCount(user.id)
      setCartCount(count)

      setTimeout(() => {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'เพิ่มสินค้าลงตะกร้าแล้ว',
          showConfirmButton: false,
          timer: 1800,
          timerProgressBar: true,
        })
      }, 500)
    } catch (error) {
      Swal.fire({
        title: 'เพิ่มลงตะกร้าไม่สำเร็จ',
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
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className={cartBounce ? 'animate-[cartBounce_0.4s_ease]' : ''}>
        <Header
          logo={logo}
          user={profile}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onLogout={handleLogout}
          cartCount={cartCount}
        />
      </div>

      <div className="px-4 py-10">
        <div className="mx-auto max-w-6xl rounded-2xl bg-white p-8 shadow">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="overflow-hidden rounded-2xl bg-gray-100">
              {product.image_url ? (
                <img
                  id="product-main-image"
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  id="product-main-image"
                  className="flex h-[420px] items-center justify-center text-gray-400"
                >
                  No Image
                </div>
              )}
            </div>

            <div>
              <p className="mb-2 text-sm text-sky-500">{product.category}</p>
              <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>

              <div className="mt-4">
                <span className="text-3xl font-bold text-sky-500">
                  ฿{product.price}
                </span>
              </div>

              <div className="mt-4 rounded-xl bg-sky-50 p-4 text-sm text-gray-700">
                <p>
                  <span className="font-semibold">จำนวนคงเหลือ:</span> {product.stock}
                </p>
                <p className="mt-2">
                  <span className="font-semibold">สถานะ:</span>{' '}
                  {product.is_active ? 'พร้อมขาย' : 'ปิดการขาย'}
                </p>
              </div>

              <div className="mt-6">
                <h2 className="mb-2 text-lg font-bold text-gray-800">รายละเอียดสินค้า</h2>
                <p className="leading-7 text-gray-600">{product.description}</p>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => navigate('/home')}
                  className="rounded-lg bg-sky-100 px-5 py-3 text-sky-700 hover:bg-sky-200"
                >
                  กลับหน้า Home
                </button>

                <button
                  onClick={handleAddToCart}
                  className="rounded-lg bg-sky-400 px-5 py-3 font-semibold text-white transition hover:scale-105 hover:bg-sky-500"
                >
                  เพิ่มลงตะกร้า
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {flyItem && (
        <img
          src={flyItem.image}
          alt="flying-product"
          className="pointer-events-none fixed z-[9999] h-20 w-20 rounded-xl object-cover shadow-2xl"
          style={{
            left: `${flyItem.startX}px`,
            top: `${flyItem.startY}px`,
            transform: isFlying
              ? `translate(${flyItem.endX - flyItem.startX}px, ${flyItem.endY - flyItem.startY}px) scale(0.2)`
              : 'translate(0px, 0px) scale(1)',
            opacity: isFlying ? 0.15 : 1,
            transition: 'transform 0.95s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.95s ease',
          }}
        />
      )}

      <style>
        {`
          @keyframes cartBounce {
            0% { transform: scale(1); }
            35% { transform: scale(1.12); }
            60% { transform: scale(0.94); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  )
}

export default ProductDetail