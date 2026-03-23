import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()

    if (!username.trim()) {
      alert('กรุณากรอก Username')
      return
    }

    if (!email.trim()) {
      alert('กรุณากรอก Email')
      return
    }

    if (!password.trim()) {
      alert('กรุณากรอก Password')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.trim(),
        },
      },
    })

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    alert('สมัครสำเร็จ กรุณาเช็กอีเมลเพื่อยืนยันบัญชี')
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-4">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow"
      >
        <h1 className="mb-6 text-2xl font-bold text-gray-800">Register</h1>

        <input
          type="text"
          placeholder="Username"
          className="mb-4 w-full rounded-lg border p-3 outline-none focus:border-sky-400"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="mb-4 w-full rounded-lg border p-3 outline-none focus:border-sky-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="mb-4 w-full rounded-lg border p-3 outline-none focus:border-sky-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-sky-400 py-3 font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-sky-200"
        >
          {loading ? 'Loading...' : 'Register'}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          มีบัญชีแล้ว?{' '}
          <Link to="/login" className="font-medium text-sky-500 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  )
}

export default Register