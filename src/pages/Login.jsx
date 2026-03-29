import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Swal from 'sweetalert2'
import { Eye, EyeOff } from 'lucide-react'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const showSuccessToast = (title) => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title,
      showConfirmButton: false,
      timer: 1800,
      timerProgressBar: true,
    })
  }

  const showErrorPopup = (text) => {
    Swal.fire({
      title: 'เข้าสู่ระบบไม่สำเร็จ',
      text,
      icon: 'error',
      confirmButtonText: 'ปิด',
      confirmButtonColor: '#ef4444',
    })
  }

  const showWarningPopup = (text) => {
    Swal.fire({
      title: 'กรอกข้อมูลไม่ถูกต้อง',
      text,
      icon: 'warning',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#38bdf8',
    })
  }

  const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    if (!trimmedEmail && !trimmedPassword) {
      showWarningPopup('กรุณากรอก Email และ Password')
      return
    }

    if (!trimmedEmail) {
      showWarningPopup('กรุณากรอก Email')
      return
    }

    if (!isValidEmail(trimmedEmail)) {
      showWarningPopup('รูปแบบ Email ไม่ถูกต้อง')
      return
    }

    if (!trimmedPassword) {
      showWarningPopup('กรุณากรอก Password')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: trimmedPassword,
    })

    setLoading(false)

    if (error) {
      showErrorPopup('อีเมลหรือรหัสผ่านผิด')
      return
    }

    showSuccessToast('เข้าสู่ระบบสำเร็จ 🎉')

    setTimeout(() => {
      navigate('/home')
    }, 900)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow"
      >
        <h1 className="mb-2 text-2xl font-bold text-gray-800">Login</h1>
        <p className="mb-6 text-sm text-gray-500">
          เข้าสู่ระบบเพื่อใช้งานบัญชีของคุณ
        </p>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            placeholder="example@email.com"
            className="w-full rounded-lg border p-3 outline-none focus:border-sky-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div className="relative mb-2">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="กรอกรหัสผ่าน"
            className="w-full rounded-lg border p-3 pr-12 outline-none focus:border-sky-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-[44px] text-gray-500 hover:text-sky-500"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="mb-4 text-right">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-sky-500 hover:underline"
          >
            ลืมรหัสผ่าน?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer w-full rounded-lg bg-sky-400 py-3 font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-sky-200"
        >
          {loading ? 'กำลังเข้าสู่ระบบ...' : 'Login'}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          ยังไม่มีบัญชี?{' '}
          <Link
            to="/register"
            className="font-medium text-sky-500 hover:underline"
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  )
}

export default Login