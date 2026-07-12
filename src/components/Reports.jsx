import React from 'react';
import { useApp } from '../context/AppContext';

export default function Reports() {
  const {
    vehicles,
    trips,
    fuelLogs,
    expenses,
    getVehicleCost,
    getVehicleRevenue,
    getVehicleDistance,
    getVehicleFuelLiters
  } = useApp();

  // Fleet Overall Statistics
  const totalVehiclesCount = vehicles.filter(v => v.status !== 'Retired').length;
  const activeVehiclesCount = vehicles.filter(v => v.status === 'On Trip').length;
  const totalFleetUtilization = totalVehiclesCount > 0 
    ? Math.round((activeVehiclesCount / totalVehiclesCount) * 100) 
    : 0;

  // Fleet Financial Aggregations
  const totalFleetRevenue = vehicles.reduce((sum, v) => sum + getVehicleRevenue(v.regNum), 0);
  const totalFleetCost = vehicles.reduce((sum, v) => sum + getVehicleCost(v.regNum), 0);
  const totalFleetProfit = totalFleetRevenue - totalFleetCost;

  // Fleet Distance and Fuel
  const totalDistance = vehicles.reduce((sum, v) => sum + getVehicleDistance(v.regNum), 0);
  const totalFuelLiters = vehicles.reduce((sum, v) => sum + getVehicleFuelLiters(v.regNum), 0);
  const totalFuelEfficiency = totalFuelLiters > 0 
    ? (totalDistance / totalFuelLiters).toFixed(2) 
    : '0.00';

  // ROI calculation for each vehicle
  // ROI = (Revenue - (Maintenance + Fuel + Expenses)) / Acquisition Cost
  const vehiclesReport = vehicles.map(v => {
    const revenue = getVehicleRevenue(v.regNum);
    const opCost = getVehicleCost(v.regNum);
    const netProfit = revenue - opCost;
    const acqCost = v.acquisitionCost || 1; // avoid division by 0
    const roiVal = (netProfit / acqCost) * 100;
    const distance = getVehicleDistance(v.regNum);
    const fuelLiters = getVehicleFuelLiters(v.regNum);
    const fuelEfficiency = fuelLiters > 0 ? (distance / fuelLiters).toFixed(2) : '0.00';

    return {
      regNum: v.regNum,
      name: v.name,
      type: v.type,
      acquisitionCost: v.acquisitionCost,
      status: v.status,
      distance,
      fuelLiters,
      fuelEfficiency,
      revenue,
      opCost,
      netProfit,
      roi: roiVal
    };
  });

  // CSV Export trigger
  const exportCSV = () => {
    const headers = [
      'Registration Number',
      'Model Name',
      'Type',
      'Status',
      'Distance Traveled (km)',
      'Fuel Logged (L)',
      'Fuel Efficiency (km/L)',
      'Acquisition Cost ($)',
      'Revenue Generated ($)',
      'Total Expenses ($)',
      'Net Profit ($)',
      'ROI (%)'
    ];

    const rows = vehiclesReport.map(v => [
      v.regNum,
      `"${v.name}"`,
      v.type,
      v.status,
      v.distance,
      v.fuelLiters,
      v.fuelEfficiency,
      v.acquisitionCost,
      v.revenue,
      v.opCost,
      v.netProfit,
      v.roi.toFixed(1)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TransitOps_Fleet_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF print trigger
  const triggerPrint = () => {
    try {
      const printWindow = window.open('', '', 'height=600,width=1100');
      
      if (!printWindow) {
        alert('Please allow popups to use the print feature');
        return;
      }

      const reportRows = vehiclesReport.map((v) => {
        const isNegative = v.netProfit < 0;
        return `
          <tr>
            <td>${v.regNum}</td>
            <td>${v.name}</td>
            <td>${v.distance.toLocaleString()} km</td>
            <td>${v.fuelLiters.toLocaleString()} L</td>
            <td>${v.fuelEfficiency} km/L</td>
            <td>$${v.acquisitionCost.toLocaleString()}</td>
            <td>-$${v.opCost.toLocaleString()}</td>
            <td>+$${v.revenue.toLocaleString()}</td>
            <td>${isNegative ? '-' : '+'}$${Math.abs(v.netProfit).toLocaleString()}</td>
            <td>${v.roi.toFixed(1)}%</td>
          </tr>
        `;
      }).join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>TransitOps Fleet Performance Audit</title>
            <style>
              * { margin: 0; padding: 0; }
              body { font-family: 'Segoe UI', Arial, sans-serif; color: #111827; padding: 32px; background: white; }
              h1 { margin: 0 0 12px; font-size: 28px; font-weight: 700; }
              .header-info { margin: 0 0 24px; color: #4b5563; font-size: 13px; }
              .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
              .card { border: 1px solid #d1d5db; border-radius: 8px; padding: 16px; background: #fafbfc; }
              .label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
              .value { margin-top: 8px; font-size: 24px; font-weight: 700; color: #111827; }
              table { width: 100%; border-collapse: collapse; margin-top: 12px; }
              th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; font-size: 12px; }
              th { background: #f3f4f6; font-weight: 600; }
              tr:nth-child(even) { background: #f9fafb; }
              @media print {
                body { padding: 16px; }
                .summary { margin-bottom: 24px; }
                table { font-size: 11px; }
              }
            </style>
          </head>
          <body>
            <h1>TransitOps Fleet Performance Audit</h1>
            <div class="header-info">Report Date: ${new Date().toLocaleDateString()} • Generated by TransitOps Platform</div>
            
            <div class="summary">
              <div class="card">
                <div class="label">Fleet ROI</div>
                <div class="value">${totalFleetRevenue > 0 ? ((totalFleetProfit / vehicles.reduce((s, v) => s + v.acquisitionCost, 0)) * 100).toFixed(1) : '0.0'}%</div>
              </div>
              <div class="card">
                <div class="label">Total Net Income</div>
                <div class="value">$${totalFleetProfit.toLocaleString()}</div>
              </div>
              <div class="card">
                <div class="label">Fuel Efficiency</div>
                <div class="value">${totalFuelEfficiency} km/L</div>
              </div>
              <div class="card">
                <div class="label">Active Utilization</div>
                <div class="value">${totalFleetUtilization}%</div>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Reg Number</th>
                  <th>Model Name</th>
                  <th>Distance</th>
                  <th>Fuel Logged</th>
                  <th>Efficiency</th>
                  <th>Acquisition Cost</th>
                  <th>Operational Cost</th>
                  <th>Total Revenue</th>
                  <th>Net Income</th>
                  <th>ROI</th>
                </tr>
              </thead>
              <tbody>${reportRows}</tbody>
            </table>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };

      // Fallback for slower systems
      setTimeout(() => {
        if (printWindow && !printWindow.closed) {
          printWindow.focus();
          printWindow.print();
        }
      }, 800);
    } catch (error) {
      console.error('Print error:', error);
      alert('Error opening print dialog. Please try again.');
    }
  };

  return (
    <div>
      <div className="flex-between mb-24 no-print">
        <div>
          <h2 className="title-main">Reports & Fleet Analytics</h2>
          <p className="subtitle-main">Compute operational ROI metrics, analyze fuel statistics, and generate spreadsheets</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={triggerPrint}>
            Print / Save as PDF 🖨️
          </button>
          <button className="btn btn-primary" onClick={exportCSV}>
            Export CSV Spreadsheet 📊
          </button>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="print-only" style={styles.printHeader}>
        <h1>TransitOps Fleet Performance Audit</h1>
        <p>Report Date: {new Date().toLocaleDateString()} • Generated by TransitOps Platform</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid mb-24">
        <div className="kpi-card">
          <div className="kpi-label">Fleet ROI</div>
          <div className="kpi-value" style={{ color: totalFleetProfit >= 0 ? 'var(--semantic-success)' : 'var(--semantic-danger)' }}>
            {totalFleetRevenue > 0 
              ? ((totalFleetProfit / vehicles.reduce((s, v) => s + v.acquisitionCost, 0)) * 100).toFixed(1) 
              : '0.0'}%
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Total Net Income</div>
          <div className="kpi-value" style={{ color: totalFleetProfit >= 0 ? 'var(--semantic-success)' : 'var(--semantic-danger)' }}>
            ${totalFleetProfit.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Rev: ${totalFleetRevenue.toLocaleString()} • OpEx: ${totalFleetCost.toLocaleString()}
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label font-bold">Fuel Efficiency</div>
          <div className="kpi-value">{totalFuelEfficiency} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>km/L</span></div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Dist: {totalDistance.toLocaleString()}km • Liters: {totalFuelLiters.toLocaleString()}L
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Active Utilization</div>
          <div className="kpi-value">{totalFleetUtilization}%</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {activeVehiclesCount} of {totalVehiclesCount} non-retired vehicles active
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid-cols-2 mb-24 no-print">
        {/* SVG Horizontal ROI bar chart */}
        <div className="card">
          <h3 className="card-title">Return on Investment (ROI %) by Vehicle</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '220px', justifyContent: 'center' }}>
            {vehiclesReport.map(v => {
              const maxRoi = Math.max(...vehiclesReport.map(vr => Math.abs(vr.roi)), 10);
              const barWidth = Math.min(100, Math.max(0, (v.roi / maxRoi) * 80));
              const isNegative = v.roi < 0;

              return (
                <div key={v.regNum} style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ width: '70px', fontWeight: '700' }}>{v.regNum}</span>
                  <div style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', height: '14px', borderRadius: '3px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${barWidth}%`,
                      backgroundColor: isNegative ? 'var(--semantic-danger)' : 'var(--semantic-success)',
                      borderRadius: '3px',
                      transition: 'width 0.5s ease'
                    }}></div>
                  </div>
                  <span style={{ width: '60px', textAlign: 'right', fontWeight: '700', color: isNegative ? 'var(--semantic-danger)' : 'var(--semantic-success)' }}>
                    {v.roi.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* SVG Line / Plot Chart: Distance vs Fuel Efficiency */}
        <div className="card">
          <h3 className="card-title">Distance vs Fuel Consumption</h3>
          <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg className="svg-chart" width="100%" height="100%" viewBox="0 0 300 180">
              {/* Axes */}
              <line x1="30" y1="150" x2="280" y2="150" stroke="var(--border-color)" strokeWidth="2" />
              <line x1="30" y1="10" x2="30" y2="150" stroke="var(--border-color)" strokeWidth="2" />

              {/* Data points */}
              {vehiclesReport.filter(v => v.distance > 0).map((v, i) => {
                const maxDist = Math.max(...vehiclesReport.map(vr => vr.distance), 1000);
                const maxFuel = Math.max(...vehiclesReport.map(vr => vr.fuelLiters), 200);

                const x = 30 + (v.distance / maxDist) * 230;
                const y = 150 - (v.fuelLiters / maxFuel) * 130;

                const nodeColors = ['#4f46e5', '#10b981', '#f59e0b', '#06b6d4', '#ec4899'];
                const color = nodeColors[i % nodeColors.length];

                return (
                  <g key={v.regNum}>
                    <circle cx={x} cy={y} r="6" fill={color} />
                    <text x={x + 8} y={y + 3} fontSize="8" fontWeight="700" fill="var(--text-primary)">{v.regNum}</text>
                  </g>
                );
              })}

              <text x="140" y="170" fill="var(--text-muted)" fontSize="9" fontWeight="700">Distance Traveled ➔</text>
              <text x="10" y="80" transform="rotate(-90 10 80)" fill="var(--text-muted)" fontSize="9" fontWeight="700">Fuel Liters ➔</text>
            </svg>
          </div>
        </div>
      </div>

      {/* Asset Performance Summary Table */}
      <div className="card">
        <h3 className="card-title">Asset Operational Auditing Matrix</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="th">Reg Number</th>
                <th className="th">Model Name</th>
                <th className="th">Distance</th>
                <th className="th">Fuel Logged</th>
                <th className="th">Efficiency</th>
                <th className="th">Acquisition Cost</th>
                <th className="th">Operational cost</th>
                <th className="th">Total Revenue</th>
                <th className="th">Net Income</th>
                <th className="th">ROI</th>
              </tr>
            </thead>
            <tbody>
              {vehiclesReport.map(v => {
                const isNegative = v.netProfit < 0;
                
                return (
                  <tr key={v.regNum} className="tr-hover">
                    <td className="td" style={{ fontWeight: '700' }}>{v.regNum}</td>
                    <td className="td" style={{ fontWeight: '600' }}>{v.name}</td>
                    <td className="td">{v.distance.toLocaleString()} km</td>
                    <td className="td">{v.fuelLiters.toLocaleString()} L</td>
                    <td className="td" style={{ fontWeight: '700' }}>{v.fuelEfficiency} km/L</td>
                    <td className="td">${v.acquisitionCost.toLocaleString()}</td>
                    <td className="td" style={{ color: 'var(--semantic-danger)', fontWeight: '600' }}>
                      -${v.opCost.toLocaleString()}
                    </td>
                    <td className="td" style={{ color: 'var(--semantic-success)', fontWeight: '600' }}>
                      +${v.revenue.toLocaleString()}
                    </td>
                    <td className="td" style={{
                      fontWeight: '700',
                      color: isNegative ? 'var(--semantic-danger)' : 'var(--semantic-success)'
                    }}>
                      {isNegative ? '-' : '+'}${Math.abs(v.netProfit).toLocaleString()}
                    </td>
                    <td className="td">
                      <span className={`badge badge-${v.roi >= 0 ? 'success' : 'danger'}`}>
                        {v.roi.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print-only CSS declarations */}
      <style>{`
        .print-only {
          display: none;
        }
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .app-container {
            display: block !important;
          }
          .main-content {
            margin-left: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }
          .page-container {
            padding: 0 !important;
            max-width: 100% !important;
          }
          .card {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin-bottom: 24px !important;
            background: transparent !important;
          }
          .table-container {
            border: 1px solid #ccc !important;
            border-radius: 0 !important;
          }
          .th {
            background-color: #f1f5f9 !important;
            color: black !important;
            border-bottom: 1px solid #ccc !important;
          }
          .td {
            border-bottom: 1px solid #eee !important;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  printHeader: {
    marginBottom: '30px',
    textAlign: 'center',
    borderBottom: '2px solid #333',
    paddingBottom: '10px',
    h1: {
      fontSize: '24px',
      margin: 0
    },
    p: {
      fontSize: '12px',
      color: '#666',
      margin: '4px 0 0 0'
    }
  }
};
