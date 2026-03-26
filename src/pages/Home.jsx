import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

import Header from '../components/Header'
import CategoryBar from '../components/CategoryBar'
import HeroSection from '../components/HeroSection'
import ProductGrid from '../components/ProductGrid'

import logo from '../assets/goat-logoreee.png'
import banner1 from '../assets/paoo.jpg'
import banner2 from '../assets/sus.jpg'
import banner3 from '../assets/สีชมพู.jpg'

function Home() {
  const [currentBanner, setCurrentBanner] = useState(0)
  const [profile, setProfile] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState([])
  const navigate = useNavigate()

  const banners = [banner1, banner2, banner3]

  const categories = [
    'เสื้อผ้าผู้ชาย',
    'เสื้อผ้าผู้หญิง',
    'รองเท้า',
    'กระเป๋า',
    'เครื่องประดับ',
    'แฟชั่นใหม่',
    'ลดราคา',
    'สินค้าขายดี',
  ]

  useEffect(() => {
    const getProfileAndProducts = async () => {
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

      if (profileError) {
        alert(profileError.message)
        return
      }

      setProfile(profileData)

      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (productError) {
        alert(productError.message)
        return
      }

      setProducts(productData || [])
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
    navigate('/login')
  }

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Header
        logo={logo}
        user={profile}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onLogout={handleLogout}
      />

      <CategoryBar categories={categories} />

      <HeroSection
        banners={banners}
        currentBanner={currentBanner}
        setCurrentBanner={setCurrentBanner}
        nextBanner={nextBanner}
        prevBanner={prevBanner}
      />

      <ProductGrid products={filteredProducts} />
    </div>
  )
}

export default Home