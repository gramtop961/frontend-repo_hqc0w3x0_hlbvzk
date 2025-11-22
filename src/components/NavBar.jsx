import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Workflow, PackageSearch, Boxes, History, Settings, ChevronDown } from 'lucide-react'

const menu = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Operations', href: '/operations/receipts', icon: Workflow },
  { name: 'Products', href: '/products', icon: PackageSearch },
  { name: 'Stock', href: '/stock', icon: Boxes },
  { name: 'Move History', href: '/moves', icon: History },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function NavBar() {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const active = (href) => location.pathname.startsWith(href)
  const user = JSON.parse(localStorage.getItem('user') || '{"name":"Demo User","avatar_url":"https://i.pravatar.cc/100"}')

  return (
    <div className="sticky top-0 z-40 w-full backdrop-blur supports-[backdrop-filter]:bg-slate-900/60 border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-6">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 shadow-lg shadow-cyan-500/20" />
          <span className="text-white/90 font-semibold tracking-tight">Invex</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {menu.map((m) => (
            <Link
              key={m.name}
              to={m.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${active(m.href) ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
            >
              <m.icon size={16} /> {m.name}
            </Link>
          ))}
        </nav>
        <div className="ml-auto relative">
          <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition">
            <img src={user.avatar_url} alt="avatar" className="w-7 h-7 rounded-full" />
            <span className="hidden sm:block text-sm">{user.name}</span>
            <ChevronDown size={16} />
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-40 rounded-xl bg-slate-800/90 border border-white/10 shadow-xl animate-in">
              <Link to="/profile" className="block px-3 py-2 text-sm text-white/80 hover:bg-white/5 rounded-t-xl">My Profile</Link>
              <button
                onClick={() => { localStorage.removeItem('token'); window.location.href = '/login' }}
                className="w-full text-left px-3 py-2 text-sm text-rose-300 hover:bg-white/5 rounded-b-xl"
              >Logout</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
