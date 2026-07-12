import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import RequireAnyRole from '../components/RequireRole'

const statusLabels = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
}

export default function Maintenance() {
  const router = useRouter()
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [form, setForm] = useState({ vehicleId: '', type: '', notes: '', date: '', status: 'IN_PROGRESS' })
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (!user) {
      router.replace('/login')
      return
    }

    async function load() {
      try {
        const [maintenanceRes, vehicleRes] = await Promise.all([
          api.get('/maintenance'),
          api.get('/vehicles'),
        ])
        setItems(maintenanceRes.data)
        setVehicles(vehicleRes.data)
      } catch (err) {
        setItems([])
        setVehicles([])
      }
    }
    load()
  }, [user, router])

  async function refreshData() {
    try {
      const [maintenanceRes, vehicleRes] = await Promise.all([
        api.get('/maintenance'),
        api.get('/vehicles'),
      ])
      setItems(maintenanceRes.data)
      setVehicles(vehicleRes.data)
    } catch (err) {
      console.error(err)
    }
  }

  async function submit(e) {
    e.preventDefault()
    setStatus('')
    try {
      await api.post('/maintenance', {
        vehicleId: Number(form.vehicleId),
        type: form.type,
        notes: form.notes,
        date: form.date || undefined,
        status: form.status,
      })
      setStatus('Maintenance log saved')
      setForm({ vehicleId: '', type: '', notes: '', date: '', status: 'IN_PROGRESS' })
      await refreshData()
    } catch (err) {
      setStatus(err?.response?.data?.error || 'Failed to save maintenance log')
    }
  }

  async function updateStatus(id, newStatus) {
    setStatus('')
    try {
      await api.put(`/maintenance/${id}`, { status: newStatus })
      await refreshData()
    } catch (err) {
      setStatus(err?.response?.data?.error || 'Failed to update status')
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
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-lg font-semibold text-white">{log.type}</div>
                      <div className="text-sm text-slate-400">Vehicle: {log.vehicle?.registrationNumber || log.vehicleId}</div>
                      <div className="text-sm text-slate-400">Status: <span className="font-semibold text-white">{statusLabels[log.status] || log.status}</span></div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-400">Logged: {new Date(log.createdAt).toLocaleDateString()}</div>
                      {log.completedAt && <div className="text-sm text-slate-400">Completed: {new Date(log.completedAt).toLocaleDateString()}</div>}
                    </div>
                  </div>
                  <div className="mt-3 text-slate-300 text-sm">{log.notes || 'No notes provided.'}</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {log.status === 'PENDING' && (
                      <button type="button" onClick={() => updateStatus(log.id, 'IN_PROGRESS')} className="btn bg-slate-800 text-white border border-slate-700 py-2 px-4">Start maintenance</button>
                    )}
                    {log.status === 'IN_PROGRESS' && (
                      <button type="button" onClick={() => updateStatus(log.id, 'COMPLETED')} className="btn bg-gradient-to-r from-emerald-500 to-green-600 text-white py-2 px-4">Mark completed</button>
                    )}
                  </div>
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
          <RequireAnyRole roles={["Fleet Manager", "Safety Officer", "Financial Analyst"]} fallback={<div className="p-6 text-slate-400">You do not have permission to add maintenance logs.</div>}>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Vehicle</label>
                <select
                  className="input bg-slate-900/70 text-white border-slate-700"
                  value={form.vehicleId}
                  onChange={e => setForm(prev => ({ ...prev, vehicleId: e.target.value }))}
                >
                  <option value="">Select vehicle</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.registrationNumber} {vehicle.name ? `(${vehicle.name})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Type</label>
                <input
                  type="text"
                  className="input bg-slate-900/70 text-white border-slate-700"
                  value={form.type}
                  onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Status</label>
                <select
                  className="input bg-slate-900/70 text-white border-slate-700"
                  value={form.status}
                  onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                >
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Date</label>
                <input
                  type="date"
                  className="input bg-slate-900/70 text-white border-slate-700"
                  value={form.date}
                  onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
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
          </RequireAnyRole>
        </div>
      </div>
    </div>
  )
}
