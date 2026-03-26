import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Swal from 'sweetalert2'
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'

function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const showSuccessPopup = (text) => {
    Swal.fire({
      title: 'สมัครสำเร็จ',
      text,
      icon: 'success',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#38bdf8',
    })
  }

  const showErrorPopup = (text) => {
    Swal.fire({
      title: 'สมัครไม่สำเร็จ',
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

  const isValidUsername = (value) => {
    return /^[a-zA-Z0-9_]{3,20}$/.test(value)
  }

  const hasMinLength = password.length >= 6
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password)

  const passedRules = [
    hasMinLength,
    hasUppercase,
    hasNumber,
    hasSpecialChar,
  ].filter(Boolean).length

  const getPasswordStrength = () => {
    if (!password) {
      return {
        width: '0%',
        color: 'bg-gray-200',
        text: '',
        textColor: 'text-gray-400',
      }
    }

    if (passedRules <= 1) {
      return {
        width: '25%',
        color: 'bg-red-500',
        text: 'Weak',
        textColor: 'text-red-500',
      }
    }

    if (passedRules <= 3) {
      return {
        width: '70%',
        color: 'bg-yellow-400',
        text: 'Medium',
        textColor: 'text-yellow-500',
      }
    }

    return {
      width: '100%',
      color: 'bg-green-500',
      text: 'Strong',
      textColor: 'text-green-600',
    }
  }

  const passwordStrength = getPasswordStrength()

  const handleRegister = async (e) => {
    e.preventDefault()

    const trimmedUsername = username.trim()
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()
    const trimmedConfirmPassword = confirmPassword.trim()

    if (!trimmedUsername && !trimmedEmail && !trimmedPassword && !trimmedConfirmPassword) {
      showWarningPopup('กรุณากรอกข้อมูลให้ครบ')
      return
    }

    if (!trimmedUsername) {
      showWarningPopup('กรุณากรอก Username')
      return
    }

    if (!isValidUsername(trimmedUsername)) {
      showWarningPopup('Username ต้องมี 3-20 ตัว และใช้ได้เฉพาะ a-z, A-Z, 0-9 หรือ _')
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

    if (!hasMinLength || !hasUppercase || !hasNumber || !hasSpecialChar) {
      showWarningPopup('Password ยังไม่ผ่านเงื่อนไขความปลอดภัย')
      return
    }

    if (!trimmedConfirmPassword) {
      showWarningPopup('กรุณากรอก Confirm Password')
      return
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      showWarningPopup('Password และ Confirm Password ไม่ตรงกัน')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password: trimmedPassword,
      options: {
        data: {
          username: trimmedUsername,
        },
      },
    })

    setLoading(false)

    if (error) {
      showErrorPopup(error.message)
      return
    }

    await showSuccessPopup('กรุณาเช็กอีเมลเพื่อยืนยันบัญชีก่อนเข้าสู่ระบบ')
    navigate('/login')
  }

  const RuleItem = ({ passed, text }) => (
    <div className="flex items-center gap-2 text-sm">
      {passed ? (
        <CheckCircle size={16} className="text-green-500" />
      ) : (
        <XCircle size={16} className="text-red-400" />
      )}
      <span className={passed ? 'text-green-600' : 'text-gray-500'}>
        {text}
      </span>
    </div>
  )

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-4 py-8">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow"
      >
        <h1 className="mb-2 text-2xl font-bold text-gray-800">Register</h1>
        <p className="mb-6 text-sm text-gray-500">
          สร้างบัญชีใหม่เพื่อเริ่มใช้งานระบบ
        </p>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            placeholder="เช่น doublehotdog"
            className="w-full rounded-lg border p-3 outline-none focus:border-sky-400"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>

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

        <div className="relative mb-3">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="ตั้งรหัสผ่าน"
            className="w-full rounded-lg border p-3 pr-12 outline-none focus:border-sky-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-[44px] text-gray-500 hover:text-sky-500"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="mb-2">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-600">ความปลอดภัยของรหัสผ่าน</span>
            <span className={`text-sm font-semibold ${passwordStrength.textColor}`}>
              {passwordStrength.text}
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full transition-all duration-300 ${passwordStrength.color}`}
              style={{ width: passwordStrength.width }}
            />
          </div>
        </div>

        <div className="mb-4 rounded-xl bg-sky-50 p-4">
          <p className="mb-3 text-sm font-semibold text-gray-700">
            เงื่อนไขรหัสผ่าน
          </p>

          <div className="space-y-2">
            <RuleItem passed={hasMinLength} text="อย่างน้อย 6 ตัวอักษร" />
            <RuleItem passed={hasUppercase} text="มีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว" />
            <RuleItem passed={hasNumber} text="มีตัวเลขอย่างน้อย 1 ตัว" />
            <RuleItem passed={hasSpecialChar} text="มีอักขระพิเศษอย่างน้อย 1 ตัว" />
          </div>
        </div>

        <div className="relative mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="ยืนยันรหัสผ่าน"
            className="w-full rounded-lg border p-3 pr-12 outline-none focus:border-sky-400"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />

          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-3 top-[44px] text-gray-500 hover:text-sky-500"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {confirmPassword && (
          <p
            className={`mb-4 text-sm font-medium ${
              password === confirmPassword ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {password === confirmPassword
              ? 'รหัสผ่านตรงกัน'
              : 'รหัสผ่านไม่ตรงกัน'}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-sky-400 py-3 font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-sky-200"
        >
          {loading ? 'กำลังสมัครสมาชิก...' : 'Register'}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          มีบัญชีแล้ว?{' '}
          <Link
            to="/login"
            className="font-medium text-sky-500 hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  )
}

export default Register