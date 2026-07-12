import { Router } from 'express';
import { z } from 'zod';
import prisma from '../prisma';
import { requireAuth, requireAnyRole } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

const ExpenseInput = z.object({
  vehicleId: z.preprocess(val => {
    if (val === undefined || val === null || val === '') return undefined;
    return Number(val);
  }, z.number().int().positive().optional()),
  type: z.string().min(1, 'Expense type is required'),
  amount: z.preprocess(val => Number(val), z.number().nonnegative()),
  notes: z.string().optional(),
  date: z.preprocess(val => {
    if (!val) return undefined;
    const date = new Date(val as string);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }, z.date().optional()),
});

router.get('/', async (req, res, next) => {
  try {
    const items = await prisma.expense.findMany({ include: { vehicle: true }, orderBy: { date: 'desc' } });
    res.json(items);
  } catch (err) { next(err); }
});

router.post('/', requireAnyRole('Fleet Manager', 'Safety Officer', 'Financial Analyst'), async (req, res, next) => {
  try {
    const data = ExpenseInput.parse(req.body);
    if (data.vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
      if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    }

    const item = await prisma.expense.create({
      data: {
        vehicleId: data.vehicleId,
        type: data.type,
        amount: data.amount,
        notes: data.notes,
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
    const item = await prisma.expense.findUnique({ where: { id }, include: { vehicle: true } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) { next(err); }
});

router.delete('/:id', requireAnyRole('Fleet Manager', 'Safety Officer', 'Financial Analyst'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.expense.delete({ where: { id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
