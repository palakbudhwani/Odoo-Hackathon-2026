import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const items = await prisma.maintenanceLog.findMany({ include: { vehicle: true } });
    res.json(items);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      vehicleId: Number(req.body.vehicleId),
      date: req.body.date ? new Date(req.body.date) : undefined,
    };

    const item = await prisma.maintenanceLog.create({ data });

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const item = await prisma.maintenanceLog.findUnique({ where: { id }, include: { vehicle: true } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.maintenanceLog.delete({ where: { id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
