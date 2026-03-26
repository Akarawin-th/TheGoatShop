import { Link } from 'react-router-dom'
import { Search, ShoppingCart, User, Ticket, LogOut, PlusSquare, Package } from 'lucide-react'

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

          {(user?.role === 'seller' || user?.role === 'admin') && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                to="/seller/add-product"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-sky-700 shadow hover:bg-sky-50"
              >
                <PlusSquare size={16} />
                เพิ่มสินค้า
              </Link>

              <Link
                to="/seller/my-products"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-sky-700 shadow hover:bg-sky-50"
              >
                <Package size={16} />
                สินค้าของฉัน
              </Link>
            </div>
          )}
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

          <div className="flex items-center gap-2">
            <Link to="/profile" className="flex items-center gap-2">
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
            </Link>

            <button
              onClick={onLogout}
              className="rounded-full bg-white p-2 shadow transition hover:bg-red-50"
              title="Logout"
            >
              <LogOut size={18} className="text-red-500" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header