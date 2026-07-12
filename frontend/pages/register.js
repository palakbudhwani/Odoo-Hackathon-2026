import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

export default function Register() {
  const router = useRouter()
  const { user, saveSession } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user) router.replace('/dashboard')
  }, [user, router])

  async function submit(e) {
    e.preventDefault()
    setMessage('')
    try {
      await api.post('/auth/register', { name, email, password })
      router.push('/login')
    } catch (err) {
      setMessage(err?.response?.data?.error || 'Registration failed')
    }
  }

  return (
    <div className="container py-10">
      <div className="max-w-lg mx-auto">
        <div className="card bg-slate-950/80 border border-white/10 shadow-2xl backdrop-blur-xl">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Create account</p>
            <h2 className="text-3xl font-semibold text-white mt-3">Modern fleet onboarding</h2>
          </div>
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Name</label>
              <input className="input bg-slate-900/70 text-white border-slate-700 shadow-inner" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Email</label>
              <input className="input bg-slate-900/70 text-white border-slate-700 shadow-inner" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Password</label>
              <input className="input bg-slate-900/70 text-white border-slate-700 shadow-inner" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button className="btn bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500" type="submit">Create account</button>
          </form>
          {message && <div className="mt-4 text-sm text-rose-300">{message}</div>}
        </div>
      </div>
    </div>
  )
}
