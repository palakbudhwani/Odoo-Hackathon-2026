import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const items = await prisma.expense.findMany({ include: { vehicle: true } });
    res.json(items);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const {
      vehicleId,
      category,
      amount,
      description,
      date,
    } = req.body;

    const item = await prisma.expense.create({
      data: {
        vehicleId: Number(vehicleId),
        category,
        amount: Number(amount),
        description,
        date: date ? new Date(date) : undefined,
      },
    });

    res.status(201).json(item);
  } catch (err) {
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

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.expense.delete({ where: { id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
