import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { supabase } from '../lib/supabase'
import { getCartItemCount } from '../lib/cart'

import Header from '../components/Header'
import CategoryBar from '../components/CategoryBar'
import HeroSection from '../components/HeroSection'
import ProductGrid from '../components/ProductGrid'

import logo from '../assets/goat-logoreee.png'
import banner1 from '../assets/กระเป๋าโหด.jpeg'
import banner2 from '../assets/sus.jpg'
import banner3 from '../assets/รองเท้าดำ.jpg'

function Home() {
  const [currentBanner, setCurrentBanner] = useState(0)
  const [profile, setProfile] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด')
  const [products, setProducts] = useState([])
  const [cartCount, setCartCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()

  const banners = [banner1, banner2, banner3]

  const categories = [
    'เสื้อผ้าผู้ชาย',
    'เสื้อผ้าผู้หญิง',
    'รองเท้า',
    'กระเป๋า',
    'เครื่องประดับ',
    'แฟชั่นใหม่',
  ]

  useEffect(() => {
    const getProfileAndProducts = async () => {
      try {
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

        if (profileError) throw profileError

        setProfile(profileData)

        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (productError) throw productError

        setProducts(productData || [])

        try {
          const count = await getCartItemCount(user.id)
          setCartCount(count)
        } catch {
          setCartCount(0)
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

    getProfileAndProducts()
  }, [navigate])

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length)
  }

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()

    await Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'ออกจากระบบเรียบร้อยแล้ว',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    })

    navigate('/login')
  }

  const normalizedSearch = searchTerm.trim().toLowerCase()

  const filteredProducts = products.filter((product) => {
    const name = product.name?.toLowerCase() || ''
    const category = product.category?.toLowerCase() || ''
    const description = product.description?.toLowerCase() || ''

    const matchSearch =
      name.includes(normalizedSearch) ||
      category.includes(normalizedSearch) ||
      description.includes(normalizedSearch)

    const matchCategory =
      selectedCategory === 'ทั้งหมด' ||
      product.category === selectedCategory

    return matchSearch && matchCategory
  })

  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedCategory('ทั้งหมด')
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Header
        logo={logo}
        user={profile}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onLogout={handleLogout}
        cartCount={cartCount}
      />

      <CategoryBar
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <HeroSection
        banners={banners}
        currentBanner={currentBanner}
        setCurrentBanner={setCurrentBanner}
        nextBanner={nextBanner}
        prevBanner={prevBanner}
      />

      {filteredProducts.length === 0 ? (
        <div className="mx-auto mt-8 max-w-6xl px-4">
          <div className="rounded-2xl bg-white p-10 text-center shadow">
            <h2 className="text-2xl font-bold text-gray-800">
              ไม่พบสินค้า
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              ลองเปลี่ยนคำค้นหาหรือหมวดหมู่ที่เลือก
            </p>

            <button
              onClick={clearAllFilters}
              className="mt-6 rounded-lg bg-sky-400 px-5 py-3 font-semibold text-white hover:bg-sky-500"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        </div>
      ) : (
        <ProductGrid
          products={filteredProducts}
          selectedCategory={selectedCategory}
          onClearCategory={() => setSelectedCategory('ทั้งหมด')}
        />
      )}
    </div>
  )
}

export default Home