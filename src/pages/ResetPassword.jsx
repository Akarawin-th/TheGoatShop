import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Eye, EyeOff, XCircle, CheckCircle2 } from 'lucide-react'

export default function ResetPassword() {
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    const init = async () => {
      setError('')
      setSessionReady(false)

      const { data, error } = await supabase.auth.getSession()

      if (error) {
        setError('ไม่สามารถตรวจสอบ session ได้')
        return
      }

      if (data.session) {
        setSessionReady(true)
      } else {
        setError('ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุ')
      }
    }

    init()
  }, [])

  const passwordRules = useMemo(() => {
    return {
      minLength: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }
  }, [password])

  const isPasswordValid =
    passwordRules.minLength &&
    passwordRules.uppercase &&
    passwordRules.number &&
    passwordRules.special

  const isConfirmMatched =
    confirmPassword.length > 0 && password === confirmPassword

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    const trimmedPassword = password.trim()
    const trimmedConfirmPassword = confirmPassword.trim()

    if (!trimmedPassword || !trimmedConfirmPassword) {
      setError('กรุณากรอกรหัสผ่านให้ครบ')
      return
    }

    if (!isPasswordValid) {
      setError('รหัสผ่านยังไม่ผ่านเงื่อนไขความปลอดภัย')
      return
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setError('ยืนยันรหัสผ่านไม่ตรงกัน')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: trimmedPassword,
      })

      if (error) throw error

      setMessage('เปลี่ยนรหัสผ่านสำเร็จ กำลังพาไปหน้าเข้าสู่ระบบ...')

      await supabase.auth.signOut()

      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน')
    } finally {
      setLoading(false)
    }
  }

  const RuleItem = ({ passed, text }) => (
    <div className="flex items-center gap-2 text-sm">
      {passed ? (
        <CheckCircle2 size={18} className="text-green-600" />
      ) : (
        <XCircle size={18} className="text-red-500" />
      )}
      <span className={passed ? 'text-green-700' : 'text-gray-600'}>
        {text}
      </span>
    </div>
  )

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow"
      >
        <h1 className="mb-2 text-2xl font-bold text-gray-800">
          ตั้งรหัสผ่านใหม่
        </h1>

        {!sessionReady && !error && (
          <p className="text-sm text-gray-500">กำลังตรวจสอบลิงก์...</p>
        )}

        {sessionReady && (
          <>
            {/* password */}
            <div className="relative mb-4">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="รหัสผ่านใหม่"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border p-3 pr-12 outline-none focus:border-sky-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* rules */}
            <div className="mb-4 rounded-xl bg-blue-50 p-4">
              <p className="mb-2 font-semibold text-gray-700">
                เงื่อนไขรหัสผ่าน
              </p>
              <RuleItem passed={passwordRules.minLength} text="อย่างน้อย 6 ตัวอักษร" />
              <RuleItem passed={passwordRules.uppercase} text="มีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว" />
              <RuleItem passed={passwordRules.number} text="มีตัวเลขอย่างน้อย 1 ตัว" />
              <RuleItem passed={passwordRules.special} text="มีอักขระพิเศษอย่างน้อย 1 ตัว" />
            </div>

            {/* confirm */}
            <div className="relative mb-2">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="ยืนยันรหัสผ่านใหม่"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border p-3 pr-12 outline-none focus:border-sky-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {confirmPassword.length > 0 && (
              <p className={`text-sm ${isConfirmMatched ? 'text-green-600' : 'text-red-500'}`}>
                {isConfirmMatched ? 'รหัสผ่านตรงกัน' : 'รหัสผ่านไม่ตรงกัน'}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-lg bg-sky-400 py-3 font-semibold text-white transition hover:bg-sky-500 disabled:bg-sky-200"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
            </button>
          </>
        )}

        {message && (
          <p className="mt-4 text-sm text-green-600">{message}</p>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-500">{error}</p>
        )}

        <p className="mt-4 text-center text-sm text-gray-600">
          <Link
            to="/login"
            className="font-medium text-sky-500 hover:underline"
          >
            กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </p>
      </form>
    </div>
  )
}