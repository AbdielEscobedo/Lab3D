import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import CalendarView from './components/CalendarView'
import AdminReservations from './components/AdminReservations'
import AdminStats from './components/AdminStats'
import Login from './pages/Login'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  return user ? children : <Navigate to="/login" />
}

function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  return isAdmin ? children : <Navigate to="/" />
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <CalendarView />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/reservas"
          element={
            <AdminRoute>
              <div className="p-4 md:p-6">
                <AdminReservations />
              </div>
            </AdminRoute>
          }
        />
        <Route
          path="/stats"
          element={
            <AdminRoute>
              <div className="p-4 md:p-6">
                <AdminStats />
              </div>
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
