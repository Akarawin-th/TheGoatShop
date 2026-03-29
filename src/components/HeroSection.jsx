import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function HeroSection({
  banners,
  currentBanner,
  setCurrentBanner,
  nextBanner,
  prevBanner,
}) {
  const navigate = useNavigate()

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl bg-white shadow lg:col-span-2">
          <img
            src={banners[currentBanner]}
            alt="Main Banner"
            className="block h-[340px] w-full object-cover"
          />

          <button
            onClick={prevBanner}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white"
          >
            <ChevronLeft />
          </button>

          <button
            onClick={nextBanner}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white"
          >
            <ChevronRight />
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`h-2.5 w-2.5 rounded-full ${
                  currentBanner === index ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-2xl bg-gradient-to-r from-sky-400 to-blue-300 p-6 text-white shadow">
            <p className="text-sm">Flash Sale</p>
            <h2 className="mt-2 text-2xl font-extrabold">ลดสูงสุด 50%</h2>
            <p className="mt-2 text-sm text-sky-50">
              โปรพิเศษเฉพาะวันนี้ รีบช้อปก่อนหมดเวลา
            </p>
            <button
              onClick={() => navigate('/coming-soon')}
              className="mt-4 rounded-full bg-white px-5 py-2 font-semibold text-sky-500 transition hover:bg-sky-50"
            >
              ดูสินค้า
            </button>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-cyan-300 to-sky-300 p-6 text-white shadow">
            <p className="text-sm">คูปองพิเศษ</p>
            <h2 className="mt-2 text-2xl font-extrabold">โค้ด DINOGANG</h2>
            <p className="mt-2 text-sm text-cyan-50">
              รับส่วนลดทันทีเมื่อสั่งซื้อครบตามเงื่อนไข
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection