import { useEffect, useState } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/router'
import Link from 'next/link'

const sampleFuel = [
  { day: 'Mon', cost: 320 },
  { day: 'Tue', cost: 280 },
  { day: 'Wed', cost: 360 },
  { day: 'Thu', cost: 420 },
  { day: 'Fri', cost: 390 },
]

export default function Dashboard() {
  const router = useRouter()
  const { user } = useAuth()
  const [stats, setStats] = useState({ vehicles: { total:0, available:0, inShop:0, onTrip:0 }, drivers: { total:0, onTrip:0 }, trips: { total:0, dispatched:0, draft:0 }, maintenance: { total:0, active:0 }, fuel: { totalCost:0, totalLiters:0 }, expenses: { totalCost:0 }, utilization: 0, alerts: { overdueMaintenance: 0, recentSpend: 0, highSpend: false } })

  useEffect(() => {
    if (!user) {
      router.replace('/login')
      return
    }

    async function load() {
      try {
        const res = await api.get('/dashboard/stats')
        setStats(res.data)
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [user, router])

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-4">
        <div className="card bg-amber-950/90 border border-amber-500/20 text-white col-span-full md:col-span-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-amber-300">Alerts</div>
              <div className="text-lg font-semibold">Fleet notifications</div>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              {stats.alerts.overdueMaintenance > 0 && (
                <Link href="/maintenance" className="rounded-full bg-red-600/95 px-3 py-1.5 font-semibold text-white hover:bg-red-500 transition">⚠️ {stats.alerts.overdueMaintenance} overdue</Link>
              )}
              {stats.alerts.highSpend ? (
                <Link href="/expenses" className="rounded-full bg-orange-600/95 px-3 py-1.5 font-semibold text-white hover:bg-orange-500 transition">💸 ${stats.alerts.recentSpend.toFixed(0)}</Link>
              ) : (
                <span className="rounded-full bg-slate-700/90 px-3 py-1.5 font-semibold text-slate-200">✅ ${stats.alerts.recentSpend.toFixed(0)}</span>
              )}
              <Link href="/maintenance" className="rounded-full border border-white/15 px-3 py-1.5 text-slate-200 hover:bg-white/5 transition">View all alerts</Link>
            </div>
          </div>
        </div>
        <div className="card bg-slate-950/80 border border-white/10 text-white">
          <div className="text-sm text-slate-400">Vehicles (Available)</div>
          <div className="text-4xl font-semibold mt-4">{stats.vehicles.available}</div>
          <div className="text-sm text-slate-400 mt-2">Total: {stats.vehicles.total}</div>
        </div>
        <div className="card bg-slate-950/80 border border-white/10 text-white">
          <div className="text-sm text-slate-400">Drivers (On Duty)</div>
          <div className="text-4xl font-semibold mt-4">{stats.drivers.onTrip}</div>
          <div className="text-sm text-slate-400 mt-2">Total: {stats.drivers.total}</div>
        </div>
        <div className="card bg-slate-950/80 border border-white/10 text-white">
          <div className="text-sm text-slate-400">Trips (Dispatched)</div>
          <div className="text-4xl font-semibold mt-4">{stats.trips.dispatched}</div>
          <div className="text-sm text-slate-400 mt-2">Drafts: {stats.trips.draft}</div>
        </div>
        <div className="card bg-slate-950/80 border border-white/10 text-white">
          <div className="text-sm text-slate-400">Maintenance (In Progress)</div>
          <div className="text-4xl font-semibold mt-4">{stats.maintenance.active}</div>
          <div className="text-sm text-slate-400 mt-2">Total: {stats.maintenance.total}</div>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="card bg-slate-950/80 border border-white/10 text-white">
          <div className="text-sm text-slate-400">Fuel spend</div>
          <div className="text-4xl font-semibold mt-4">${stats.fuel.totalCost.toFixed(2)}</div>
          <div className="text-sm text-slate-400 mt-2">Liters: {stats.fuel.totalLiters}</div>
        </div>
        <div className="card bg-slate-950/80 border border-white/10 text-white">
          <div className="text-sm text-slate-400">Expense total</div>
          <div className="text-4xl font-semibold mt-4">${stats.expenses.totalCost.toFixed(2)}</div>
          <div className="text-sm text-slate-400 mt-2">Operations cost</div>
        </div>
        <div className="card bg-slate-950/80 border border-white/10 text-white">
          <div className="text-sm text-slate-400">Fleet utilization</div>
          <div className="text-4xl font-semibold mt-4">{stats.utilization}%</div>
          <div className="text-sm text-slate-400 mt-2">Vehicles on trip</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr] items-start">
        <div className="card bg-slate-950/85 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Fuel trends</div>
              <div className="text-xl font-semibold text-white">Cost efficiency</div>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sampleFuel}>
                <defs>
                  <linearGradient id="fuelGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <Tooltip contentStyle={{ background: '#0f172a', border: 'none', color: '#fff' }} />
                <Area type="monotone" dataKey="cost" stroke="#38bdf8" fill="url(#fuelGradient)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card p-4">
            <div className="text-sm uppercase tracking-[0.18em] text-slate-500 mb-3">Quick Links</div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
              {[
                { href: '/vehicles', label: 'Vehicles' },
                { href: '/drivers', label: 'Drivers' },
                { href: '/trips', label: 'Trips' },
                { href: '/maintenance', label: 'Maintenance' },
                { href: '/fuel', label: 'Fuel' },
                { href: '/expenses', label: 'Expenses' },
              ].map(link => (
                <Link key={link.href} href={link.href} className="block rounded-2xl bg-slate-900/60 px-3 py-2 text-sm text-white hover:bg-slate-900/80">{link.label}</Link>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <div className="text-sm uppercase tracking-[0.18em] text-slate-500 mb-3">Shortcuts</div>
            <div className="space-y-2">
              <Link href="/trips" className="w-full btn bg-gradient-to-r from-cyan-500 to-blue-600">New Trip</Link>
              <Link href="/reports" className="w-full btn border">Reports</Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
