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

  const products = [
    {
      id: 1,
      name: 'เสื้อเชิ้ตผู้ชายลายเรียบ',
      price: 390,
      oldPrice: 590,
      discount: '34%',
      image: banner1,
    },
    {
      id: 2,
      name: 'กางเกงขายาวทรงสวย',
      price: 490,
      oldPrice: 690,
      discount: '29%',
      image: banner2,
    },
    {
      id: 3,
      name: 'รองเท้าผ้าใบแฟชั่น',
      price: 790,
      oldPrice: 990,
      discount: '20%',
      image: banner3,
    },
    {
      id: 4,
      name: 'แจ็คเก็ตสไตล์มินิมอล',
      price: 690,
      oldPrice: 890,
      discount: '22%',
      image: banner1,
    },
    {
      id: 5,
      name: 'กระเป๋าสะพายลำลอง',
      price: 550,
      oldPrice: 750,
      discount: '27%',
      image: banner2,
    },
    {
      id: 6,
      name: 'หมวกแฟชั่นเรียบหรู',
      price: 250,
      oldPrice: 350,
      discount: '29%',
      image: banner3,
    },
    {
      id: 7,
      name: 'เสื้อยืด Oversize',
      price: 320,
      oldPrice: 420,
      discount: '24%',
      image: banner1,
    },
    {
      id: 8,
      name: 'ชุดเซตแฟชั่นประจำวัน',
      price: 890,
      oldPrice: 1190,
      discount: '25%',
      image: banner2,
    },
  ]

  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        navigate('/login')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        alert(error.message)
        return
      }

      setProfile(data)
    }

    getProfile()
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

      <ProductGrid products={products} />
    </div>
  )
}

export default Home