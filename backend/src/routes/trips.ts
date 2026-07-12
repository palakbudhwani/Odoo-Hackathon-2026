import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const trips = await prisma.trip.findMany({ include: { vehicle: true, driver: true } });
    res.json(trips);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const t = await prisma.trip.findUnique({ where: { id }, include: { vehicle: true, driver: true } });
    if (!t) return res.status(404).json({ error: 'Not found' });
    res.json(t);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const data = req.body;
    const t = await prisma.trip.create({ data });
    res.status(201).json(t);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const t = await prisma.trip.update({ where: { id }, data });
    res.json(t);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.trip.delete({ where: { id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
