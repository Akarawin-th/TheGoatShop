import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Swal from 'sweetalert2'

function Profile() {
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const navigate = useNavigate()

  const showSuccessToast = (title) => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
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

  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        navigate('/login')
        return
      }

      setUser(user)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        showErrorPopup(error.message)
        setLoading(false)
        return
      }

      setUsername(data?.username || '')
      setFullName(data?.full_name || '')
      setPhone(data?.phone || '')
      setAddress(data?.address || '')
      setAvatarUrl(data?.avatar_url || '')
      setLoading(false)
    }

    getProfile()
  }, [navigate])

  const handleUploadAvatar = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      showErrorPopup('กรุณาอัปโหลดไฟล์รูปภาพ png, jpg, jpeg หรือ webp')
      return
    }

    setUploading(true)

    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        upsert: true,
      })

    if (uploadError) {
      setUploading(false)
      showErrorPopup(uploadError.message)
      return
    }

    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    const newAvatarUrl = publicUrlData.publicUrl

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: newAvatarUrl })
      .eq('id', user.id)

    setUploading(false)

    if (updateError) {
      showErrorPopup(updateError.message)
      return
    }

    setAvatarUrl(newAvatarUrl)
    showSuccessToast('อัปโหลดรูปโปรไฟล์สำเร็จ')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        username,
        full_name: fullName,
        phone,
        address,
      })
      .eq('id', user.id)

    setSaving(false)

    if (error) {
      showErrorPopup(error.message)
      return
    }

    showSuccessToast('บันทึกข้อมูลเรียบร้อยแล้ว')
    setTimeout(() => {
      navigate('/home')
    }, 1200)
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
          <button
            onClick={() => navigate('/home')}
            className="rounded-lg bg-sky-100 px-4 py-2 text-sky-700 hover:bg-sky-200"
          >
            กลับหน้า Home
          </button>
        </div>

        <div className="mb-6 flex flex-col items-center gap-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="h-24 w-24 rounded-full border-4 border-sky-100 object-cover shadow"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-sky-100 text-sky-500 shadow">
              <span className="text-3xl font-bold">
                {username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          )}

          <label className="cursor-pointer rounded-lg bg-sky-400 px-4 py-2 text-white hover:bg-sky-500">
            {uploading ? 'Uploading...' : 'เปลี่ยนรูปโปรไฟล์'}
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={handleUploadAvatar}
              disabled={uploading}
            />
          </label>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full rounded-lg border bg-gray-100 p-3 text-gray-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border p-3 outline-none focus:border-sky-400"
              placeholder="กรอกชื่อผู้ใช้"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border p-3 outline-none focus:border-sky-400"
              placeholder="กรอกชื่อ-นามสกุล"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border p-3 outline-none focus:border-sky-400"
              placeholder="กรอกเบอร์โทร"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows="4"
              className="w-full rounded-lg border p-3 outline-none focus:border-sky-400"
              placeholder="กรอกที่อยู่จัดส่ง"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-sky-400 py-3 font-semibold text-white hover:bg-sky-500 disabled:bg-sky-200"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Profile