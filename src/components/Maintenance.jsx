import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Maintenance() {
  const {
    maintenance,
    vehicles,
    saveMaintenanceLog,
    closeMaintenance,
    deleteMaintenanceLog,
    user,
    searchQuery
  } = useApp();

  // Maintenance form state
  const [vehicleReg, setVehicleReg] = useState('');
  const [type, setType] = useState('Oil Change');
  const [cost, setCost] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('In Progress');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [editingLogId, setEditingLogId] = useState(null);

  // Close maintenance state (Modal)
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [closingLog, setClosingLog] = useState(null);
  const [finalCost, setFinalCost] = useState('');
  const [closeError, setCloseError] = useState('');

  // Local filters
  const [statusFilter, setStatusFilter] = useState('all');

  // RBAC Access Check
  const canModify = ['Fleet Manager', 'Safety Officer'].includes(user.role);

  // Vehicles list for selection
  // In Shop, Retired, or On Trip: Actually, we can schedule maintenance for any non-retired vehicle.
  // Note: Only vehicles that are NOT Retired should be scheduled for maintenance.
  const eligibleVehicles = vehicles.filter(v => v.status !== 'Retired');

  const handleResetForm = () => {
    setEditingLogId(null);
    setVehicleReg('');
    setType('Oil Change');
    setCost('');
    setDate(new Date().toISOString().split('T')[0]);
    setStatus('In Progress');
    setNotes('');
    setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!vehicleReg) return setFormError('Please select a vehicle.');
    if (!type) return setFormError('Maintenance type is required.');
    if (!date) return setFormError('Date is required.');
    if (cost && (isNaN(cost) || Number(cost) < 0)) return setFormError('Cost must be a positive number.');

    const logData = {
      id: editingLogId,
      vehicleReg,
      type,
      cost: Number(cost || 0),
      date,
      status,
      notes: notes.trim()
    };

    const res = saveMaintenanceLog(logData);
    if (res.success) {
      handleResetForm();
    } else {
      setFormError(res.message);
    }
  };

  const handleEditClick = (log) => {
    setEditingLogId(log.id);
    setVehicleReg(log.vehicleReg);
    setType(log.type);
    setCost(log.cost.toString());
    setDate(log.date);
    setStatus(log.status);
    setNotes(log.notes || '');
    setFormError('');
  };

  const handleOpenCloseModal = (log) => {
    setClosingLog(log);
    setFinalCost(log.cost.toString());
    setCloseError('');
    setIsCloseModalOpen(true);
  };

  const handleConfirmClose = (e) => {
    e.preventDefault();
    setCloseError('');

    if (isNaN(finalCost) || Number(finalCost) < 0) {
      return setCloseError('Final cost must be a non-negative number.');
    }

    const res = closeMaintenance(closingLog.id, Number(finalCost));
    if (res.success) {
      setIsCloseModalOpen(false);
      setClosingLog(null);
    } else {
      setCloseError(res.message);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this maintenance record?')) {
      const res = deleteMaintenanceLog(id);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  // Filter & Search Logic
  const filteredMaintenance = maintenance.filter(log => {
    const matchesSearch = searchQuery === '' ||
      log.vehicleReg.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.notes?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="flex-between mb-24">
        <div>
          <h2 className="title-main">Maintenance Logs</h2>
          <p className="subtitle-main">Schedule vehicle repairs, inspect active shop statuses, and track historical maintenance costs</p>
        </div>
      </div>

      <div className="grid-layout">
        {/* Left Panel - Log form */}
        <div>
          {canModify ? (
            <div className="card">
              <h3 className="card-title">
                {editingLogId ? 'Modify Work Order' : 'Log Maintenance Record'}
              </h3>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {formError && (
                  <div style={{ color: 'var(--semantic-danger)', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
                    ⚠️ {formError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="vehicleReg-select">Vehicle Registration</label>
                  <select
                    id="vehicleReg-select"
                    className="form-control"
                    value={vehicleReg}
                    onChange={(e) => setVehicleReg(e.target.value)}
                    required
                    disabled={!!editingLogId} // Block changing vehicle on edit
                  />
                  <option value="">-- Choose Vehicle --</option>
                  {eligibleVehicles.map(v => (
                    <option key={v.regNum} value={v.regNum}>
                      {v.regNum} - {v.name} (Status: {v.status})
                    </option>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="type-select">Maintenance Type</label>
                    <select
                      id="type-select"
                      className="form-control"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      <option value="Oil Change">Oil Change</option>
                      <option value="Tire Replacement">Tire Replacement</option>
                      <option value="Brake Overhaul">Brake Overhaul</option>
                      <option value="Engine Repair">Engine Repair</option>
                      <option value="Transmission Service">Transmission Service</option>
                      <option value="Electrical Inspection">Electrical Inspection</option>
                      <option value="Body Work">Body Work</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="maintenance-cost-input">Estimated Cost ($)</label>
                    <input
                      id="maintenance-cost-input"
                      type="number"
                      className="form-control"
                      placeholder="e.g. 500"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="maintenance-date-input">Log Date</label>
                    <input
                      id="maintenance-date-input"
                      type="date"
                      className="form-control"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="maintenance-status-select">Status</label>
                    <select
                      id="maintenance-status-select"
                      className="form-control"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="In Progress">In Progress (In Shop)</option>
                      <option value="Completed">Completed (Available)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="maintenance-notes-textarea">Technician Notes</label>
                  <textarea
                    id="maintenance-notes-textarea"
                    rows="3"
                    className="form-control"
                    placeholder="Details about issue and parts replaced..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  ></textarea>
                </div>

                <div className="flex-between mt-12">
                  {editingLogId && (
                    <button type="button" className="btn btn-secondary" onClick={handleResetForm}>
                      Cancel
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary" style={{ marginLeft: 'auto' }}>
                    {editingLogId ? 'Update Record' : 'Log Record'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="card">
              <h3 className="card-title">Access Restricted</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Your current role (<strong>{user.role}</strong>) does not have access permissions to log new vehicle repairs or close maintenance tickets. 
                Please contact a Fleet Manager or Safety Officer.
              </p>
            </div>
          )}
        </div>

        {/* Right Panel - Maintenance list */}
        <div>
          <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="flex-between mb-12">
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Active Work Orders</h3>

              <select
                id="maintenance-status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              >
                <option value="all">All Orders</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '520px' }}>
              {filteredMaintenance.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No maintenance work orders found matching filters.
                </div>
              ) : (
                filteredMaintenance.slice().reverse().map(log => {
                  const isInProgress = log.status === 'In Progress';
                  
                  return (
                    <div 
                      key={log.id} 
                      className="card" 
                      style={{ 
                        padding: '16px',
                        borderLeft: `4px solid ${isInProgress ? 'var(--semantic-warning)' : 'var(--semantic-success)'}`
                      }}
                    >
                      <div className="flex-between mb-12">
                        <span style={{ fontWeight: '800', fontSize: '12px', fontFamily: 'monospace' }}>
                          ORDER #{log.id.substring(6, 12).toUpperCase()}
                        </span>
                        <span className={`badge badge-${isInProgress ? 'warning' : 'success'}`}>
                          {log.status}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', marginBottom: '12px' }}>
                        <div>Vehicle: <strong style={{ color: 'var(--accent-primary)' }}>{log.vehicleReg}</strong></div>
                        <div>Work Done: <strong>{log.type}</strong></div>
                        <div>Date Logged: <span>{log.date}</span></div>
                        <div>Expense: <strong>${log.cost.toLocaleString()}</strong></div>
                        {log.notes && (
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)', padding: '6px', borderRadius: '4px', marginTop: '6px' }}>
                            💬 {log.notes}
                          </div>
                        )}
                      </div>

                      {canModify && (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                          {isInProgress && (
                            <>
                              <button className="btn btn-secondary btn-sm" onClick={() => handleEditClick(log)}>
                                Edit Notes
                              </button>
                              <button className="btn btn-success btn-sm" onClick={() => handleOpenCloseModal(log)}>
                                Close Work Order ✓
                              </button>
                            </>
                          )}
                          {!isInProgress && (
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(log.id)}>
                              Delete File
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Close Maintenance Modal (Record final repair cost) */}
      {isCloseModalOpen && closingLog && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Finalize Repair Ticket</h3>
              <button className="close-btn" onClick={() => setIsCloseModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleConfirmClose}>
              <div className="modal-body">
                {closeError && (
                  <div style={{ color: 'var(--semantic-danger)', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
                    ⚠️ {closeError}
                  </div>
                )}

                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
                  <div>Vehicle: <strong>{closingLog.vehicleReg}</strong></div>
                  <div>Repair: <strong>{closingLog.type}</strong></div>
                  <div>Logged Cost: <strong>${closingLog.cost.toLocaleString()}</strong></div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="finalCost-input">Final Repair Invoice Cost ($)</label>
                  <input
                    id="finalCost-input"
                    type="number"
                    className="form-control"
                    placeholder="Enter final cost"
                    value={finalCost}
                    onChange={(e) => setFinalCost(e.target.value)}
                    required
                  />
                  <small style={{ display: 'block', marginTop: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    Closing this order restores the vehicle back to <strong>Available</strong> status for new dispatches.
                  </small>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCloseModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Complete Repair & Release
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
