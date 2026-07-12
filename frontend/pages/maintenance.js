import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function Maintenance() {
  const router = useRouter()
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ vehicleId: '', type: '', notes: '', date: '' })
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (!user) {
      router.replace('/login')
      return
    }

    async function load() {
      try {
        const res = await api.get('/maintenance')
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
      await api.post('/maintenance', {
        vehicleId: Number(form.vehicleId),
        type: form.type,
        notes: form.notes,
        date: form.date || undefined,
      })
      setStatus('Maintenance log saved')
      setForm({ vehicleId: '', type: '', notes: '', date: '' })
      const res = await api.get('/maintenance')
      setItems(res.data)
    } catch (err) {
      setStatus(err?.response?.data?.error || 'Failed to save maintenance log')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Maintenance</h1>
          <p className="text-slate-400">Track service cycles, repairs, and maintenance history.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="card bg-slate-950/85 border border-white/10">
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="rounded-3xl bg-slate-900/70 p-6">No maintenance records yet.</div>
            ) : (
              items.map(log => (
                <div key={log.id} className="rounded-3xl bg-slate-900/70 p-5 mb-4 border border-white/5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold text-white">{log.type}</div>
                      <div className="text-sm text-slate-400">Vehicle: {log.vehicle?.registrationNumber || log.vehicleId}</div>
                    </div>
                    <div className="text-sm text-slate-400">{new Date(log.date).toLocaleDateString()}</div>
                  </div>
                  <div className="mt-3 text-slate-300 text-sm">{log.notes || 'No notes provided.'}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card bg-slate-950/85 border border-white/10">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-white">New maintenance log</h2>
            <p className="text-slate-400 text-sm">Record repair, inspection, or service events for vehicles.</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            {[
              { label: 'Vehicle ID', key: 'vehicleId', type: 'number' },
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
            <button className="btn bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500" type="submit">Save log</button>
            {status && <div className="text-sm text-slate-300">{status}</div>}
          </form>
        </div>
      </div>
    </div>
  )
}
