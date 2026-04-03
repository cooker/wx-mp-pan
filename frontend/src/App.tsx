import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SiteConfigProvider } from '@/context/SiteConfigContext'
import HomePage from '@/pages/HomePage'
import AdminLoginPage from '@/pages/AdminLoginPage'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'

export default function App() {
  return (
    <SiteConfigProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SiteConfigProvider>
  )
}
