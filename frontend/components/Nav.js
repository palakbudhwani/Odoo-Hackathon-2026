import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/vehicles', label: 'Vehicles' },
  { href: '/drivers', label: 'Drivers' },
  { href: '/trips', label: 'Trips' },
  { href: '/maintenance', label: 'Maintenance' },
  { href: '/fuel', label: 'Fuel' },
  { href: '/expenses', label: 'Expenses' },
]

export default function Nav(){
  const { user, logout } = useAuth()
  const router = useRouter()

  return (
    <aside className="w-72 min-h-screen border-r border-white/10 bg-slate-950/80 backdrop-blur-xl text-slate-100 hidden md:flex flex-col">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-900 font-bold shadow-lg shadow-cyan-500/20">TO</div>
          <div>
            <div className="text-xl font-semibold">TransitOps</div>
            <div className="text-sm text-slate-400">Fleet Platform</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(i => (
          <Link key={i.href} href={i.href} className={`block rounded-2xl px-4 py-3 transition ${router.pathname === i.href ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-900/80'}`}>
            {i.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        {user ? (
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-[0.25em] text-slate-500">Signed in as</div>
            <div className="text-sm font-medium text-white">{user.name}</div>
            <button onClick={() => { logout(); router.push('/login') }} className="w-full rounded-2xl px-4 py-2 bg-slate-800 text-slate-100 hover:bg-slate-700">Log out</button>
          </div>
        ) : (
          <div className="space-y-2">
            <Link href="/login" className="block rounded-2xl px-4 py-3 bg-cyan-500 text-slate-900 text-center font-semibold">Sign in</Link>
            <Link href="/register" className="block rounded-2xl px-4 py-3 border border-white/10 text-slate-200 text-center">Register</Link>
          </div>
        )}
      </div>
    </aside>
  )
}
