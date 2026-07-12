import { Router } from 'express';
import { z } from 'zod';
import prisma from '../prisma';
import { requireAuth, requireAnyRole } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

const TripInput = z.object({
  source: z.string().min(1, 'Source is required'),
  destination: z.string().min(1, 'Destination is required'),
  vehicleId: z.preprocess(val => Number(val), z.number().int().positive()),
  driverId: z.preprocess(val => Number(val), z.number().int().positive()),
  cargoWeightKg: z.preprocess(val => {
    if (val === undefined || val === null || val === '') return undefined;
    return Number(val);
  }, z.number().nonnegative().optional()),
  plannedDistanceKm: z.preprocess(val => {
    if (val === undefined || val === null || val === '') return undefined;
    return Number(val);
  }, z.number().nonnegative().optional()),
  status: z.enum(['DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED']).optional(),
});

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

router.post('/', requireAnyRole('User', 'Fleet Manager', 'Safety Officer', 'Financial Analyst'), async (req, res, next) => {
  try {
    const data = TripInput.parse(req.body);

    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    if (vehicle.status !== 'AVAILABLE') return res.status(400).json({ error: 'Vehicle must be available for a new trip' });
    if (data.cargoWeightKg && vehicle.maxLoadKg && data.cargoWeightKg > vehicle.maxLoadKg) {
      return res.status(400).json({ error: 'Cargo weight exceeds vehicle capacity' });
    }

    const driver = await prisma.driver.findUnique({ where: { id: data.driverId } });
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    if (driver.status !== 'AVAILABLE') return res.status(400).json({ error: 'Driver must be available for a new trip' });
    if (driver.licenseExpiry && driver.licenseExpiry < new Date()) {
      return res.status(400).json({ error: 'Driver license has expired' });
    }

    const t = await prisma.trip.create({ data: { ...data, status: data.status || 'DRAFT' } });
    res.status(201).json(t);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors.map(e => e.message).join(', ') });
    next(err);
  }
});

router.put('/:id', requireAnyRole('Fleet Manager', 'Safety Officer', 'Financial Analyst'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = TripInput.parse(req.body);
    const existing = await prisma.trip.findUnique({ where: { id }, include: { vehicle: true, driver: true } });
    if (!existing) return res.status(404).json({ error: 'Trip not found' });

    const updateData: any = { ...data };

    if (data.status === 'DISPATCHED' && existing.status !== 'DISPATCHED') {
      const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
      const driver = await prisma.driver.findUnique({ where: { id: data.driverId } });
      if (!vehicle || vehicle.status !== 'AVAILABLE') return res.status(400).json({ error: 'Vehicle must be available to dispatch' });
      if (!driver || driver.status !== 'AVAILABLE') return res.status(400).json({ error: 'Driver must be available to dispatch' });
      if (data.cargoWeightKg && vehicle.maxLoadKg && data.cargoWeightKg > vehicle.maxLoadKg) {
        return res.status(400).json({ error: 'Cargo weight exceeds vehicle capacity' });
      }
      await prisma.vehicle.update({ where: { id: vehicle.id }, data: { status: 'ON_TRIP' } });
      await prisma.driver.update({ where: { id: driver.id }, data: { status: 'ON_TRIP' } });
      updateData.startedAt = new Date();
    }

    if (data.status === 'COMPLETED' && existing.status === 'DISPATCHED') {
      await prisma.vehicle.update({ where: { id: existing.vehicleId }, data: { status: 'AVAILABLE' } });
      await prisma.driver.update({ where: { id: existing.driverId }, data: { status: 'AVAILABLE' } });
      updateData.completedAt = new Date();
    }

    if (data.status === 'CANCELLED' && existing.status === 'DISPATCHED') {
      await prisma.vehicle.update({ where: { id: existing.vehicleId }, data: { status: 'AVAILABLE' } });
      await prisma.driver.update({ where: { id: existing.driverId }, data: { status: 'AVAILABLE' } });
    }

    const t = await prisma.trip.update({ where: { id }, data: updateData });
    res.json(t);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors.map(e => e.message).join(', ') });
    next(err);
  }
});

router.delete('/:id', requireAnyRole('Fleet Manager', 'Safety Officer', 'Financial Analyst'), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.trip.delete({ where: { id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
