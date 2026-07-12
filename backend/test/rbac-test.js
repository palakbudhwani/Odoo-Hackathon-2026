// Simple RBAC smoke test script using global fetch
const base = 'http://localhost:4000'

async function api(path, opts = {}) {
  const res = await fetch(base + path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
  })
  let bodyText = ''
  try { bodyText = await res.text() } catch (e) {}
  let body = bodyText
  try { body = JSON.parse(bodyText) } catch (e) {}
  console.log(path, res.status, body)
  return { status: res.status, body }
}

async function ensureRoles(names) {
  for (const name of names) {
    try {
      await api('/roles', { method: 'POST', body: JSON.stringify({ name }) })
    } catch (e) { console.error('role create error', e) }
  }
  const all = await api('/roles')
  const map = {}
  for (const r of all.body) map[r.name] = r.id
  return map
}

async function registerUser(name, email, password, roleId) {
  const payload = { name, email, password }
  if (roleId) payload.roleId = roleId
  return api('/auth/register', { method: 'POST', body: JSON.stringify(payload) })
}

async function login(email, password) {
  return api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
}

async function run() {
  const roles = ['User', 'Fleet Manager', 'Safety Officer', 'Financial Analyst']
  console.log('Creating roles...')
  const roleMap = await ensureRoles(roles)

  console.log('Registering users...')
  const users = {}
  for (const r of roles) {
    const email = `${r.toLowerCase().replace(/\s+/g,'_')}@example.test`
    const pass = 'Password123!'
    await registerUser(r, email, pass, roleMap[r])
    const loginRes = await login(email, pass)
    users[r] = { token: loginRes.body?.token, user: loginRes.body?.user }
  }

  // create a vehicle with Fleet Manager
  console.log('Creating a vehicle using Fleet Manager...')
  const fm = users['Fleet Manager']
  const vehicleResp = await api('/vehicles', { method: 'POST', headers: { Authorization: `Bearer ${fm.token}` }, body: JSON.stringify({ registrationNumber: `RBAC-${Date.now()}`, name: 'RBAC Vehicle' }) })
  const vehicleId = vehicleResp.body?.id

  // Attempt maintenance creation with each role
  console.log('Testing maintenance POST per role...')
  for (const r of roles) {
    const t = users[r].token
    const res = await api('/maintenance', { method: 'POST', headers: { Authorization: `Bearer ${t}` }, body: JSON.stringify({ vehicleId, type: 'inspection', notes: `Created by ${r}` }) })
    console.log(`${r} -> maintenance POST status:`, res.status)
  }

  // Test vehicles POST with normal User (should be allowed)
  console.log('Testing vehicle creation with User role (should be allowed)...')
  const userToken = users['User'].token
  const v2 = await api('/vehicles', { method: 'POST', headers: { Authorization: `Bearer ${userToken}` }, body: JSON.stringify({ registrationNumber: `RBAC-U-${Date.now()}`, name: 'User Vehicle' }) })
  console.log('User vehicles POST status:', v2.status)
}

run().catch(e => { console.error('RBAC test failed', e); process.exit(1) })
