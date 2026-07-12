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

export default function Expenses() {
  const router = useRouter()
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [form, setForm] = useState({ amount: '', type: '', notes: '', vehicleId: '', date: '' })
  const [status, setStatus] = useState('')

  const summary = useMemo(() => {
    const totalCost = items.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    return { totalCost, count: items.length }
  }, [items])

  const chartData = useMemo(() => {
    return items
      .slice(0, 8)
      .reverse()
      .map(item => ({
        date: new Date(item.date).toLocaleDateString(),
        amount: Number(item.amount || 0),
      }))
  }, [items])

  useEffect(() => {
    if (!user) {
      router.replace('/login')
      return
    }

    async function load() {
      try {
        const [expenseRes, vehicleRes] = await Promise.all([api.get('/expenses'), api.get('/vehicles')])
        setItems(expenseRes.data)
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
      await api.post('/expenses', {
        amount: Number(form.amount),
        type: form.type,
        notes: form.notes,
        vehicleId: form.vehicleId ? Number(form.vehicleId) : null,
        date: form.date || undefined,
      })
      setStatus('Expense recorded')
      setForm({ amount: '', type: '', notes: '', vehicleId: '', date: '' })
      const res = await api.get('/expenses')
      setItems(res.data)
    } catch (err) {
      setStatus(err?.response?.data?.error || 'Failed to record expense')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Expenses</h1>
          <p className="text-slate-400">Track operational expense items and vehicle cost allocations.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            className="btn bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-900"
            type="button"
            onClick={async () => {
              setStatus('Downloading expense report...')
              try {
                await downloadCsv('/reports/expenses')
                setStatus('Expense report downloaded')
              } catch (err) {
                console.error(err)
                setStatus('Expense export failed')
              }
            }}
          >
            Export expenses CSV
          </button>
          {status && <div className="rounded-full bg-slate-900 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-300">{status}</div>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-4">
          <div className="card bg-slate-950/85 border border-white/10 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm uppercase tracking-[0.18em] text-slate-500">Expense summary</div>
                <div className="text-xl font-semibold text-white">Total spend</div>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-900/70 p-4">
                <div className="text-xs text-slate-400">Amount</div>
                <div className="text-2xl font-semibold text-white">${summary.totalCost.toFixed(2)}</div>
              </div>
              <div className="rounded-3xl bg-slate-900/70 p-4">
                <div className="text-xs text-slate-400">Records</div>
                <div className="text-2xl font-semibold text-white">{summary.count}</div>
              </div>
            </div>
          </div>
          <div className="card bg-slate-950/85 border border-white/10 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm uppercase tracking-[0.18em] text-slate-500">Expense trend</div>
                <div className="text-xl font-semibold text-white">Recent spend</div>
              </div>
            </div>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 0, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#0f172a" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ background: '#0f172a', border: 'none', color: '#fff' }} />
                  <Area type="monotone" dataKey="amount" stroke="#f97316" fill="url(#expenseGradient)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card bg-slate-950/85 border border-white/10 p-5">
            {items.length === 0 ? (
              <div className="rounded-3xl bg-slate-900/70 p-6">No expense records yet.</div>
            ) : (
              items.map(item => (
                <div key={item.id} className="rounded-3xl bg-slate-900/70 p-5 mb-4 border border-white/5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold text-white">{item.type}</div>
                      <div className="text-sm text-slate-400">Vehicle: {item.vehicle?.registrationNumber || item.vehicleId || 'General'}</div>
                    </div>
                    <div className="text-sm text-slate-400">${item.amount.toFixed(2)}</div>
                  </div>
                  <div className="mt-3 text-slate-300 text-sm">{item.notes || 'No notes.'}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card bg-slate-950/85 border border-white/10">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-white">New expense</h2>
            <p className="text-slate-400 text-sm">Log expense items like repairs, permits, or fuel overhead.</p>
          </div>
          <RequireAnyRole roles={["Fleet Manager", "Safety Officer", "Financial Analyst"]} fallback={<div className="p-6 text-slate-400">You do not have permission to record expenses.</div>}>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Vehicle</label>
                <select
                  className="input bg-slate-900/70 text-white border-slate-700"
                  value={form.vehicleId}
                  onChange={e => setForm(prev => ({ ...prev, vehicleId: e.target.value }))}
                >
                  <option value="">General expense</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.registrationNumber}{vehicle.name ? ` — ${vehicle.name}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              {[
                { label: 'Amount', key: 'amount', type: 'number' },
                { label: 'Type', key: 'type' },
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
              <div>
                <label className="block text-sm text-slate-400 mb-2">Notes</label>
                <textarea
                  className="input bg-slate-900/70 text-white border-slate-700 min-h-[120px]"
                  value={form.notes}
                  onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <button className="btn bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500" type="submit">Record expense</button>
              {status && <div className="text-sm text-slate-300">{status}</div>}
            </form>
          </RequireAnyRole>
        </div>
      </div>
    </div>
  )
}
