import { Navigate } from 'react-router-dom'
<<<<<<< HEAD
import { useAuth } from '../../contexts/AuthContext'
import Loader from '../ui/Loader'

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth()
  if (loading) return <Loader full label="Preparing your workspace..." />
  if (!currentUser) return <Navigate to="/login" replace />
=======
import { useAuthStore } from '@/store/useAuthStore'

export default function ProtectedRoute({ children }) {
  const { user, initialized, isLocalMode } = useAuthStore()
  if (isLocalMode) return children
  if (!initialized) return null
  if (!user) return <Navigate to="/login" replace />
>>>>>>> b4b2ee123dad43c2655a52eab73876263db4f19f
  return children
}
