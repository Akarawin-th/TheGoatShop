import { Navigate } from 'react-router-dom'

function ProtectedRoute({ user, profile, allowedRoles = [], children }) {
  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!profile) {
    return <div className="p-6">Loading...</div>
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/home" replace />
  }

  return children
}

export default ProtectedRoute 