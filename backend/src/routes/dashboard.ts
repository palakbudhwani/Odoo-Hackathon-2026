import { Router } from 'express';
import prisma from '../prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/stats', async (req, res, next) => {
  try {
    const totalVehicles = await prisma.vehicle.count();
    const availableVehicles = await prisma.vehicle.count({ where: { status: 'AVAILABLE' } });
    const inShop = await prisma.vehicle.count({ where: { status: 'IN_SHOP' } });
    const onTrip = await prisma.vehicle.count({ where: { status: 'ON_TRIP' } });

    const totalDrivers = await prisma.driver.count();
    const driversOnTrip = await prisma.driver.count({ where: { status: 'ON_TRIP' } });

    const totalTrips = await prisma.trip.count();
    const dispatchedTrips = await prisma.trip.count({ where: { status: 'DISPATCHED' } });
    const draftTrips = await prisma.trip.count({ where: { status: 'DRAFT' } });

    const totalMaintenance = await prisma.maintenanceLog.count();
    const activeMaintenance = await prisma.maintenanceLog.count({ where: { status: 'IN_PROGRESS' } });

    const totalFuelCost = (await prisma.fuelLog.aggregate({ _sum: { cost: true } }))._sum.cost || 0;
    const totalFuelLiters = (await prisma.fuelLog.aggregate({ _sum: { liters: true } }))._sum.liters || 0;
    const totalExpenseCost = (await prisma.expense.aggregate({ _sum: { amount: true } }))._sum.amount || 0;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const overdueMaintenance = await prisma.maintenanceLog.count({
      where: {
        status: 'IN_PROGRESS',
        createdAt: { lt: sevenDaysAgo },
      },
    });
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentFuelCost = (await prisma.fuelLog.aggregate({
      where: { date: { gte: thirtyDaysAgo } },
      _sum: { cost: true },
    }))._sum.cost || 0;
    const recentExpenseCost = (await prisma.expense.aggregate({
      where: { date: { gte: thirtyDaysAgo } },
      _sum: { amount: true },
    }))._sum.amount || 0;
    const recentSpend = recentFuelCost + recentExpenseCost;
    const highSpend = recentSpend >= 5000;
    const utilization = totalVehicles > 0 ? Math.round((onTrip / totalVehicles) * 100) : 0;

    res.json({
      vehicles: { total: totalVehicles, available: availableVehicles, inShop, onTrip },
      drivers: { total: totalDrivers, onTrip: driversOnTrip },
      trips: { total: totalTrips, dispatched: dispatchedTrips, draft: draftTrips },
      maintenance: { total: totalMaintenance, active: activeMaintenance },
      fuel: { totalCost: totalFuelCost, totalLiters: totalFuelLiters },
      expenses: { totalCost: totalExpenseCost },
      utilization,
      alerts: { overdueMaintenance, recentSpend, highSpend },
    });
  } catch (err) { next(err); }
});

export default router;
