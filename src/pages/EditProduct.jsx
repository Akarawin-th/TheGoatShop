import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import { supabase } from '../lib/supabase'
import ProductForm from '../components/ProductForm'

function EditProduct() {
  const { productId } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [initialData, setInitialData] = useState(null)

  useEffect(() => {
    const loadProduct = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        navigate('/login')
        return
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!profile || (profile.role !== 'seller' && profile.role !== 'admin')) {
          navigate('/home')
          return
        }

        const { data: product, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single()

        if (error) throw error

        if (profile.role !== 'admin' && product.seller_id !== user.id) {
          Swal.fire({
            title: 'ไม่มีสิทธิ์แก้ไขสินค้า',
            icon: 'warning',
            confirmButtonColor: '#38bdf8',
          })
          navigate('/seller/my-products')
          return
        }

        setInitialData(product)
      } catch (error) {
        Swal.fire({
          title: 'โหลดสินค้าไม่สำเร็จ',
          text: error.message,
          icon: 'error',
          confirmButtonColor: '#ef4444',
        })
        navigate('/seller/my-products')
      } finally {
        setPageLoading(false)
      }
    }

    loadProduct()
  }, [navigate, productId])

  const handleEditProduct = async (formData) => {
    setLoading(true)

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          stock: formData.stock,
          category: formData.category,
          image_url: formData.image_url || null,
        })
        .eq('id', productId)

      if (error) throw error

      await Swal.fire({
        title: 'แก้ไขสินค้าเรียบร้อยแล้ว',
        icon: 'success',
        confirmButtonColor: '#38bdf8',
      })

      navigate('/seller/my-products')
    } catch (error) {
      Swal.fire({
        title: 'แก้ไขสินค้าไม่สำเร็จ',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) {
    return <div className="p-6">Loading...</div>
  }

  if (!initialData) {
    return <div className="p-6">ไม่พบสินค้า</div>
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">แก้ไขสินค้า</h1>
            <p className="mt-1 text-sm text-gray-500">
              ปรับปรุงข้อมูลสินค้าของคุณ
            </p>
          </div>

          <button
            onClick={() => navigate('/seller/my-products')}
            className="rounded-lg bg-sky-100 px-4 py-2 text-sky-700 hover:bg-sky-200"
          >
            กลับ
          </button>
        </div>

        <ProductForm
          onSubmit={handleEditProduct}
          loading={loading}
          initialData={initialData}
        />
      </div>
    </div>
  )
}

export default EditProduct