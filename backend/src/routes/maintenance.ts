import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../prisma';
import { requireAuth, requireAnyRole } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

const MaintenanceInput = z.object({
  vehicleId: z.preprocess(val => Number(val), z.number().int().positive()),
  type: z.string().min(1, 'Maintenance type is required'),
  notes: z.string().optional(),
  date: z.preprocess(val => {
    if (!val) return undefined
    const date = new Date(val as string)
    return Number.isNaN(date.getTime()) ? undefined : date
  }, z.date().optional()),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await prisma.maintenanceLog.findMany({ include: { vehicle: true }, orderBy: { createdAt: 'desc' } });
    res.json(items);
  } catch (err) { next(err); }
});

router.post('/', requireAnyRole('Fleet Manager', 'Safety Officer', 'Financial Analyst'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = MaintenanceInput.parse(req.body);
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    if (vehicle.status === 'ON_TRIP' || vehicle.status === 'RETIRED') {
      return res.status(400).json({ error: 'Vehicle is not available for maintenance' });
    }

    const status = data.status ?? 'IN_PROGRESS';
    if (status === 'IN_PROGRESS' && vehicle.status !== 'IN_SHOP') {
      await prisma.vehicle.update({ where: { id: vehicle.id }, data: { status: 'IN_SHOP' } });
    }

    const item = await prisma.maintenanceLog.create({
      data: {
        vehicleId: data.vehicleId,
        type: data.type,
        notes: data.notes,
        date: data.date,
        status,
        completedAt: status === 'COMPLETED' ? new Date() : undefined,
      },
    });

    if (status === 'COMPLETED') {
      await prisma.vehicle.update({ where: { id: vehicle.id }, data: { status: 'AVAILABLE' } });
    }

    res.status(201).json(item);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors.map(e => e.message).join(', ') });
    next(err);
  }
});

router.put('/:id', requireAnyRole('Fleet Manager', 'Safety Officer', 'Financial Analyst'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const payload = MaintenanceInput.partial().parse(req.body);
    const existing = await prisma.maintenanceLog.findUnique({ where: { id }, include: { vehicle: true } });
    if (!existing) return res.status(404).json({ error: 'Maintenance record not found' });

    const updateData: any = {};
    if (payload.type !== undefined) updateData.type = payload.type;
    if (payload.notes !== undefined) updateData.notes = payload.notes;
    if (payload.date !== undefined) updateData.date = payload.date;
    if (payload.status !== undefined) {
      updateData.status = payload.status;
      if (payload.status === 'COMPLETED' && existing.status !== 'COMPLETED') {
        updateData.completedAt = new Date();
        if (existing.vehicle.status === 'IN_SHOP') {
          await prisma.vehicle.update({ where: { id: existing.vehicleId }, data: { status: 'AVAILABLE' } });
        }
      }
      if (payload.status === 'IN_PROGRESS' && existing.status !== 'IN_PROGRESS' && existing.vehicle.status !== 'IN_SHOP') {
        await prisma.vehicle.update({ where: { id: existing.vehicleId }, data: { status: 'IN_SHOP' } });
      }
      if (payload.status === 'PENDING' && existing.status === 'IN_PROGRESS' && existing.vehicle.status === 'IN_SHOP') {
        // keep vehicle in shop until maintenance starts or completes
      }
    }

    const item = await prisma.maintenanceLog.update({ where: { id }, data: updateData });
    res.json(item);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors.map(e => e.message).join(', ') });
    next(err);
  }
});

router.delete('/:id', requireAnyRole('Fleet Manager', 'Safety Officer', 'Financial Analyst'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.maintenanceLog.findUnique({ where: { id }, include: { vehicle: true } });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    await prisma.maintenanceLog.delete({ where: { id } });
    if (existing.status !== 'COMPLETED' && existing.vehicle.status === 'IN_SHOP') {
      await prisma.vehicle.update({ where: { id: existing.vehicleId }, data: { status: 'AVAILABLE' } });
    }
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
