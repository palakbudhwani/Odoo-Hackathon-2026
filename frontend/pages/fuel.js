import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import RequireAnyRole from '../components/RequireRole'

async function downloadCsv(path) {
  const res = await api.get(path, { responseType: 'blob' })
  const url = window.URL.createObjectURL(res.data)
  const link = document.createElement('a')
  link.href = url
  link.download = `${path.split('/').pop()}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export default function Fuel() {
  const router = useRouter()
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [form, setForm] = useState({ vehicleId: '', liters: '', cost: '', date: '' })
  const [status, setStatus] = useState('')

  const summary = useMemo(() => {
    const totalCost = items.reduce((sum, item) => sum + Number(item.cost || 0), 0)
    const totalLiters = items.reduce((sum, item) => sum + Number(item.liters || 0), 0)
    const avgCost = totalLiters ? totalCost / totalLiters : 0
    return { totalCost, totalLiters, avgCost, count: items.length }
  }, [items])

  const chartData = useMemo(() => {
    return items
      .slice(0, 8)
      .reverse()
      .map(log => ({
        date: new Date(log.date).toLocaleDateString(),
        cost: Number(log.cost || 0),
        liters: Number(log.liters || 0),
      }))
  }, [items])

  useEffect(() => {
    if (!user) {
      router.replace('/login')
      return
    }

    async function load() {
      try {
        const [fuelRes, vehicleRes] = await Promise.all([api.get('/fuel'), api.get('/vehicles')])
        setItems(fuelRes.data)
        setVehicles(vehicleRes.data)
      } catch (err) {
        setItems([])
        setVehicles([])
      }
    }
    load()
  }, [user, router])

  async function submit(e) {
    e.preventDefault()
    setStatus('')
    try {
      await api.post('/fuel', {
        vehicleId: Number(form.vehicleId),
        liters: Number(form.liters),
        cost: Number(form.cost),
        date: form.date || undefined,
      })
      setStatus('Fuel log created')
      setForm({ vehicleId: '', liters: '', cost: '', date: '' })
      const res = await api.get('/fuel')
      setItems(res.data)
    } catch (err) {
      setStatus(err?.response?.data?.error || 'Failed to create fuel log')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Fuel</h1>
          <p className="text-slate-400">Log fuel fills and track cost per vehicle over time.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            className="btn bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-900"
            type="button"
            onClick={async () => {
              setStatus('Downloading fuel report...')
              try {
                await downloadCsv('/reports/fuel')
                setStatus('Fuel report downloaded')
              } catch (err) {
                console.error(err)
                setStatus('Fuel export failed')
              }
            }}
          >
            Export fuel CSV
          </button>
          {status && <div className="rounded-full bg-slate-900 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-300">{status}</div>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-4">
          <div className="card bg-slate-950/85 border border-white/10 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm uppercase tracking-[0.18em] text-slate-500">Fuel summary</div>
                <div className="text-xl font-semibold text-white">Total spend</div>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-900/70 p-4">
                <div className="text-xs text-slate-400">Amount</div>
                <div className="text-2xl font-semibold text-white">${summary.totalCost.toFixed(2)}</div>
              </div>
              <div className="rounded-3xl bg-slate-900/70 p-4">
                <div className="text-xs text-slate-400">Liters</div>
                <div className="text-2xl font-semibold text-white">{summary.totalLiters.toFixed(1)}</div>
              </div>
              <div className="rounded-3xl bg-slate-900/70 p-4">
                <div className="text-xs text-slate-400">Average /L</div>
                <div className="text-2xl font-semibold text-white">${summary.avgCost.toFixed(2)}</div>
              </div>
            </div>
          </div>
          <div className="card bg-slate-950/85 border border-white/10 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm uppercase tracking-[0.18em] text-slate-500">Fuel trend</div>
                <div className="text-xl font-semibold text-white">Recent fill costs</div>
              </div>
            </div>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 0, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fuelGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#0f172a" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ background: '#0f172a', border: 'none', color: '#fff' }} />
                  <Area type="monotone" dataKey="cost" stroke="#38bdf8" fill="url(#fuelGradient)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card bg-slate-950/85 border border-white/10 p-5">
            {items.length === 0 ? (
              <div className="rounded-3xl bg-slate-900/70 p-6">No fuel records yet.</div>
            ) : (
              items.map(log => (
                <div key={log.id} className="rounded-3xl bg-slate-900/70 p-5 mb-4 border border-white/5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold text-white">Vehicle: {log.vehicle?.registrationNumber || log.vehicleId}</div>
                      <div className="text-sm text-slate-400">Liters: {log.liters}</div>
                    </div>
                    <div className="text-sm text-slate-400">{new Date(log.date).toLocaleDateString()}</div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-4 text-slate-300 text-sm">
                    <div>Cost: ${log.cost.toFixed(2)}</div>
                    <div>Unit: ${(log.cost / Math.max(1, log.liters)).toFixed(2)} /L</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card bg-slate-950/85 border border-white/10">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-white">New fuel entry</h2>
            <p className="text-slate-400 text-sm">Record refuel events and keep fuel spend visible.</p>
          </div>
          <RequireAnyRole roles={['Fleet Manager', 'Safety Officer', 'Financial Analyst']} fallback={<div className="p-6 text-slate-400">You do not have permission to log fuel entries.</div>}>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Vehicle</label>
                <select
                  className="input bg-slate-900/70 text-white border-slate-700"
                  value={form.vehicleId}
                  onChange={e => setForm(prev => ({ ...prev, vehicleId: e.target.value }))}
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.registrationNumber}{vehicle.name ? ` — ${vehicle.name}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              {[
                { label: 'Liters', key: 'liters', type: 'number' },
                { label: 'Cost', key: 'cost', type: 'number' },
                { label: 'Date', key: 'date', type: 'date' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-sm text-slate-400 mb-2">{field.label}</label>
                  <input
                    type={field.type || 'text'}
                    className="input bg-slate-900/70 text-white border-slate-700"
                    value={form[field.key]}
                    onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                  />
                </div>
              ))}
              <button className="btn bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500" type="submit">Log fuel</button>
              {status && <div className="text-sm text-slate-300">{status}</div>}
            </form>
          </RequireAnyRole>
        </div>
      </div>
    </div>
  )
}
