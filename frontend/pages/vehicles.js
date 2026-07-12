import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function Vehicles() {
  const router = useRouter()
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ registrationNumber: '', name: '', model: '', type: '', maxLoadKg: '', odometerKm: '' })
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (!user) {
      router.replace('/login')
      return
    }

    async function load() {
      try {
        const res = await api.get('/vehicles')
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
      await api.post('/vehicles', {
        registrationNumber: form.registrationNumber,
        name: form.name,
        model: form.model,
        type: form.type,
        maxLoadKg: Number(form.maxLoadKg),
        odometerKm: Number(form.odometerKm),
      })
      setStatus('Vehicle created successfully')
      setForm({ registrationNumber: '', name: '', model: '', type: '', maxLoadKg: '', odometerKm: '' })
      const res = await api.get('/vehicles')
      setItems(res.data)
    } catch (err) {
      setStatus(err?.response?.data?.error || 'Failed to create vehicle')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Vehicles</h1>
          <p className="text-slate-400">Register a new vehicle and review fleet assets.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="card bg-slate-950/85 border border-white/10">
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="rounded-3xl bg-slate-900/70 p-6">No vehicles registered yet.</div>
            ) : (
              items.map(v => (
                <div key={v.id} className="rounded-3xl bg-slate-900/70 p-5 mb-4 border border-white/5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold text-white">{v.registrationNumber}</div>
                      <div className="text-sm text-slate-400">{v.name || v.model || 'Unnamed vehicle'}</div>
                    </div>
                    <div className="text-sm text-slate-400">{v.type || 'General'}</div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-4 text-slate-300 text-sm">
                    <div>Max load: {v.maxLoadKg ?? '—'} kg</div>
                    <div>Odometer: {v.odometerKm ?? '—'} km</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card bg-slate-950/85 border border-white/10">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-white">Add vehicle</h2>
            <p className="text-slate-400 text-sm">Register a vehicle with capacity and status data.</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            {[
              { label: 'Registration Number', key: 'registrationNumber' },
              { label: 'Name', key: 'name' },
              { label: 'Model', key: 'model' },
              { label: 'Type', key: 'type' },
              { label: 'Maximum Load (kg)', key: 'maxLoadKg', type: 'number' },
              { label: 'Odometer (km)', key: 'odometerKm', type: 'number' },
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
            <button className="btn bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500" type="submit">Create vehicle</button>
            {status && <div className="text-sm text-slate-300">{status}</div>}
          </form>
        </div>
      </div>
    </div>
  )
}
