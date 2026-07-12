import { Router } from 'express';
import { z } from 'zod';
import prisma from '../prisma';
import { requireAuth, requireAnyRole } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

const DriverInput = z.object({
  name: z.string().min(1, 'Name is required'),
  licenseNumber: z.string().min(1, 'License Number is required'),
  licenseCategory: z.string().optional(),
  licenseExpiry: z.preprocess(val => {
    if (!val) return undefined;
    if (typeof val === 'string' || typeof val === 'number') {
      const date = new Date(val);
      return Number.isNaN(date.getTime()) ? undefined : date;
    }
    return undefined;
  }, z.date().optional()),
  contactNumber: z.string().optional(),
  status: z.enum(['AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED']).optional(),
});

router.get('/', async (req, res, next) => {
  try {
    const drivers = await prisma.driver.findMany();
    res.json(drivers);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const d = await prisma.driver.findUnique({ where: { id } });
    if (!d) return res.status(404).json({ error: 'Not found' });
    res.json(d);
  } catch (err) { next(err); }
});

router.post('/', requireAnyRole('User', 'Fleet Manager', 'Safety Officer', 'Financial Analyst'), async (req, res, next) => {
  try {
    const data = DriverInput.parse(req.body);
    if (data.licenseExpiry && data.licenseExpiry < new Date()) {
      return res.status(400).json({ error: 'License expiry must be a future date' });
    }
    const existing = await prisma.driver.findUnique({ where: { licenseNumber: data.licenseNumber } });
    if (existing) return res.status(409).json({ error: 'License number already exists' });
    const d = await prisma.driver.create({ data });
    res.status(201).json(d);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors.map(e => e.message).join(', ') });
    next(err);
  }
});

router.put('/:id', requireAnyRole('Fleet Manager', 'Safety Officer', 'Financial Analyst'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = DriverInput.parse(req.body);
    if (data.licenseExpiry && data.licenseExpiry < new Date()) {
      return res.status(400).json({ error: 'License expiry must be a future date' });
    }
    const duplicate = await prisma.driver.findFirst({ where: { licenseNumber: data.licenseNumber, NOT: { id } } });
    if (duplicate) return res.status(409).json({ error: 'License number already exists' });
    const d = await prisma.driver.update({ where: { id }, data });
    res.json(d);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors.map(e => e.message).join(', ') });
    next(err);
  }
});

router.delete('/:id', requireAnyRole('Fleet Manager', 'Safety Officer', 'Financial Analyst'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.driver.delete({ where: { id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
