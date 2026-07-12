import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

const reportLinks = [
  { label: 'Fuel report', path: '/reports/fuel', type: 'fuel' },
  { label: 'Expense report', path: '/reports/expenses', type: 'expenses' },
  { label: 'Maintenance report', path: '/reports/maintenance', type: 'maintenance' },
  { label: 'Trip report', path: '/reports/trips', type: 'trips' },
]

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

export default function Reports() {
  const router = useRouter()
  const { user } = useAuth()
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (!user) {
      router.replace('/login')
    }
  }, [user, router])

  return (
    <div className="space-y-6">
      <div className="card bg-slate-950/90 border border-white/10 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Reporting</div>
            <div className="text-2xl font-semibold text-white">Download CSV exports</div>
          </div>
          <div className="text-sm text-slate-400">Use these exports for accounting, operations, and maintenance review.</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {reportLinks.map(report => (
          <div key={report.path} className="card bg-slate-950/85 border border-white/10 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm text-slate-400">{report.label}</div>
                <div className="text-lg font-semibold text-white">{report.label}</div>
              </div>
              <button
                className="btn bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
                onClick={async () => {
                  setStatus(`Downloading ${report.label.toLowerCase()}...`)
                  try {
                    await downloadCsv(report.path)
                  } catch (err) {
                    console.error(err)
                    setStatus('Failed to download report. Check permissions and try again.')
                  }
                }}
              >
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {status && <div className="rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-200">{status}</div>}
    </div>
  )
}
