import { useNavigate } from 'react-router-dom'

function ComingSoon() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-10 text-center shadow">
        <h1 className="text-3xl font-bold text-gray-800">
          ตอนนี้ยังไม่มีสินค้า
        </h1>
        <p className="mt-3 text-gray-500">
          สินค้าในหมวด Flash Sale ยังไม่พร้อมแสดงในขณะนี้
        </p>

        <button
          onClick={() => navigate('/home')}
          className="mt-6 rounded-lg bg-sky-400 px-6 py-3 font-semibold text-white transition hover:bg-sky-500"
        >
          กลับ Home
        </button>
      </div>
    </div>
  )
}

export default ComingSoon