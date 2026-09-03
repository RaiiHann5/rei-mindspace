import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Loader from '../ui/Loader'

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth()
  if (loading) return <Loader full label="Preparing your workspace..." />
  if (!currentUser) return <Navigate to="/login" replace />
  return children
}
