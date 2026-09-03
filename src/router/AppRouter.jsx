import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import DashboardLayout from '../components/layout/DashboardLayout'

import Landing from '../pages/public/Landing'
import Login from '../pages/public/Login'
import Register from '../pages/public/Register'
import PublicInvoice from '../pages/public/PublicInvoice'
import NotFound from '../pages/NotFound'

import DashboardOverview from '../pages/dashboard/DashboardOverview'
import Invoices from '../pages/dashboard/Invoices'
import CreateInvoice from '../pages/dashboard/CreateInvoice'
import InvoiceDetail from '../pages/dashboard/InvoiceDetail'
import Clients from '../pages/dashboard/Clients'
import Contracts from '../pages/dashboard/Contracts'
import CreateContract from '../pages/dashboard/CreateContract'
import ContractDetail from '../pages/dashboard/ContractDetail'
import Settings from '../pages/dashboard/Settings'
import Profile from '../pages/dashboard/Profile'

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/invoice/:publicId" element={<PublicInvoice />} />

      {/* Dashboard (protected) */}
      <Route
        path="/app"
        element={(
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        )}
      >
        <Route index element={<DashboardOverview />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="invoices/new" element={<CreateInvoice />} />
        <Route path="invoices/:id" element={<InvoiceDetail />} />
        <Route path="clients" element={<Clients />} />
        <Route path="contracts" element={<Contracts />} />
        <Route path="contracts/new" element={<CreateContract />} />
        <Route path="contracts/:id" element={<ContractDetail />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
