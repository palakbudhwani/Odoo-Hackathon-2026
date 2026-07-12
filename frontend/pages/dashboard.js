import { useEffect, useState } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/router'

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
  const [stats, setStats] = useState({ vehicles: 0, drivers: 0, trips: 0 })

  useEffect(() => {
    if (!user) {
      router.replace('/login')
      return
    }

    async function load() {
      try {
        const [vehiclesRes, driversRes] = await Promise.all([
          api.get('/vehicles'),
          api.get('/drivers'),
        ])
        setStats({
          vehicles: vehiclesRes.data.length,
          drivers: driversRes.data.length,
          trips: 42,
        })
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [user, router])

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="card bg-slate-950/80 border border-white/10 text-white">
          <div className="text-sm text-slate-400">Vehicles</div>
          <div className="text-4xl font-semibold mt-4">{stats.vehicles}</div>
        </div>
        <div className="card bg-slate-950/80 border border-white/10 text-white">
          <div className="text-sm text-slate-400">Drivers</div>
          <div className="text-4xl font-semibold mt-4">{stats.drivers}</div>
        </div>
        <div className="card bg-slate-950/80 border border-white/10 text-white">
          <div className="text-sm text-slate-400">Trips</div>
          <div className="text-4xl font-semibold mt-4">{stats.trips}</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
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

        <div className="card bg-slate-950/85 border border-white/10 p-6 text-white">
          <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Quick actions</div>
          <div className="mt-5 space-y-3">
            <div className="rounded-3xl bg-slate-900/70 p-4">
              <div className="text-sm text-slate-400">Use the quick actions to add vehicles and drivers.</div>
            </div>
            <div className="rounded-3xl bg-slate-900/70 p-4">
              <div className="text-sm text-slate-400">Monitor fuel cost, dispatch load, and maintain compliance.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
