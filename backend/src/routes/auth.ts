import { Router } from 'express';
import prisma from '../prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

async function getDefaultRole() {
  let defaultRole = await prisma.role.findUnique({ where: { name: 'User' } });
  if (!defaultRole) {
    defaultRole = await prisma.role.create({ data: { name: 'User' } });
  }
  return defaultRole;
}

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, roleId } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already in use' });
    const hash = await bcrypt.hash(password, 10);
    const defaultRole = await getDefaultRole();
    const assignedRoleId = roleId ?? defaultRole.id;
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hash,
        roleId: assignedRoleId,
      },
      include: { role: true },
    });
    const token = jwt.sign({ sub: user.id, roleId: user.roleId, roleName: user.role.name }, JWT_SECRET, { expiresIn: '8h' });
    const safe = { id: user.id, name: user.name, email: user.email, roleId: user.roleId, roleName: user.role.name, createdAt: user.createdAt };
    res.status(201).json({ user: safe, token });
  } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
    const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ sub: user.id, roleId: user.roleId, roleName: user.role.name }, JWT_SECRET, { expiresIn: '8h' });
    const safe = { id: user.id, name: user.name, email: user.email, roleId: user.roleId, roleName: user.role.name, createdAt: user.createdAt };
    res.json({ user: safe, token });
  } catch (err) { next(err); }
});

export default router;
