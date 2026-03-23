import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    navigate('/home')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow"
      >
        <h1 className="mb-6 text-2xl font-bold text-gray-800">Login</h1>

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
          className="w-full rounded-lg bg-sky-400 py-3 font-semibold text-white hover:bg-sky-500"
        >
          {loading ? 'Loading...' : 'Login'}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          ยังไม่มีบัญชี?{' '}
          <Link to="/register" className="font-medium text-sky-500 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  )
}

export default Login