import { useAuth } from '../context/AuthContext'

export function useHasAnyRole(...roles) {
  const { user } = useAuth()
  if (!user) return false
  return roles.includes(user.roleName)
}

export default function RequireAnyRole({ roles = [], children, fallback = null }) {
  const { user } = useAuth()
  if (!user) return fallback
  const ok = roles.includes(user.roleName)
  return ok ? children : fallback
}
