import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function Fuel() {
  const router = useRouter()
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ vehicleId: '', liters: '', cost: '', date: '' })
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (!user) {
      router.replace('/login')
      return
    }

    async function load() {
      try {
        const res = await api.get('/fuel')
        setItems(res.data)
      } catch (err) {
        setItems([])
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
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="card bg-slate-950/85 border border-white/10">
          <div className="space-y-4">
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
          <form onSubmit={submit} className="space-y-4">
            {[
              { label: 'Vehicle ID', key: 'vehicleId', type: 'number' },
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
        </div>
      </div>
    </div>
  )
}
