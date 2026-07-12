import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const roles = await prisma.role.findMany();
    res.json(roles);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) return res.status(404).json({ error: 'Not found' });
    res.json(role);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;
    const role = await prisma.role.create({ data: { name } });
    res.status(201).json(role);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name } = req.body;
    const role = await prisma.role.update({ where: { id }, data: { name } });
    res.json(role);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.role.delete({ where: { id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
