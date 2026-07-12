const base = 'http://localhost:4000'

async function api(path, opts = {}) {
  const res = await fetch(base + path, opts)
  const text = await res.text().catch(()=>'')
  let body = text
  try { body = JSON.parse(text) } catch(e) {}
  console.log(path, res.status)
  return { status: res.status, body }
}

async function run() {
  // login as the test User created by rbac-test.js
  const login = await api('/auth/login', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ email: 'user@example.test', password: 'Password123!' }) })
  if (login.status !== 200) { console.error('Login failed, cannot proceed'); process.exit(1) }
  const token = login.body.token
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const endpoints = ['/vehicles','/drivers','/trips','/maintenance','/fuel','/expenses','/roles','/dashboard/stats']
  for (const ep of endpoints) {
    await api(ep, { method: 'GET', headers })
  }
}

run().catch(e=>{ console.error(e); process.exit(1) })
