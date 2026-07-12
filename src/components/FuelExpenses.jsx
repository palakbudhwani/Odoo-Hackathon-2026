import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function FuelExpenses() {
  const {
    fuelLogs,
    expenses,
    vehicles,
    saveFuelLog,
    deleteFuelLog,
    saveExpense,
    deleteExpense,
    getVehicleCost,
    user,
    searchQuery
  } = useApp();

  // Active form toggles
  const [activeTab, setActiveTab] = useState('fuel'); // fuel, other, summary
  
  // Fuel form state
  const [fuelVehicle, setFuelVehicle] = useState('');
  const [fuelLiters, setFuelLiters] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [fuelDate, setFuelDate] = useState(new Date().toISOString().split('T')[0]);
  const [fuelError, setFuelError] = useState('');

  // Expense form state
  const [expVehicle, setExpVehicle] = useState('');
  const [expType, setExpType] = useState('Tolls');
  const [expCost, setExpCost] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expNotes, setExpNotes] = useState('');
  const [expError, setExpError] = useState('');

  // Modal control
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);

  // RBAC check
  const canModify = ['Fleet Manager', 'Financial Analyst'].includes(user.role);

  const handleSaveFuel = (e) => {
    e.preventDefault();
    setFuelError('');

    if (!fuelVehicle) return setFuelError('Please select a vehicle.');
    if (isNaN(fuelLiters) || Number(fuelLiters) <= 0) return setFuelError('Liters must be a positive number.');
    if (isNaN(fuelCost) || Number(fuelCost) <= 0) return setFuelError('Cost must be a positive number.');

    const res = saveFuelLog({
      vehicleReg: fuelVehicle,
      liters: Number(fuelLiters),
      cost: Number(fuelCost),
      date: fuelDate
    });

    if (res.success) {
      setFuelVehicle('');
      setFuelLiters('');
      setFuelCost('');
      setFuelDate(new Date().toISOString().split('T')[0]);
      setIsFuelModalOpen(false);
    } else {
      setFuelError(res.message);
    }
  };

  const handleSaveExpense = (e) => {
    e.preventDefault();
    setExpError('');

    if (!expVehicle) return setExpError('Please select a vehicle.');
    if (isNaN(expCost) || Number(expCost) <= 0) return setExpError('Cost must be a positive number.');

    const res = saveExpense({
      vehicleReg: expVehicle,
      type: expType,
      cost: Number(expCost),
      date: expDate,
      notes: expNotes
    });

    if (res.success) {
      setExpVehicle('');
      setExpCost('');
      setExpDate(new Date().toISOString().split('T')[0]);
      setExpNotes('');
      setIsExpModalOpen(false);
    } else {
      setExpError(res.message);
    }
  };

  const handleDeleteFuel = (id) => {
    if (window.confirm('Delete this fuel ticket record?')) {
      deleteFuelLog(id);
    }
  };

  const handleDeleteExpense = (id) => {
    if (window.confirm('Delete this expense ledger item?')) {
      deleteExpense(id);
    }
  };

  // Filter lists based on global navbar search
  const filteredFuel = fuelLogs.filter(f => 
    searchQuery === '' ||
    f.vehicleReg.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.date.includes(searchQuery)
  );

  const filteredExpenses = expenses.filter(e => 
    searchQuery === '' ||
    e.vehicleReg.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.notes?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex-between mb-24">
        <div>
          <h2 className="title-main">Fuel & Expense Management</h2>
          <p className="subtitle-main">Record fuel logs, toll fees, charging expenses, and monitor total fleet operations cost</p>
        </div>
        {canModify && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={() => setIsFuelModalOpen(true)}>
              ⛽ Log Fuel
            </button>
            <button className="btn btn-primary" onClick={() => setIsExpModalOpen(true)}>
              💵 Log Expense
            </button>
          </div>
        )}
      </div>

      {/* Tab controls */}
      <div style={styles.tabContainer}>
        <button 
          onClick={() => setActiveTab('fuel')}
          style={{ ...styles.tabButton, borderBottomColor: activeTab === 'fuel' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'fuel' ? 'var(--text-primary)' : 'var(--text-muted)' }}
        >
          Fuel Logs
        </button>
        <button 
          onClick={() => setActiveTab('expense')}
          style={{ ...styles.tabButton, borderBottomColor: activeTab === 'expense' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'expense' ? 'var(--text-primary)' : 'var(--text-muted)' }}
        >
          Other Expenses
        </button>
        <button 
          onClick={() => setActiveTab('summary')}
          style={{ ...styles.tabButton, borderBottomColor: activeTab === 'summary' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'summary' ? 'var(--text-primary)' : 'var(--text-muted)' }}
        >
          Cost Summary
        </button>
      </div>

      {/* Tab Panel: Fuel Logs */}
      {activeTab === 'fuel' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="th">Vehicle</th>
                <th className="th">Log Date</th>
                <th className="th">Liters Logged</th>
                <th className="th">Cost ($)</th>
                <th className="th">Avg Price ($/L)</th>
                {canModify && <th className="th" style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredFuel.length === 0 ? (
                <tr>
                  <td className="td" colSpan={canModify ? 6 : 5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No fuel logs found.
                  </td>
                </tr>
              ) : (
                filteredFuel.slice().reverse().map(f => (
                  <tr key={f.id} className="tr-hover">
                    <td className="td" style={{ fontWeight: '700' }}>{f.vehicleReg}</td>
                    <td className="td">{f.date}</td>
                    <td className="td">{f.liters.toLocaleString()} L</td>
                    <td className="td" style={{ fontWeight: '600' }}>${f.cost.toLocaleString()}</td>
                    <td className="td" style={{ color: 'var(--text-muted)' }}>
                      ${(f.cost / f.liters).toFixed(2)}/L
                    </td>
                    {canModify && (
                      <td className="td" style={{ textAlign: 'right' }}>
                        <button className="btn btn-danger btn-sm" style={{ padding: '4px 8px' }} onClick={() => handleDeleteFuel(f.id)}>
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Panel: Other Expenses */}
      {activeTab === 'expense' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="th">Vehicle</th>
                <th className="th">Expense Category</th>
                <th className="th">Date Logged</th>
                <th className="th">Cost ($)</th>
                <th className="th">Description / Notes</th>
                {canModify && <th className="th" style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td className="td" colSpan={canModify ? 6 : 5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No expenses found.
                  </td>
                </tr>
              ) : (
                filteredExpenses.slice().reverse().map(e => (
                  <tr key={e.id} className="tr-hover">
                    <td className="td" style={{ fontWeight: '700' }}>{e.vehicleReg}</td>
                    <td className="td">
                      <span className="badge badge-info">{e.type}</span>
                    </td>
                    <td className="td">{e.date}</td>
                    <td className="td" style={{ fontWeight: '600' }}>${e.cost.toLocaleString()}</td>
                    <td className="td" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {e.notes || '—'}
                    </td>
                    {canModify && (
                      <td className="td" style={{ textAlign: 'right' }}>
                        <button className="btn btn-danger btn-sm" style={{ padding: '4px 8px' }} onClick={() => handleDeleteExpense(e.id)}>
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Panel: Cost Summary */}
      {activeTab === 'summary' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {vehicles.map(v => {
            const fuelCost = fuelLogs.filter(f => f.vehicleReg === v.regNum).reduce((s, f) => s + f.cost, 0);
            const otherCost = expenses.filter(e => e.vehicleReg === v.regNum).reduce((s, e) => s + e.cost, 0);
            
            // Fetch maintenance cost (mockDb fetches maintenance records that are Completed)
            const repairCost = getVehicleCost(v.regNum) - fuelCost - otherCost;
            const maintCost = Math.max(0, repairCost); // Guarantee non-negative

            const totalOpCost = fuelCost + maintCost + otherCost;

            return (
              <div key={v.regNum} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <h4 style={{ margin: 0 }}>{v.regNum}</h4>
                  <span className={`badge badge-${
                    v.status === 'Available' ? 'success' :
                    v.status === 'On Trip' ? 'info' :
                    v.status === 'In Shop' ? 'warning' : 'danger'
                  }`}>{v.status}</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{v.name}</div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', marginTop: '4px' }}>
                  <div className="flex-between">
                    <span>⛽ Fuel Cost:</span>
                    <strong>${fuelCost.toLocaleString()}</strong>
                  </div>
                  <div className="flex-between">
                    <span>🔧 Maintenance Repairs:</span>
                    <strong>${maintCost.toLocaleString()}</strong>
                  </div>
                  <div className="flex-between">
                    <span>💳 Other Incidentals:</span>
                    <strong>${otherCost.toLocaleString()}</strong>
                  </div>
                  <div className="flex-between" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', fontSize: '14px', color: 'var(--accent-primary)' }}>
                    <span>Total Operational Cost:</span>
                    <strong>${totalOpCost.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fuel Log Modal */}
      {isFuelModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Log Fuel Ticket</h3>
              <button className="close-btn" onClick={() => setIsFuelModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSaveFuel}>
              <div className="modal-body">
                {fuelError && <div style={{ color: 'var(--semantic-danger)', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>⚠️ {fuelError}</div>}

                <div className="form-group">
                  <label className="form-label" htmlFor="fuel-vehicle-select">Select Vehicle</label>
                  <select
                    id="fuel-vehicle-select"
                    className="form-control"
                    value={fuelVehicle}
                    onChange={(e) => setFuelVehicle(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Vehicle --</option>
                    {vehicles.filter(v => v.status !== 'Retired').map(v => (
                      <option key={v.regNum} value={v.regNum}>{v.regNum} - {v.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="fuel-liters-input">Volume (Liters)</label>
                    <input
                      id="fuel-liters-input"
                      type="number"
                      className="form-control"
                      placeholder="e.g. 50"
                      value={fuelLiters}
                      onChange={(e) => setFuelLiters(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="fuel-cost-input">Total Cost ($)</label>
                    <input
                      id="fuel-cost-input"
                      type="number"
                      className="form-control"
                      placeholder="e.g. 75"
                      value={fuelCost}
                      onChange={(e) => setFuelCost(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="fuel-date-input">Fueling Date</label>
                  <input
                    id="fuel-date-input"
                    type="date"
                    className="form-control"
                    value={fuelDate}
                    onChange={(e) => setFuelDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsFuelModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {isExpModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Log Expense Ledger Item</h3>
              <button className="close-btn" onClick={() => setIsExpModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSaveExpense}>
              <div className="modal-body">
                {expError && <div style={{ color: 'var(--semantic-danger)', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>⚠️ {expError}</div>}

                <div className="form-group">
                  <label className="form-label" htmlFor="exp-vehicle-select">Select Vehicle</label>
                  <select
                    id="exp-vehicle-select"
                    className="form-control"
                    value={expVehicle}
                    onChange={(e) => setExpVehicle(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Vehicle --</option>
                    {vehicles.filter(v => v.status !== 'Retired').map(v => (
                      <option key={v.regNum} value={v.regNum}>{v.regNum} - {v.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="exp-type-select">Expense Category</label>
                    <select
                      id="exp-type-select"
                      className="form-control"
                      value={expType}
                      onChange={(e) => setExpType(e.target.value)}
                    >
                      <option value="Tolls">Toll Charge</option>
                      <option value="Charging Fee">EV Charging Fee</option>
                      <option value="Permit">Road Permit</option>
                      <option value="Insurance">Insurance Surcharge</option>
                      <option value="Cleaning">Fleet Cleaning</option>
                      <option value="Other">Other Miscellaneous</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="exp-cost-input">Total Cost ($)</label>
                    <input
                      id="exp-cost-input"
                      type="number"
                      className="form-control"
                      placeholder="e.g. 25"
                      value={expCost}
                      onChange={(e) => setExpCost(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="exp-date-input">Transaction Date</label>
                  <input
                    id="exp-date-input"
                    type="date"
                    className="form-control"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="exp-notes-input">Expense Description</label>
                  <input
                    id="exp-notes-input"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Lincoln Tunnel EZ-Pass toll"
                    value={expNotes}
                    onChange={(e) => setExpNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsExpModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  tabContainer: {
    display: 'flex',
    gap: '24px',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '24px',
    paddingBottom: '2px'
  },
  tabButton: {
    background: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    padding: '8px 4px 12px 4px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '700',
    fontFamily: 'var(--font-primary)',
    transition: 'all var(--transition-fast)'
  }
};
