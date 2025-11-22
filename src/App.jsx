import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Spline from '@splinetool/react-spline'
import NavBar from './components/NavBar'
import Dashboard from './components/Dashboard'
import ProductsStock from './components/ProductsStock'
import MoveHistory from './components/MoveHistory'
import { Login, Signup, Forgot } from './components/Auth'
import { ReceiptsList, DeliveriesList, ReceiptDetail, DeliveryDetail } from './components/Operations'

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="fixed inset-0 opacity-50 pointer-events-none">
        <Spline scene="https://prod.spline.design/41MGRk-UDPKO-l6W/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.04)_1px),linear-gradient(to_bottom,transparent,rgba(255,255,255,0.04)_1px)] bg-[size:24px_24px] pointer-events-none" />
      <NavBar />
      <main className="relative z-10">{children}</main>
    </div>
  )
}

function OperationsPage({ type }) {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const ref = params.get('ref')
  const close = () => window.history.pushState({}, '', window.location.pathname)
  return (
    <Shell>
      <div className="px-4 md:px-6 py-8 max-w-7xl mx-auto">
        {type==='receipts' ? <ReceiptsList onOpen={(o) => window.location.search = `?ref=${o.reference||''}`} /> : <DeliveriesList onOpen={(o) => window.location.search = `?ref=${o.reference||''}`} />}
      </div>
      {ref && (type==='receipts' ? <ReceiptDetail reference={ref} close={close} /> : <DeliveryDetail reference={ref} close={close} />)}
    </Shell>
  )
}

function Protected({ children }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  useEffect(() => { fetch((import.meta.env.VITE_BACKEND_URL||'http://localhost:8000')+'/seed', { method: 'POST' }) }, [])
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot" element={<Forgot />} />

      <Route path="/dashboard" element={<Protected><Shell><Dashboard /></Shell></Protected>} />
      <Route path="/operations/receipts" element={<Protected><OperationsPage type="receipts" /></Protected>} />
      <Route path="/operations/deliveries" element={<Protected><OperationsPage type="deliveries" /></Protected>} />
      <Route path="/products" element={<Protected><Shell><ProductsStock /></Shell></Protected>} />
      <Route path="/stock" element={<Protected><Shell><ProductsStock /></Shell></Protected>} />
      <Route path="/moves" element={<Protected><Shell><MoveHistory /></Shell></Protected>} />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
