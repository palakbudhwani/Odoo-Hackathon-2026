import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function Trips() {
  const router = useRouter()
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ source: '', destination: '', vehicleId: '', driverId: '', cargoWeightKg: '', plannedDistanceKm: '' })
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (!user) {
      router.replace('/login')
      return
    }

    async function load() {
      try {
        const res = await api.get('/trips')
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
      await api.post('/trips', {
        source: form.source,
        destination: form.destination,
        vehicleId: Number(form.vehicleId),
        driverId: Number(form.driverId),
        cargoWeightKg: form.cargoWeightKg ? Number(form.cargoWeightKg) : undefined,
        plannedDistanceKm: form.plannedDistanceKm ? Number(form.plannedDistanceKm) : undefined,
      })
      setStatus('Trip created successfully')
      setForm({ source: '', destination: '', vehicleId: '', driverId: '', cargoWeightKg: '', plannedDistanceKm: '' })
      const res = await api.get('/trips')
      setItems(res.data)
    } catch (err) {
      setStatus(err?.response?.data?.error || 'Failed to create trip')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Trips</h1>
          <p className="text-slate-400">Manage dispatch schedules and trip assignments across the fleet.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="card bg-slate-950/85 border border-white/10">
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="rounded-3xl bg-slate-900/70 p-6">No trips scheduled yet.</div>
            ) : (
              items.map(trip => (
                <div key={trip.id} className="rounded-3xl bg-slate-900/70 p-5 mb-4 border border-white/5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold text-white">{trip.source} → {trip.destination}</div>
                      <div className="text-sm text-slate-400">Status: {trip.status}</div>
                    </div>
                    <div className="text-sm text-slate-400">{trip.cargoWeightKg ? `${trip.cargoWeightKg} kg` : 'No cargo'}</div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-4 text-slate-300 text-sm">
                    <div>Vehicle: {trip.vehicle?.registrationNumber || trip.vehicleId}</div>
                    <div>Driver: {trip.driver?.name || trip.driverId}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card bg-slate-950/85 border border-white/10">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-white">Create trip</h2>
            <p className="text-slate-400 text-sm">Add a trip and assign it to a vehicle and driver.</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            {[
              { label: 'Origin', key: 'source' },
              { label: 'Destination', key: 'destination' },
              { label: 'Vehicle ID', key: 'vehicleId', type: 'number' },
              { label: 'Driver ID', key: 'driverId', type: 'number' },
              { label: 'Cargo Weight (kg)', key: 'cargoWeightKg', type: 'number' },
              { label: 'Planned Distance (km)', key: 'plannedDistanceKm', type: 'number' },
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
            <button className="btn bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500" type="submit">Create trip</button>
            {status && <div className="text-sm text-slate-300">{status}</div>}
          </form>
        </div>
      </div>
    </div>
  )
}
