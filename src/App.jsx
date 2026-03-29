import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'
import AddProduct from './pages/AddProduct'
import MyProducts from './pages/MyProducts'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import UploadSlip from './pages/UploadSlip'
import SellerDashboard from './pages/SellerDashboard'
import SellerOrders from './pages/SellerOrders'
import OrderDetail from './pages/OrderDetail'
import EditProduct from './pages/EditProduct'
import SellerCoupons from './pages/SellerCoupons'
import AdminDashboard from './pages/AdminDashboard'
import ComingSoon from './pages/ComingSoon'
import Coupons from './pages/Coupons'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/seller/add-product" element={<AddProduct />} />
        <Route path="/seller/my-products" element={<MyProducts />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/coupons" element={<Coupons />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:orderId/upload-slip" element={<UploadSlip />} />
        <Route path="/seller" element={<SellerDashboard />} />
        <Route path="/seller/orders" element={<SellerOrders />} />
        <Route path="/orders/:orderId" element={<OrderDetail />} />
        <Route path="/seller/edit-product/:productId" element={<EditProduct />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/seller/coupons" element={<SellerCoupons />} />
        <Route path="/coming-soon" element={<ComingSoon />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App