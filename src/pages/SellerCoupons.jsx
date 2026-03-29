import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { supabase } from '../lib/supabase'

function SellerCoupons() {
  const [form, setForm] = useState({
    code: '',
    description: '',
    discount_type: 'percent',
    discount_value: '',
    min_order_amount: '',
    max_discount: '',
    usage_limit: '',
    per_user_limit: 1,
    expires_at: '',
  })

  const [loading, setLoading] = useState(false)
  const [coupons, setCoupons] = useState([])
  const [pageLoading, setPageLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    loadCoupons()
  }, [])

  const loadCoupons = async () => {
    try {
      setPageLoading(true)

      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setCoupons(data || [])
    } catch (error) {
      Swal.fire({
        title: 'โหลดคูปองไม่สำเร็จ',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setPageLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const resetForm = () => {
    setForm({
      code: '',
      description: '',
      discount_type: 'percent',
      discount_value: '',
      min_order_amount: '',
      max_discount: '',
      usage_limit: '',
      per_user_limit: 1,
      expires_at: '',
    })
  }

  const handleCreate = async (e) => {
    e.preventDefault()

    const code = form.code.trim().toUpperCase()
    const description = form.description.trim()
    const discountValue = Number(form.discount_value)
    const minOrderAmount = Number(form.min_order_amount || 0)
    const maxDiscount = form.max_discount ? Number(form.max_discount) : null
    const usageLimit = form.usage_limit ? Number(form.usage_limit) : null
    const perUserLimit = Number(form.per_user_limit || 1)

    if (!code) {
      Swal.fire({
        title: 'กรอกโค้ดคูปอง',
        text: 'กรุณากรอกโค้ดคูปองก่อน',
        icon: 'warning',
        confirmButtonColor: '#38bdf8',
      })
      return
    }

    if (!discountValue || discountValue <= 0) {
      Swal.fire({
        title: 'ส่วนลดไม่ถูกต้อง',
        text: 'กรุณากรอกส่วนลดให้มากกว่า 0',
        icon: 'warning',
        confirmButtonColor: '#38bdf8',
      })
      return
    }

    if (form.discount_type === 'percent' && discountValue > 100) {
      Swal.fire({
        title: 'เปอร์เซ็นต์ไม่ถูกต้อง',
        text: 'ส่วนลดแบบเปอร์เซ็นต์ต้องไม่เกิน 100',
        icon: 'warning',
        confirmButtonColor: '#38bdf8',
      })
      return
    }

    try {
      setLoading(true)

      const payload = {
        code,
        description: description || null,
        discount_type: form.discount_type,
        discount_value: discountValue,
        min_order_amount: minOrderAmount,
        max_discount: maxDiscount,
        usage_limit: usageLimit,
        per_user_limit: perUserLimit,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
        is_active: true,
      }

      const { error } = await supabase.from('coupons').insert([payload])

      if (error) throw error

      await Swal.fire({
        title: 'สร้างคูปองสำเร็จ',
        text: `คูปอง ${code} ถูกสร้างเรียบร้อยแล้ว`,
        icon: 'success',
        confirmButtonColor: '#38bdf8',
      })

      resetForm()
      loadCoupons()
    } catch (error) {
      Swal.fire({
        title: 'สร้างคูปองไม่สำเร็จ',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleCoupon = async (coupon) => {
    try {
      setActionLoadingId(coupon.id)

      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !coupon.is_active })
        .eq('id', coupon.id)

      if (error) throw error

      await loadCoupons()
    } catch (error) {
      Swal.fire({
        title: 'อัปเดตสถานะไม่สำเร็จ',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDeleteCoupon = async (coupon) => {
    const result = await Swal.fire({
      title: `ลบคูปอง ${coupon.code}?`,
      text: 'การลบจะไม่สามารถกู้คืนได้',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
    })

    if (!result.isConfirmed) return

    try {
      setActionLoadingId(coupon.id)

      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', coupon.id)

      if (error) throw error

      await Swal.fire({
        title: 'ลบคูปองสำเร็จ',
        icon: 'success',
        confirmButtonColor: '#38bdf8',
      })

      loadCoupons()
    } catch (error) {
      Swal.fire({
        title: 'ลบคูปองไม่สำเร็จ',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">จัดการคูปอง</h1>
          <button
            onClick={() => navigate('/home')}
            className="rounded-lg bg-sky-100 px-4 py-2 text-sky-700 hover:bg-sky-200"
          >
            กลับหน้าแรก
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">สร้างคูปอง</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  โค้ดคูปอง
                </label>
                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="เช่น SAVE10"
                  className="w-full rounded-lg border p-3 outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  รายละเอียด
                </label>
                <input
                  type="text"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="เช่น ลด 10% เมื่อซื้อครบ 300 บาท"
                  className="w-full rounded-lg border p-3 outline-none focus:border-sky-400"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    ประเภทส่วนลด
                  </label>
                  <select
                    name="discount_type"
                    value={form.discount_type}
                    onChange={handleChange}
                    className="w-full rounded-lg border p-3 outline-none focus:border-sky-400"
                  >
                    <option value="percent">เปอร์เซ็นต์ (%)</option>
                    <option value="fixed">จำนวนเงิน (บาท)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    มูลค่าส่วนลด
                  </label>
                  <input
                    type="number"
                    name="discount_value"
                    value={form.discount_value}
                    onChange={handleChange}
                    placeholder={form.discount_type === 'percent' ? 'เช่น 10' : 'เช่น 50'}
                    className="w-full rounded-lg border p-3 outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    ยอดขั้นต่ำ
                  </label>
                  <input
                    type="number"
                    name="min_order_amount"
                    value={form.min_order_amount}
                    onChange={handleChange}
                    placeholder="เช่น 300"
                    className="w-full rounded-lg border p-3 outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    ลดสูงสุด
                  </label>
                  <input
                    type="number"
                    name="max_discount"
                    value={form.max_discount}
                    onChange={handleChange}
                    placeholder="ใช้กับ % เช่น 100"
                    className="w-full rounded-lg border p-3 outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    จำนวนครั้งที่ใช้ได้ทั้งหมด
                  </label>
                  <input
                    type="number"
                    name="usage_limit"
                    value={form.usage_limit}
                    onChange={handleChange}
                    placeholder="เช่น 100"
                    className="w-full rounded-lg border p-3 outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    จำกัดต่อ 1 คน
                  </label>
                  <input
                    type="number"
                    name="per_user_limit"
                    value={form.per_user_limit}
                    onChange={handleChange}
                    placeholder="เช่น 1"
                    className="w-full rounded-lg border p-3 outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  วันหมดอายุ
                </label>
                <input
                  type="datetime-local"
                  name="expires_at"
                  value={form.expires_at}
                  onChange={handleChange}
                  className="w-full rounded-lg border p-3 outline-none focus:border-sky-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-sky-400 py-3 font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-sky-200"
              >
                {loading ? 'กำลังสร้างคูปอง...' : 'สร้างคูปอง'}
              </button>
            </form>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">รายการคูปอง</h2>

            {pageLoading ? (
              <div className="text-gray-500">กำลังโหลดรายการคูปอง...</div>
            ) : coupons.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center text-gray-500">
                ยังไม่มีคูปองในระบบ
              </div>
            ) : (
              <div className="space-y-4">
                {coupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          {coupon.code}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {coupon.description || 'ไม่มีรายละเอียด'}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          coupon.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {coupon.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                      <p>
                        ส่วนลด:{' '}
                        {coupon.discount_type === 'percent'
                          ? `${coupon.discount_value}%`
                          : `฿${coupon.discount_value}`}
                      </p>
                      <p>ยอดขั้นต่ำ: ฿{Number(coupon.min_order_amount || 0)}</p>
                      <p>ใช้ได้ทั้งหมด: {coupon.usage_limit || 'ไม่จำกัด'} ครั้ง</p>
                      <p>ใช้ไปแล้ว: {coupon.used_count || 0} ครั้ง</p>
                      <p>ต่อ 1 คน: {coupon.per_user_limit || 1} ครั้ง</p>
                      <p>
                        หมดอายุ:{' '}
                        {coupon.expires_at
                          ? new Date(coupon.expires_at).toLocaleString('th-TH')
                          : 'ไม่กำหนด'}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleCoupon(coupon)}
                        disabled={actionLoadingId === coupon.id}
                        className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
                          coupon.is_active
                            ? 'bg-amber-500 hover:bg-amber-600'
                            : 'bg-green-500 hover:bg-green-600'
                        } disabled:opacity-50`}
                      >
                        {coupon.is_active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteCoupon(coupon)}
                        disabled={actionLoadingId === coupon.id}
                        className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
                      >
                        ลบคูปอง
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SellerCoupons