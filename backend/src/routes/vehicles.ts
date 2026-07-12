import { Router } from 'express';
import prisma from '../prisma';
import { requireAuth, requireAnyRole } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

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
    const data = req.body;
    const v = await prisma.vehicle.create({ data });
    res.status(201).json(v);
  } catch (err) { next(err); }
});

router.put('/:id', requireAnyRole('Fleet Manager', 'Safety Officer', 'Financial Analyst'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const v = await prisma.vehicle.update({ where: { id }, data });
    res.json(v);
  } catch (err) { next(err); }
});

router.delete('/:id', requireAnyRole('Fleet Manager', 'Safety Officer', 'Financial Analyst'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.vehicle.delete({ where: { id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
