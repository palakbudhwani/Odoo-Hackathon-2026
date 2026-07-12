import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import RequireAnyRole from '../components/RequireRole'

export default function Drivers() {
  const router = useRouter()
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ name: '', licenseNumber: '', contactNumber: '', licenseExpiry: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (!user) {
      router.replace('/login')
      return
    }

    async function load() {
      try {
        const res = await api.get('/drivers')
        setItems(res.data)
      } catch (err) {
        setItems([])
      }
    }
    load()
  }, [user, router])

  function validate() {
    const validation = {}
    if (!form.name.trim()) validation.name = 'Name is required.'
    if (!form.licenseNumber.trim()) validation.licenseNumber = 'License number is required.'
    if (form.licenseExpiry) {
      const expiryDate = new Date(form.licenseExpiry)
      if (Number.isNaN(expiryDate.getTime()) || expiryDate < new Date()) {
        validation.licenseExpiry = 'License expiry must be a valid future date.'
      }
    }
    return validation
  }

  async function submit(e) {
    e.preventDefault()
    setStatus('')
    const validation = validate()
    if (Object.keys(validation).length) {
      setErrors(validation)
      setStatus('Please fix the highlighted fields before submitting.')
      return
    }
    setErrors({})
    try {
      await api.post('/drivers', {
        name: form.name,
        licenseNumber: form.licenseNumber,
        contactNumber: form.contactNumber,
        licenseExpiry: form.licenseExpiry || undefined,
      })
      setStatus('Driver created successfully')
      setForm({ name: '', licenseNumber: '', contactNumber: '', licenseExpiry: '' })
      const res = await api.get('/drivers')
      setItems(res.data)
    } catch (err) {
      setStatus(err?.response?.data?.error || 'Failed to create driver')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Drivers</h1>
          <p className="text-slate-400">Add drivers and keep license records centralized.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="card bg-slate-950/85 border border-white/10">
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="rounded-3xl bg-slate-900/70 p-6">No drivers registered yet.</div>
            ) : (
              items.map(d => (
                <div key={d.id} className="rounded-3xl bg-slate-900/70 p-5 mb-4 border border-white/5">
                  <div className="text-lg font-semibold text-white">{d.name}</div>
                  <div className="text-sm text-slate-400">License: {d.licenseNumber}</div>
                  <div className="mt-3 grid grid-cols-2 gap-4 text-slate-300 text-sm">
                    <div>Contact: {d.contactNumber || '—'}</div>
                    <div>Assigned: {d.vehicleId || 'Unassigned'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card bg-slate-950/85 border border-white/10">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-white">Add driver</h2>
            <p className="text-slate-400 text-sm">Create a driver profile and keep license records current.</p>
          </div>
          <RequireAnyRole roles={["User", "Fleet Manager", "Safety Officer", "Financial Analyst"]} fallback={<div className="p-6 text-slate-400">You do not have permission to add drivers.</div>}>
            <form onSubmit={submit} className="space-y-4">
            {[
              { label: 'Name', key: 'name' },
              { label: 'License Number', key: 'licenseNumber' },
              { label: 'Contact Number', key: 'contactNumber' },
              { label: 'License Expiry', key: 'licenseExpiry', type: 'date' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-sm text-slate-400 mb-2">{field.label}</label>
                <input
                  type={field.type || 'text'}
                  className="input bg-slate-900/70 text-white border-slate-700"
                  value={form[field.key]}
                  onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                />
                {errors[field.key] && <div className="text-xs text-rose-400 mt-1">{errors[field.key]}</div>}
              </div>
            ))}
              <button className="btn bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500" type="submit">Create driver</button>
              {status && <div className="text-sm text-slate-300">{status}</div>}
            </form>
          </RequireAnyRole>
        </div>
      </div>
    </div>
  )
}
