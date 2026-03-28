import { useState } from 'react'
import Swal from 'sweetalert2'
import { supabase } from '../lib/supabase'

function ProductForm({ initialData = {}, onSubmit, loading }) {
  const [name, setName] = useState(initialData.name || '')
  const [price, setPrice] = useState(initialData.price || '')
  const [stock, setStock] = useState(initialData.stock || '')
  const [category, setCategory] = useState(initialData.category || '')
  const [description, setDescription] = useState(initialData.description || '')
  const [imageUrl, setImageUrl] = useState(initialData.image_url || '')
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(initialData.image_url || '')
  const [uploadingImage, setUploadingImage] = useState(false)

  const showWarningPopup = (text) => {
    Swal.fire({
      title: 'กรอกข้อมูลไม่ครบ',
      text,
      icon: 'warning',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#38bdf8',
    })
  }

  const showErrorPopup = (text) => {
    Swal.fire({
      title: 'เกิดข้อผิดพลาด',
      text,
      icon: 'error',
      confirmButtonText: 'ปิด',
      confirmButtonColor: '#ef4444',
    })
  }

  const uploadProductImage = async () => {
    if (!imageFile) return imageUrl || null

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(imageFile.type)) {
      throw new Error('กรุณาอัปโหลดไฟล์ png, jpg, jpeg หรือ webp')
    }

    setUploadingImage(true)

    const fileExt = imageFile.name.split('.').pop()
    const filePath = `products/product-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, imageFile, { upsert: true })

    setUploadingImage(false)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name.trim()) {
      showWarningPopup('กรุณากรอกชื่อสินค้า')
      return
    }

    if (!price || Number(price) <= 0) {
      showWarningPopup('กรุณากรอกราคาสินค้าให้ถูกต้อง')
      return
    }

    if (stock === '' || Number(stock) < 0) {
      showWarningPopup('กรุณากรอกจำนวนสินค้าให้ถูกต้อง')
      return
    }

    if (!category.trim()) {
      showWarningPopup('กรุณากรอกหมวดหมู่สินค้า')
      return
    }

    if (!description.trim()) {
      showWarningPopup('กรุณากรอกรายละเอียดสินค้า')
      return
    }

    try {
      const uploadedImageUrl = await uploadProductImage()

      await onSubmit({
        name: name.trim(),
        price: Number(price),
        stock: Number(stock),
        category: category.trim(),
        description: description.trim(),
        image_url: uploadedImageUrl,
      })
    } catch (error) {
      showErrorPopup(error.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          ชื่อสินค้า
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="เช่น เสื้อเชิ้ตผู้ชาย"
          className="w-full rounded-lg border p-3 outline-none focus:border-sky-400"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            ราคา
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="เช่น 390"
            className="w-full rounded-lg border p-3 outline-none focus:border-sky-400"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            จำนวนสินค้า (Stock)
          </label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="เช่น 20"
            className="w-full rounded-lg border p-3 outline-none focus:border-sky-400"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          หมวดหมู่
        </label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="เช่น เสื้อผ้าผู้ชาย"
          className="w-full rounded-lg border p-3 outline-none focus:border-sky-400"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          รูปสินค้า
        </label>

        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleImageChange}
          className="w-full rounded-lg border p-3 outline-none focus:border-sky-400"
        />

        {previewUrl && (
          <img
            src={previewUrl}
            alt="preview"
            className="mt-3 h-40 w-40 rounded-xl object-cover shadow"
          />
        )}

        {uploadingImage && (
          <p className="mt-2 text-sm text-sky-500">กำลังอัปโหลดรูป...</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          รายละเอียดสินค้า
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="5"
          placeholder="อธิบายสินค้า"
          className="w-full rounded-lg border p-3 outline-none focus:border-sky-400"
        />
      </div>

      <button
        type="submit"
        disabled={loading || uploadingImage}
        className="w-full rounded-lg bg-sky-400 py-3 font-semibold text-white transition hover:bg-sky-500 disabled:bg-sky-200"
      >
        {loading || uploadingImage ? 'กำลังบันทึก...' : 'บันทึกสินค้า'}
      </button>
    </form>
  )
}

export default ProductForm