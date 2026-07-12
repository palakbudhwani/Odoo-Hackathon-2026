import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({ include: { role: true } });
    const safe = users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt }));
    res.json(safe);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const user = await prisma.user.findUnique({ where: { id }, include: { role: true } });
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    // Creating users directly requires providing passwordHash. Prefer /auth/register for typical signup.
    const { name, email, password, roleId } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    const hash = await require('bcrypt').hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, passwordHash: hash, roleId } });
    const safe = { id: user.id, name: user.name, email: user.email, roleId: user.roleId, createdAt: user.createdAt };
    res.status(201).json(safe);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    if (data.password) data.passwordHash = await require('bcrypt').hash(data.password, 10);
    delete data.password;
    const user = await prisma.user.update({ where: { id }, data });
    const safe = { id: user.id, name: user.name, email: user.email, roleId: user.roleId, createdAt: user.createdAt };
    res.json(safe);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
