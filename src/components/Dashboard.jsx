import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Dashboard() {
  const {
    vehicles,
    drivers,
    trips,
    alerts,
    setView,
    getVehicleCost,
    getVehicleRevenue
  } = useApp();

  // Filters state
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  // Filter vehicles
  const filteredVehicles = vehicles.filter(v => {
    const matchesType = vehicleTypeFilter === 'all' || v.type === vehicleTypeFilter;
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchesRegion = regionFilter === 'all' || v.region === regionFilter;
    return matchesType && matchesStatus && matchesRegion;
  });

  // Calculate KPIs based on FILTERED vehicles (or global, but let's make it responsive to filters!)
  const totalVehicles = filteredVehicles.length;
  const activeVehicles = filteredVehicles.filter(v => v.status === 'On Trip').length;
  const availableVehicles = filteredVehicles.filter(v => v.status === 'Available').length;
  const inMaintenanceVehicles = filteredVehicles.filter(v => v.status === 'In Shop').length;
  const retiredVehicles = filteredVehicles.filter(v => v.status === 'Retired').length;

  const activeTrips = trips.filter(t => t.status === 'Dispatched').length;
  const pendingTrips = trips.filter(t => t.status === 'Draft').length;
  const driversOnDuty = drivers.filter(d => d.status === 'On Trip').length;

  // Fleet utilization: (On Trip Vehicles / Active Fleet) * 100. Active Fleet = Total - Retired
  const activeFleetCount = totalVehicles - retiredVehicles;
  const fleetUtilization = activeFleetCount > 0 
    ? Math.round((activeVehicles / activeFleetCount) * 100) 
    : 0;

  // Unique lists for filters
  const uniqueTypes = [...new Set(vehicles.map(v => v.type))];
  const uniqueRegions = [...new Set(vehicles.map(v => v.region))];

  // SVG Chart: Vehicle Status Donut Calculations
  const totalForDonut = activeVehicles + availableVehicles + inMaintenanceVehicles + retiredVehicles;
  
  // Percentages
  const pAvailable = totalForDonut > 0 ? (availableVehicles / totalForDonut) * 100 : 0;
  const pActive = totalForDonut > 0 ? (activeVehicles / totalForDonut) * 100 : 0;
  const pMaint = totalForDonut > 0 ? (inMaintenanceVehicles / totalForDonut) * 100 : 0;
  const pRetired = totalForDonut > 0 ? (retiredVehicles / totalForDonut) * 100 : 0;

  // Donut chart stroke dashes (circumference is 2 * pi * r = 2 * 3.14159 * 50 = 314)
  const circ = 314;
  const strokeAvailable = (pAvailable / 100) * circ;
  const strokeActive = (pActive / 100) * circ;
  const strokeMaint = (pMaint / 100) * circ;
  const strokeRetired = (pRetired / 100) * circ;

  const offsetAvailable = 0;
  const offsetActive = strokeAvailable;
  const offsetMaint = strokeAvailable + strokeActive;
  const offsetRetired = strokeAvailable + strokeActive + strokeMaint;

  // Financial Chart - Cost vs Revenue per Vehicle
  // Let's grab the top 5 vehicles by acquisition cost/cost
  const topVehicles = vehicles.slice(0, 5);
  const maxFinancialVal = Math.max(
    ...topVehicles.map(v => Math.max(getVehicleRevenue(v.regNum), getVehicleCost(v.regNum), 500))
  );

  return (
    <div>
      <div className="flex-between mb-12">
        <div>
          <h2 className="title-main">Fleet Dashboard</h2>
          <p className="subtitle-main">Real-time telemetry and compliance monitoring status</p>
        </div>
      </div>

      {/* Dynamic Alerts Banner */}
      {alerts.length > 0 && (
        <div className="alerts-banner-container">
          {alerts.map(alert => (
            <div key={alert.id} className={`alert-banner alert-banner-${alert.type}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{alert.type === 'danger' ? '🚨' : alert.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                <span>{alert.message}</span>
              </div>
              <span className="alert-banner-action" onClick={() => setView(alert.link)}>
                Resolve View →
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Dashboard Filter Bar */}
      <div className="filter-bar">
        <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Filter Fleet Metrics:
        </div>
        
        <div className="filter-item">
          <label htmlFor="vehicle-type-select">Vehicle Type</label>
          <select 
            id="vehicle-type-select"
            value={vehicleTypeFilter} 
            onChange={(e) => setVehicleTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="filter-item">
          <label htmlFor="status-select">Status</label>
          <select 
            id="status-select"
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>
        </div>

        <div className="filter-item">
          <label htmlFor="region-select">Region</label>
          <select 
            id="region-select"
            value={regionFilter} 
            onChange={(e) => setRegionFilter(e.target.value)}
          >
            <option value="all">All Regions</option>
            {uniqueRegions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {(vehicleTypeFilter !== 'all' || statusFilter !== 'all' || regionFilter !== 'all') && (
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setVehicleTypeFilter('all');
              setStatusFilter('all');
              setRegionFilter('all');
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Active Vehicles</div>
          <div className="kpi-value">{activeVehicles}</div>
          <div className="kpi-icon-wrapper" style={{ color: 'var(--semantic-success)', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
            🚚
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Available Vehicles</div>
          <div className="kpi-value">{availableVehicles}</div>
          <div className="kpi-icon-wrapper" style={{ color: 'var(--accent-primary)', backgroundColor: 'rgba(79, 70, 229, 0.1)' }}>
            ✓
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">In Maintenance</div>
          <div className="kpi-value">{inMaintenanceVehicles}</div>
          <div className="kpi-icon-wrapper" style={{ color: 'var(--semantic-warning)', backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
            🔧
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Active Trips</div>
          <div className="kpi-value">{activeTrips}</div>
          <div className="kpi-icon-wrapper" style={{ color: 'var(--semantic-info)', backgroundColor: 'rgba(6, 182, 212, 0.1)' }}>
            🗺
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Pending Trips</div>
          <div className="kpi-value">{pendingTrips}</div>
          <div className="kpi-icon-wrapper" style={{ color: 'var(--text-muted)', backgroundColor: 'rgba(107, 114, 128, 0.1)' }}>
            📝
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Drivers On Duty</div>
          <div className="kpi-value">{driversOnDuty}</div>
          <div className="kpi-icon-wrapper" style={{ color: 'var(--accent-primary)', backgroundColor: 'rgba(79, 70, 229, 0.1)' }}>
            👤
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '3px solid var(--accent-primary)' }}>
          <div className="kpi-label">Fleet Utilization</div>
          <div className="kpi-value">{fleetUtilization}%</div>
          <div className="kpi-icon-wrapper" style={{ color: 'var(--accent-primary)', backgroundColor: 'rgba(79, 70, 229, 0.1)' }}>
            📈
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid-cols-3 mb-24">
        {/* Donut Chart: Status distribution */}
        <div className="card">
          <h3 className="card-title">Vehicle Status Distribution</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', position: 'relative' }}>
            {totalForDonut === 0 ? (
              <div style={{ color: 'var(--text-muted)' }}>No vehicles found</div>
            ) : (
              <>
                <svg className="svg-donut" width="160" height="160" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="transparent" stroke="var(--bg-secondary)" strokeWidth="12" />
                  
                  {/* Available (Green) */}
                  {strokeAvailable > 0 && (
                    <circle cx="60" cy="60" r="50" fill="transparent" 
                      stroke="var(--semantic-success)" strokeWidth="12" 
                      strokeDasharray={`${strokeAvailable} ${circ}`} 
                      strokeDashoffset={-offsetAvailable} 
                    />
                  )}
                  {/* Active (Indigo/Blue) */}
                  {strokeActive > 0 && (
                    <circle cx="60" cy="60" r="50" fill="transparent" 
                      stroke="var(--accent-primary)" strokeWidth="12" 
                      strokeDasharray={`${strokeActive} ${circ}`} 
                      strokeDashoffset={-offsetActive} 
                    />
                  )}
                  {/* Maintenance (Orange) */}
                  {strokeMaint > 0 && (
                    <circle cx="60" cy="60" r="50" fill="transparent" 
                      stroke="var(--semantic-warning)" strokeWidth="12" 
                      strokeDasharray={`${strokeMaint} ${circ}`} 
                      strokeDashoffset={-offsetMaint} 
                    />
                  )}
                  {/* Retired (Red) */}
                  {strokeRetired > 0 && (
                    <circle cx="60" cy="60" r="50" fill="transparent" 
                      stroke="var(--semantic-danger)" strokeWidth="12" 
                      strokeDasharray={`${strokeRetired} ${circ}`} 
                      strokeDashoffset={-offsetRetired} 
                    />
                  )}
                </svg>
                <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--font-title)' }}>{totalVehicles}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Assets</span>
                </div>
              </>
            )}
          </div>
          
          <div style={chartStyles.legendGrid}>
            <div style={chartStyles.legendItem}>
              <span style={{ ...chartStyles.legendDot, backgroundColor: 'var(--semantic-success)' }}></span>
              <span>Available ({availableVehicles})</span>
            </div>
            <div style={chartStyles.legendItem}>
              <span style={{ ...chartStyles.legendDot, backgroundColor: 'var(--accent-primary)' }}></span>
              <span>On Trip ({activeVehicles})</span>
            </div>
            <div style={chartStyles.legendItem}>
              <span style={{ ...chartStyles.legendDot, backgroundColor: 'var(--semantic-warning)' }}></span>
              <span>In Shop ({inMaintenanceVehicles})</span>
            </div>
            <div style={chartStyles.legendItem}>
              <span style={{ ...chartStyles.legendDot, backgroundColor: 'var(--semantic-danger)' }}></span>
              <span>Retired ({retiredVehicles})</span>
            </div>
          </div>
        </div>

        {/* Bar Chart: Revenue vs Cost */}
        <div className="card">
          <h3 className="card-title">Top 5 Asset Performance ($)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '10px' }}>
            {topVehicles.map(v => {
              const rev = getVehicleRevenue(v.regNum);
              const cost = getVehicleCost(v.regNum);
              const pctRev = maxFinancialVal > 0 ? (rev / maxFinancialVal) * 100 : 0;
              const pctCost = maxFinancialVal > 0 ? (cost / maxFinancialVal) * 100 : 0;

              return (
                <div key={v.regNum} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700' }}>
                    <span>{v.regNum} ({v.name})</span>
                    <span style={{ color: 'var(--text-muted)' }}>Net: ${(rev - cost).toLocaleString()}</span>
                  </div>
                  {/* Revenue Bar (Green) */}
                  <div style={chartStyles.barRail}>
                    <div style={{ ...chartStyles.barFill, width: `${pctRev}%`, backgroundColor: 'var(--semantic-success)' }}></div>
                    <span style={chartStyles.barLabel}>Rev: ${rev.toLocaleString()}</span>
                  </div>
                  {/* Cost Bar (Red) */}
                  <div style={chartStyles.barRail}>
                    <div style={{ ...chartStyles.barFill, width: `${pctCost}%`, backgroundColor: 'var(--semantic-danger)' }}></div>
                    <span style={chartStyles.barLabel}>Cost: ${cost.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live SVG Dispatch Track Map */}
        <div className="card">
          <h3 className="card-title">Live Dispatch Tracking</h3>
          <div className="map-canvas">
            <svg width="100%" height="100%" viewBox="0 0 300 280" style={{ pointerEvents: 'none' }}>
              {/* Regional connection tracks */}
              <path d="M 50 60 Q 150 40 250 80" fill="transparent" stroke="var(--border-color)" strokeWidth="2" className="map-route-line" />
              <path d="M 50 60 Q 110 180 180 220" fill="transparent" stroke="var(--border-color)" strokeWidth="2" className="map-route-line" />
              <path d="M 250 80 Q 200 160 180 220" fill="transparent" stroke="var(--border-color)" strokeWidth="2" className="map-route-line" />
              <path d="M 120 120 L 250 80" fill="transparent" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4" />

              {/* Hub Depots */}
              <g className="map-node">
                <circle cx="50" cy="60" r="7" fill="var(--accent-primary)" />
                <circle cx="50" cy="60" r="12" fill="transparent" stroke="var(--accent-primary)" strokeWidth="2" opacity="0.4" />
                <text x="45" y="45" fill="var(--text-primary)" fontSize="9" fontWeight="700">North Hub</text>
              </g>

              <g className="map-node">
                <circle cx="250" cy="80" r="7" fill="var(--semantic-success)" />
                <circle cx="250" cy="80" r="12" fill="transparent" stroke="var(--semantic-success)" strokeWidth="2" opacity="0.4" />
                <text x="235" y="65" fill="var(--text-primary)" fontSize="9" fontWeight="700">East Hub</text>
              </g>

              <g className="map-node">
                <circle cx="180" cy="220" r="7" fill="var(--semantic-info)" />
                <circle cx="180" cy="220" r="12" fill="transparent" stroke="var(--semantic-info)" strokeWidth="2" opacity="0.4" />
                <text x="165" y="240" fill="var(--text-primary)" fontSize="9" fontWeight="700">South Hub</text>
              </g>

              {/* Animated active trucks moving along the route */}
              {activeVehicles > 0 && (
                <>
                  <circle r="4" fill="var(--accent-primary)">
                    <animateMotion dur="6s" repeatCount="indefinite" path="M 50 60 Q 150 40 250 80" />
                  </circle>
                  <circle r="4" fill="var(--semantic-success)">
                    <animateMotion dur="8s" repeatCount="indefinite" path="M 250 80 Q 200 160 180 220" />
                  </circle>
                </>
              )}
            </svg>

            {/* Float Info Box overlay */}
            <div style={chartStyles.mapOverlay}>
              <div style={{ fontSize: '11px', fontWeight: '700' }}>Telemetry Sync</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {activeVehicles} trucks transmitting live GPS.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Trips board */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Recent Dispatch Statuses</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => setView('trips')}>
            Go to Trip Dispatcher →
          </button>
        </div>
        
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="th">Trip ID</th>
                <th className="th">Source</th>
                <th className="th">Destination</th>
                <th className="th">Vehicle</th>
                <th className="th">Driver</th>
                <th className="th">Weight</th>
                <th className="th">Distance</th>
                <th className="th">Revenue</th>
                <th className="th">Status</th>
              </tr>
            </thead>
            <tbody>
              {trips.length === 0 ? (
                <tr>
                  <td className="td" colSpan="9" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No trips logged in the system.
                  </td>
                </tr>
              ) : (
                trips.slice().reverse().map(trip => (
                  <tr key={trip.id} className="tr-hover">
                    <td className="td" style={{ fontWeight: '700' }}>{trip.id.substring(0, 10)}</td>
                    <td className="td">{trip.source}</td>
                    <td className="td">{trip.destination}</td>
                    <td className="td">
                      <div style={{ fontWeight: '600' }}>{trip.vehicleReg}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{trip.vehicle?.name}</div>
                    </td>
                    <td className="td">
                      <div style={{ fontWeight: '600' }}>{trip.driver?.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{trip.driver?.licenseNum}</div>
                    </td>
                    <td className="td">{trip.cargoWeight.toLocaleString()} kg</td>
                    <td className="td">{trip.plannedDistance.toLocaleString()} km</td>
                    <td className="td" style={{ fontWeight: '700' }}>${trip.revenue?.toLocaleString()}</td>
                    <td className="td">
                      <span className={`badge badge-${
                        trip.status === 'Completed' ? 'success' :
                        trip.status === 'Dispatched' ? 'info' :
                        trip.status === 'Draft' ? 'secondary' : 'danger'
                      }`}>
                        {trip.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const chartStyles = {
  legendGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginTop: '16px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%'
  },
  barRail: {
    position: 'relative',
    height: '20px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '4px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center'
  },
  barFill: {
    height: '100%',
    transition: 'width 0.6s ease'
  },
  barLabel: {
    position: 'absolute',
    left: '8px',
    fontSize: '9px',
    fontWeight: '800',
    color: '#ffffff',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
  },
  mapOverlay: {
    position: 'absolute',
    bottom: '12px',
    left: '12px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '6px 10px',
    boxShadow: 'var(--shadow-md)',
    pointerEvents: 'none'
  }
};
