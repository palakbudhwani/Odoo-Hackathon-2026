import { Router } from 'express';
import { z } from 'zod';
import prisma from '../prisma';
import { requireAuth, requireAnyRole } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

const FuelInput = z.object({
  vehicleId: z.preprocess(val => Number(val), z.number().int().positive()),
  liters: z.preprocess(val => Number(val), z.number().positive()),
  cost: z.preprocess(val => Number(val), z.number().nonnegative()),
  date: z.preprocess(val => {
    if (!val) return undefined;
    const date = new Date(val as string);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }, z.date().optional()),
});

router.get('/', async (req, res, next) => {
  try {
    const items = await prisma.fuelLog.findMany({ include: { vehicle: true }, orderBy: { date: 'desc' } });
    res.json(items);
  } catch (err) { next(err); }
});

router.post('/', requireAnyRole('Fleet Manager', 'Safety Officer', 'Financial Analyst'), async (req, res, next) => {
  try {
    const data = FuelInput.parse(req.body);
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    const item = await prisma.fuelLog.create({
      data: {
        vehicleId: data.vehicleId,
        liters: data.liters,
        cost: data.cost,
        date: data.date,
      },
    });

    res.status(201).json(item);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors.map(e => e.message).join(', ') });
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const item = await prisma.fuelLog.findUnique({ where: { id }, include: { vehicle: true } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) { next(err); }
});

router.delete('/:id', requireAnyRole('Fleet Manager', 'Safety Officer', 'Financial Analyst'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.fuelLog.delete({ where: { id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
