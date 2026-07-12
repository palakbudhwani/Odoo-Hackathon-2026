import { Router } from 'express';
import { z } from 'zod';
import prisma from '../prisma';
import { requireAuth, requireAnyRole } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

const VehicleInput = z.object({
  registrationNumber: z.string().min(1, 'Registration Number is required'),
  name: z.string().optional(),
  model: z.string().optional(),
  type: z.string().optional(),
  maxLoadKg: z.preprocess(val => {
    if (typeof val === 'string' && val.trim() === '') return undefined;
    return typeof val === 'string' || typeof val === 'number' ? Number(val) : val;
  }, z.number().int().positive().optional()),
  odometerKm: z.preprocess(val => {
    if (typeof val === 'string' && val.trim() === '') return undefined;
    return typeof val === 'string' || typeof val === 'number' ? Number(val) : val;
  }, z.number().int().nonnegative().optional()),
});

router.get('/', async (req, res, next) => {
  try {
    const vehicles = await prisma.vehicle.findMany();
    res.json(vehicles);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const v = await prisma.vehicle.findUnique({ where: { id } });
    if (!v) return res.status(404).json({ error: 'Not found' });
    res.json(v);
  } catch (err) { next(err); }
});

router.post('/', requireAnyRole('User', 'Fleet Manager', 'Safety Officer', 'Financial Analyst'), async (req, res, next) => {
  try {
    const data = VehicleInput.parse(req.body);
    const existing = await prisma.vehicle.findUnique({ where: { registrationNumber: data.registrationNumber } });
    if (existing) return res.status(409).json({ error: 'Registration number already exists' });
    const v = await prisma.vehicle.create({ data });
    res.status(201).json(v);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors.map(e => e.message).join(', ') });
    next(err);
  }
});

router.put('/:id', requireAnyRole('Fleet Manager', 'Safety Officer', 'Financial Analyst'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = VehicleInput.parse(req.body);
    const duplicate = await prisma.vehicle.findFirst({ where: { registrationNumber: data.registrationNumber, NOT: { id } } });
    if (duplicate) return res.status(409).json({ error: 'Registration number already exists' });
    const v = await prisma.vehicle.update({ where: { id }, data });
    res.json(v);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors.map(e => e.message).join(', ') });
    next(err);
  }
});

router.delete('/:id', requireAnyRole('Fleet Manager', 'Safety Officer', 'Financial Analyst'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.vehicle.delete({ where: { id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
