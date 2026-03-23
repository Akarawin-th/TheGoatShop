import { Link } from 'react-router-dom'
import { Search, ShoppingCart, User, Ticket } from 'lucide-react'

function Header({ logo, user, searchTerm, setSearchTerm, onLogout }) {
  return (
    <header className="bg-[#bfe9ff] text-gray-800 shadow">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-5">
        <Link to="/home" className="flex min-w-fit items-center">
          <img
            src={logo}
            alt="TheGoatShop Logo"
            className="h-20 object-contain"
          />
        </Link>

        <div className="flex-1">
          <div className="flex overflow-hidden rounded-md bg-white shadow">
            <input
              type="text"
              placeholder="ค้นหาสินค้า, หมวดหมู่, โปรโมชั่น..."
              className="w-full px-4 py-3 text-sm text-gray-800 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="flex items-center justify-center bg-sky-400 px-5 text-white transition hover:bg-sky-500">
              <Search size={20} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <button className="relative">
            <Ticket size={26} className="text-sky-700" />
          </button>

          <button className="relative">
            <ShoppingCart size={28} className="text-sky-700" />
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
              2
            </span>
          </button>

          <button onClick={onLogout} className="flex items-center gap-2">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt="Profile"
                className="h-10 w-10 rounded-full border-2 border-white object-cover shadow"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow">
                <User size={22} className="text-sky-700" />
              </div>
            )}

            <span className="max-w-[140px] truncate text-sm font-medium text-sky-800">
              {user?.username || user?.email || 'Profile'}
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header