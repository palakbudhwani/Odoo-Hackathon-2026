import { Router } from 'express';
import prisma from '../prisma';
import { requireAuth, requireAnyRole } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

function escapeCsv(value: unknown) {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

router.get('/fuel', requireAnyRole('Fleet Manager', 'Safety Officer', 'Financial Analyst'), async (req, res, next) => {
  try {
    const items = await prisma.fuelLog.findMany({ include: { vehicle: true }, orderBy: { date: 'desc' } });
    const header = ['Date', 'Vehicle', 'Liters', 'Cost', 'Cost per Liter'];
    const lines = [header.join(',')];
    for (const item of items) {
      const costPerLiter = item.liters ? item.cost / item.liters : 0;
      lines.push([
        escapeCsv(item.date.toISOString()),
        escapeCsv(item.vehicle?.registrationNumber ?? item.vehicleId),
        escapeCsv(item.liters),
        escapeCsv(item.cost),
        escapeCsv(costPerLiter.toFixed(2)),
      ].join(','));
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="fuel-report.csv"');
    res.send(lines.join('\n'));
  } catch (err) {
    next(err);
  }
});

router.get('/expenses', requireAnyRole('Fleet Manager', 'Safety Officer', 'Financial Analyst'), async (req, res, next) => {
  try {
    const items = await prisma.expense.findMany({ include: { vehicle: true }, orderBy: { date: 'desc' } });
    const header = ['Date', 'Vehicle', 'Type', 'Amount', 'Notes'];
    const lines = [header.join(',')];
    for (const item of items) {
      lines.push([
        escapeCsv(item.date.toISOString()),
        escapeCsv(item.vehicle?.registrationNumber ?? item.vehicleId ?? 'General'),
        escapeCsv(item.type),
        escapeCsv(item.amount),
        escapeCsv(item.notes),
      ].join(','));
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="expense-report.csv"');
    res.send(lines.join('\n'));
  } catch (err) {
    next(err);
  }
});

router.get('/maintenance', requireAnyRole('Fleet Manager', 'Safety Officer', 'Financial Analyst'), async (req, res, next) => {
  try {
    const items = await prisma.maintenanceLog.findMany({ include: { vehicle: true }, orderBy: { date: 'desc' } });
    const header = ['Date', 'Vehicle', 'Type', 'Status', 'Notes'];
    const lines = [header.join(',')];
    for (const item of items) {
      lines.push([
        escapeCsv(item.date.toISOString()),
        escapeCsv(item.vehicle?.registrationNumber ?? item.vehicleId),
        escapeCsv(item.type),
        escapeCsv(item.status),
        escapeCsv(item.notes),
      ].join(','));
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="maintenance-report.csv"');
    res.send(lines.join('\n'));
  } catch (err) {
    next(err);
  }
});

router.get('/trips', requireAnyRole('Fleet Manager', 'Safety Officer', 'Financial Analyst'), async (req, res, next) => {
  try {
    const items = await prisma.trip.findMany({ include: { vehicle: true, driver: true }, orderBy: { createdAt: 'desc' } });
    const header = ['Created', 'Source', 'Destination', 'Vehicle', 'Driver', 'Weight', 'Distance', 'Status', 'StartedAt', 'CompletedAt'];
    const lines = [header.join(',')];
    for (const item of items) {
      lines.push([
        escapeCsv(item.createdAt.toISOString()),
        escapeCsv(item.source),
        escapeCsv(item.destination),
        escapeCsv(item.vehicle?.registrationNumber ?? item.vehicleId),
        escapeCsv(item.driver?.name ?? item.driverId),
        escapeCsv(item.cargoWeightKg),
        escapeCsv(item.plannedDistanceKm),
        escapeCsv(item.status),
        escapeCsv(item.startedAt?.toISOString() ?? ''),
        escapeCsv(item.completedAt?.toISOString() ?? ''),
      ].join(','));
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="trip-report.csv"');
    res.send(lines.join('\n'));
  } catch (err) {
    next(err);
  }
});

export default router;
