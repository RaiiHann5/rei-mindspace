import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useLanguage } from '../../contexts/LanguageContext'

function resolveTitleKey(pathname) {
  const MAP = {
    '/app': 'overview',
    '/app/invoices': 'invoices',
    '/app/invoices/new': 'createInvoice',
    '/app/clients': 'clients',
    '/app/contracts': 'contracts',
    '/app/contracts/new': 'createContract',
    '/app/settings': 'settings',
    '/app/profile': 'profile',
  }
  if (MAP[pathname]) return MAP[pathname]
  if (pathname.startsWith('/app/invoices/')) return 'invoiceDetail'
  if (pathname.startsWith('/app/contracts/')) return 'contractDetail'
  return 'dashboard'
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { t } = useLanguage()

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={t(`titles.${resolveTitleKey(location.pathname)}`)} />
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
