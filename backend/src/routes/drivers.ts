import { Router } from 'express';
import prisma from '../prisma';
import { requireAuth, requireAnyRole } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

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
    const data = req.body;
    const d = await prisma.driver.create({ data });
    res.status(201).json(d);
  } catch (err) { next(err); }
});

router.put('/:id', requireAnyRole('Fleet Manager', 'Safety Officer', 'Financial Analyst'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const d = await prisma.driver.update({ where: { id }, data });
    res.json(d);
  } catch (err) { next(err); }
});

router.delete('/:id', requireAnyRole('Fleet Manager', 'Safety Officer', 'Financial Analyst'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.driver.delete({ where: { id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
