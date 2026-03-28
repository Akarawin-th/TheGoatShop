import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import { supabase } from '../lib/supabase'

function UploadSlip() {
  const { orderId } = useParams()
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [order, setOrder] = useState(null)
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadOrder = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        navigate('/login')
        return
      }

      setUser(user)

      try {
        const { data, error } = await supabase
          .from('orders')
          .select('id, order_number, total_amount, payment_status, status, user_id')
          .eq('id', orderId)
          .single()

        if (error) throw error

        if (!data || data.user_id !== user.id) {
          Swal.fire({
            title: 'ไม่พบคำสั่งซื้อ',
            text: 'คุณไม่มีสิทธิ์เข้าถึงคำสั่งซื้อนี้',
            icon: 'error',
            confirmButtonColor: '#ef4444',
          })
          navigate('/orders')
          return
        }

        setOrder(data)
      } catch (error) {
        Swal.fire({
          title: 'โหลดคำสั่งซื้อไม่สำเร็จ',
          text: error.message,
          icon: 'error',
          confirmButtonColor: '#ef4444',
        })
        navigate('/orders')
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [navigate, orderId])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']

    if (!allowedTypes.includes(selectedFile.type)) {
      Swal.fire({
        title: 'ไฟล์ไม่ถูกต้อง',
        text: 'กรุณาอัปโหลดไฟล์รูปภาพ png, jpg, jpeg หรือ webp',
        icon: 'warning',
        confirmButtonColor: '#38bdf8',
      })
      return
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      Swal.fire({
        title: 'ไฟล์ใหญ่เกินไป',
        text: 'กรุณาอัปโหลดไฟล์ขนาดไม่เกิน 5 MB',
        icon: 'warning',
        confirmButtonColor: '#38bdf8',
      })
      return
    }

    setFile(selectedFile)
    setPreviewUrl(URL.createObjectURL(selectedFile))
  }

  const handleUploadSlip = async (e) => {
    e.preventDefault()

    if (!user || !order) return

    if (!file) {
      Swal.fire({
        title: 'ยังไม่ได้เลือกรูปสลิป',
        text: 'กรุณาเลือกไฟล์รูปก่อนอัปโหลด',
        icon: 'warning',
        confirmButtonColor: '#38bdf8',
      })
      return
    }

    setSubmitting(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${order.id}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('payment-slips')
        .upload(fileName, file, {
          upsert: false,
        })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('payment-slips').getPublicUrl(fileName)

      const { error: insertSlipError } = await supabase
        .from('payment_slips')
        .insert([
          {
            order_id: order.id,
            user_id: user.id,
            slip_url: publicUrl,
            note: note.trim() || null,
            status: 'pending',
          },
        ])

      if (insertSlipError) throw insertSlipError

      const { error: updateOrderError } = await supabase
        .from('orders')
        .update({
          payment_status: 'pending_verification',
        })
        .eq('id', order.id)

      if (updateOrderError) throw updateOrderError

      await Swal.fire({
        title: 'อัปโหลดสลิปสำเร็จ',
        text: 'ระบบได้รับหลักฐานการชำระเงินของคุณแล้ว',
        icon: 'success',
        confirmButtonColor: '#38bdf8',
      })

      navigate('/orders')
    } catch (error) {
      Swal.fire({
        title: 'อัปโหลดสลิปไม่สำเร็จ',
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
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">อัปโหลดสลิป</h1>
          <button
            onClick={() => navigate('/orders')}
            className="rounded-lg bg-sky-100 px-4 py-2 text-sky-700 hover:bg-sky-200"
          >
            กลับหน้าคำสั่งซื้อ
          </button>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-6 border-b pb-4">
            <p className="text-sm text-gray-500">เลขคำสั่งซื้อ</p>
            <h2 className="text-xl font-bold text-gray-800">{order?.order_number}</h2>
            <p className="mt-2 text-sm text-gray-500">
              ยอดที่ต้องชำระ: ฿{Number(order?.total_amount || 0).toFixed(2)}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              สถานะการชำระเงิน: {order?.payment_status}
            </p>
          </div>

          <form onSubmit={handleUploadSlip}>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                เลือกรูปสลิป
              </label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleFileChange}
                className="block w-full rounded-lg border p-3 text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-100 file:px-4 file:py-2 file:text-sky-700 hover:file:bg-sky-200"
              />
              <p className="mt-2 text-xs text-gray-500">
                รองรับไฟล์ png, jpg, jpeg, webp ขนาดไม่เกิน 5 MB
              </p>
            </div>

            {previewUrl && (
              <div className="mb-4">
                <p className="mb-2 text-sm font-medium text-gray-700">ตัวอย่างรูป</p>
                <img
                  src={previewUrl}
                  alt="Slip Preview"
                  className="max-h-96 rounded-xl border object-contain"
                />
              </div>
            )}

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                หมายเหตุ (ไม่บังคับ)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows="3"
                className="w-full rounded-lg border p-3 outline-none focus:border-sky-400"
                placeholder="เช่น โอนจากบัญชีธนาคาร... เวลา..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-sky-400 py-3 font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-sky-200"
            >
              {submitting ? 'กำลังอัปโหลด...' : 'ยืนยันการอัปโหลดสลิป'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default UploadSlip