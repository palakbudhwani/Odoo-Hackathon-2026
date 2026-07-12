import { createContext, useContext, useEffect, useState } from 'react'
import { attachToken } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const storedUser = window.localStorage.getItem('transitops_user')
    const storedToken = window.localStorage.getItem('transitops_token')
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
      attachToken(storedToken)
    }
  }, [])

  function saveSession(user, token) {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('transitops_user', JSON.stringify(user))
      window.localStorage.setItem('transitops_token', token)
    }
    setUser(user)
    setToken(token)
    attachToken(token)
  }

  function logout() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('transitops_user')
      window.localStorage.removeItem('transitops_token')
    }
    setUser(null)
    setToken(null)
    attachToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, saveSession, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
