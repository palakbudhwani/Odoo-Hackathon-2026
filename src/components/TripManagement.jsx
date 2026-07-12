import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { isLicenseExpired } from '../data/mockDb';

export default function TripManagement() {
  const {
    trips,
    vehicles,
    drivers,
    saveTrip,
    dispatchTrip,
    completeTrip,
    cancelTrip,
    user,
    searchQuery,
    settings
  } = useApp();

  // Create/Edit Trip Form State
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [vehicleReg, setVehicleReg] = useState('');
  const [driverId, setDriverId] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [plannedDistance, setPlannedDistance] = useState('');
  const [revenue, setRevenue] = useState('');
  const [status, setStatus] = useState('Draft');
  
  // Validation messages
  const [formError, setFormError] = useState('');
  const [editingTripId, setEditingTripId] = useState(null);

  // Complete Trip Form State (Modal)
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [completingTrip, setCompletingTrip] = useState(null);
  const [finalOdometer, setFinalOdometer] = useState('');
  const [fuelConsumed, setFuelConsumed] = useState('');
  const [completeError, setCompleteError] = useState('');

  // Local Filter state
  const [statusFilter, setStatusFilter] = useState('all');

  // RBAC Access Check
  const canModify = ['Fleet Manager', 'Dispatcher'].includes(user.role);

  // Filter lists of vehicles/drivers to only display eligible ones in dropdowns
  // Rule: In Shop, Retired, or currently On Trip vehicles must NOT appear in the selection list.
  const eligibleVehicles = vehicles.filter(v => {
    // If editing a trip, let its currently assigned vehicle be selectable
    if (editingTripId) {
      const activeTrip = trips.find(t => t.id === editingTripId);
      if (activeTrip && activeTrip.vehicleReg === v.regNum) return true;
    }
    return v.status === 'Available';
  });

  // Rule: Drivers with expired licenses, Suspended status, or currently On Trip must NOT appear.
  const eligibleDrivers = drivers.filter(d => {
    // If editing a trip, let its currently assigned driver be selectable
    if (editingTripId) {
      const activeTrip = trips.find(t => t.id === editingTripId);
      if (activeTrip && activeTrip.driverId === d.id) return true;
    }
    const expired = isLicenseExpired(d.expiryDate);
    const suspended = d.status === 'Suspended';
    const busy = d.status === 'On Trip';
    return d.status !== 'Suspended' && d.status !== 'On Trip' && !expired;
  });

  // Capacity Limit validation check
  const selectedVehicle = vehicles.find(v => v.regNum === vehicleReg);
  const selectedDriver = drivers.find(d => d.id === driverId);
  const exceedsCapacity = selectedVehicle && cargoWeight && Number(cargoWeight) > selectedVehicle.maxCapacity;

  const handleCargoChange = (e) => {
    const val = e.target.value;
    setCargoWeight(val);
    setFormError('');
  };

  const handleDistanceChange = (e) => {
    const val = e.target.value;
    setPlannedDistance(val);
    // Auto-calculate suggested revenue if not custom entered
    if (val && !isNaN(val)) {
      setRevenue((Number(val) * (settings.revenuePerKm || 3.00)).toFixed(0));
    } else {
      setRevenue('');
    }
  };

  const handleResetForm = () => {
    setEditingTripId(null);
    setSource('');
    setDestination('');
    setVehicleReg('');
    setDriverId('');
    setCargoWeight('');
    setPlannedDistance('');
    setRevenue('');
    setStatus('Draft');
    setFormError('');
  };

  const handleCreateOrEditTrip = (e) => {
    e.preventDefault();
    setFormError('');

    if (!source.trim() || !destination.trim()) {
      return setFormError('Source and Destination are required.');
    }
    if (!vehicleReg) {
      return setFormError('Please select a vehicle.');
    }
    if (!driverId) {
      return setFormError('Please select an available driver.');
    }
    if (isNaN(cargoWeight) || Number(cargoWeight) <= 0) {
      return setFormError('Cargo weight must be a positive number.');
    }
    if (isNaN(plannedDistance) || Number(plannedDistance) <= 0) {
      return setFormError('Planned distance must be a positive number.');
    }

    // Business Rule Check: Weight Capacity
    if (Number(cargoWeight) > selectedVehicle.maxCapacity) {
      return setFormError(`Cargo weight (${cargoWeight} kg) exceeds vehicle maximum capacity (${selectedVehicle.maxCapacity} kg).`);
    }

    // Business Rule Check: Driver Expiry
    if (selectedDriver && isLicenseExpired(selectedDriver.expiryDate)) {
      return setFormError(`Selected driver license has expired on ${selectedDriver.expiryDate}.`);
    }

    const tripData = {
      id: editingTripId,
      source: source.trim(),
      destination: destination.trim(),
      vehicleReg,
      driverId,
      cargoWeight: Number(cargoWeight),
      plannedDistance: Number(plannedDistance),
      revenue: Number(revenue || (plannedDistance * (settings.revenuePerKm || 3.00))),
      status
    };

    const res = saveTrip(tripData);
    if (res.success) {
      handleResetForm();
    } else {
      setFormError(res.message);
    }
  };

  const handleEditClick = (trip) => {
    setEditingTripId(trip.id);
    setSource(trip.source);
    setDestination(trip.destination);
    setVehicleReg(trip.vehicleReg);
    setDriverId(trip.driverId);
    setCargoWeight(trip.cargoWeight.toString());
    setPlannedDistance(trip.plannedDistance.toString());
    setRevenue(trip.revenue?.toString() || '');
    setStatus(trip.status);
    setFormError('');
  };

  const handleDispatch = (tripId) => {
    const res = dispatchTrip(tripId);
    if (!res.success) {
      alert(res.message);
    }
  };

  const handleOpenCompleteModal = (trip) => {
    setCompletingTrip(trip);
    setFinalOdometer(trip.vehicle?.odometer || '');
    setFuelConsumed('');
    setCompleteError('');
    setIsCompleteModalOpen(true);
  };

  const handleConfirmComplete = (e) => {
    e.preventDefault();
    setCompleteError('');

    if (isNaN(finalOdometer) || Number(finalOdometer) <= 0) {
      return setCompleteError('Please enter a valid final odometer reading.');
    }

    const startOdometer = completingTrip.vehicle?.odometer || 0;
    if (Number(finalOdometer) < startOdometer) {
      return setCompleteError(`Final odometer cannot be less than starting odometer (${startOdometer} km).`);
    }

    if (fuelConsumed && (isNaN(fuelConsumed) || Number(fuelConsumed) < 0)) {
      return setCompleteError('Fuel consumed must be a non-negative number.');
    }

    const res = completeTrip(completingTrip.id, Number(finalOdometer), Number(fuelConsumed || 0));
    if (res.success) {
      setIsCompleteModalOpen(false);
      setCompletingTrip(null);
    } else {
      setCompleteError(res.message);
    }
  };

  const handleCancel = (tripId) => {
    if (window.confirm('Are you sure you want to cancel this trip dispatcher card? This will release the vehicle and driver.')) {
      const res = cancelTrip(tripId);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  // Filtered trips
  const filteredTrips = trips.filter(t => {
    const matchesSearch = searchQuery === '' ||
      t.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.vehicleReg.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.driver?.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="flex-between mb-24">
        <div>
          <h2 className="title-main">Trip Dispatcher</h2>
          <p className="subtitle-main">Create delivery manifests, assign assets, check capacity loads, and dispatch drivers</p>
        </div>
      </div>

      <div className="grid-layout">
        {/* Left Side - Booking Form */}
        <div>
          {canModify ? (
            <div className="card">
              <h3 className="card-title">
                {editingTripId ? 'Modify Active Dispatch' : 'Schedule New Manifest'}
              </h3>
              
              <form onSubmit={handleCreateOrEditTrip} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {formError && (
                  <div style={{ color: 'var(--semantic-danger)', fontSize: '13px', fontWeight: '600', backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: '10px', borderRadius: '6px' }}>
                    ⚠️ {formError}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="source-input">Source Location</label>
                    <input
                      id="source-input"
                      type="text"
                      className="form-control"
                      placeholder="e.g. Chicago Hub"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="destination-input">Destination Location</label>
                    <input
                      id="destination-input"
                      type="text"
                      className="form-control"
                      placeholder="e.g. New York Depot"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="vehicleReg-select">Assign Vehicle</label>
                    <select
                      id="vehicleReg-select"
                      className="form-control"
                      value={vehicleReg}
                      onChange={(e) => {
                        setVehicleReg(e.target.value);
                        setFormError('');
                      }}
                      required
                    >
                      <option value="">-- Choose Available Vehicle --</option>
                      {eligibleVehicles.map(v => (
                        <option key={v.regNum} value={v.regNum}>
                          {v.regNum} - {v.name} (Cap: {v.maxCapacity}kg)
                        </option>
                      ))}
                    </select>
                    {selectedVehicle && (
                      <small style={{ display: 'block', marginTop: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                        Odometer: {selectedVehicle.odometer} km • Max Load: {selectedVehicle.maxCapacity} kg
                      </small>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="driverId-select">Assign Driver</label>
                    <select
                      id="driverId-select"
                      className="form-control"
                      value={driverId}
                      onChange={(e) => setDriverId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Available Driver --</option>
                      {eligibleDrivers.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name} (CDL: {d.category} • Safety: {d.safetyScore}%)
                        </option>
                      ))}
                    </select>
                    {selectedDriver && (
                      <small style={{ display: 'block', marginTop: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                        Contact: {selectedDriver.contact} • License Expiry: {selectedDriver.expiryDate}
                      </small>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="cargoWeight-input">Cargo Weight (kg)</label>
                    <input
                      id="cargoWeight-input"
                      type="number"
                      className={`form-control ${exceedsCapacity ? 'form-control-error' : ''}`}
                      placeholder="e.g. 1200"
                      value={cargoWeight}
                      onChange={handleCargoChange}
                      required
                    />
                    {exceedsCapacity && (
                      <span className="form-error-msg">
                        Exceeds vehicle capacity! Max limit is {selectedVehicle.maxCapacity} kg.
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="plannedDistance-input">Distance (km)</label>
                    <input
                      id="plannedDistance-input"
                      type="number"
                      className="form-control"
                      placeholder="e.g. 450"
                      value={plannedDistance}
                      onChange={handleDistanceChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="revenue-input">Est. Revenue ($)</label>
                    <input
                      id="revenue-input"
                      type="number"
                      className="form-control"
                      placeholder="Auto calculated"
                      value={revenue}
                      onChange={(e) => setRevenue(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="trip-status-select">Scheduled Status</label>
                  <select
                    id="trip-status-select"
                    className="form-control"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={status === 'Dispatched' || status === 'Completed' || status === 'Cancelled'} // Use timeline buttons to dispatch/complete/cancel
                  >
                    <option value="Draft">Draft</option>
                    {status === 'Dispatched' && <option value="Dispatched">Dispatched</option>}
                    {status === 'Completed' && <option value="Completed">Completed</option>}
                    {status === 'Cancelled' && <option value="Cancelled">Cancelled</option>}
                  </select>
                </div>

                <div className="flex-between mt-12">
                  {editingTripId && (
                    <button type="button" className="btn btn-secondary" onClick={handleResetForm}>
                      Reset Form
                    </button>
                  )}
                  <button 
                    type="submit" 
                    className={`btn btn-primary ${exceedsCapacity ? 'btn-disabled' : ''}`}
                    disabled={exceedsCapacity}
                    style={{ marginLeft: 'auto' }}
                  >
                    {editingTripId ? 'Update Manifest' : 'Create Manifest'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="card">
              <h3 className="card-title">Manifest Verification</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Your current account role (<strong>{user.role}</strong>) does not have dispatch scheduling authority. 
                Please contact a Fleet Manager or Dispatcher to schedule or modify delivery routes.
              </p>
            </div>
          )}
        </div>

        {/* Right Side - Live Board */}
        <div>
          <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="flex-between mb-12">
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Live Dispatch Board</h3>
              
              <select 
                id="trip-status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              >
                <option value="all">All Dispatches</option>
                <option value="Draft">Draft</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '520px' }}>
              {filteredTrips.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No active dispatches found matching filters.
                </div>
              ) : (
                filteredTrips.slice().reverse().map(trip => {
                  const isDraft = trip.status === 'Draft';
                  const isDispatched = trip.status === 'Dispatched';
                  
                  return (
                    <div 
                      key={trip.id} 
                      className="card" 
                      style={{ 
                        padding: '16px', 
                        borderLeft: `4px solid ${
                          trip.status === 'Completed' ? 'var(--semantic-success)' :
                          trip.status === 'Dispatched' ? 'var(--semantic-info)' :
                          trip.status === 'Draft' ? 'var(--text-muted)' : 'var(--semantic-danger)'
                        }` 
                      }}
                    >
                      <div className="flex-between mb-12">
                        <span style={{ fontWeight: '800', fontSize: '12px', fontFamily: 'monospace' }}>
                          MANIFEST #{trip.id.substring(5, 12).toUpperCase()}
                        </span>
                        <span className={`badge badge-${
                          trip.status === 'Completed' ? 'success' :
                          trip.status === 'Dispatched' ? 'info' :
                          trip.status === 'Draft' ? 'secondary' : 'danger'
                        }`}>
                          {trip.status}
                        </span>
                      </div>

                      {/* Route Info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
                        <span>📍 {trip.source}</span>
                        <span style={{ color: 'var(--text-muted)' }}>➔</span>
                        <span>🏁 {trip.destination}</span>
                      </div>

                      {/* Details Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        <div>🚚 Vehicle: <strong>{trip.vehicleReg}</strong> ({trip.vehicle?.name || 'Loading...'})</div>
                        <div>👤 Driver: <strong>{trip.driver?.name || 'Loading...'}</strong></div>
                        <div>📦 Load: <strong>{trip.cargoWeight} kg</strong> (Limit: {trip.vehicle?.maxCapacity}kg)</div>
                        <div>📏 Route: <strong>{trip.plannedDistance} km</strong></div>
                      </div>

                      {/* Action buttons (only Dispatchers & Managers) */}
                      {canModify && (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                          {isDraft && (
                            <>
                              <button className="btn btn-secondary btn-sm" onClick={() => handleEditClick(trip)}>
                                Edit Form
                              </button>
                              <button className="btn btn-primary btn-sm" onClick={() => handleDispatch(trip.id)}>
                                Dispatch ⚡
                              </button>
                            </>
                          )}
                          
                          {isDispatched && (
                            <>
                              <button className="btn btn-danger btn-sm" onClick={() => handleCancel(trip.id)}>
                                Cancel Trip
                              </button>
                              <button className="btn btn-success btn-sm" onClick={() => handleOpenCompleteModal(trip)}>
                                Complete Route ✓
                              </button>
                            </>
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

      {/* Complete Route Modal (Capture final mileage + fuel consumed) */}
      {isCompleteModalOpen && completingTrip && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Log Route Completion</h3>
              <button className="close-btn" onClick={() => setIsCompleteModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleConfirmComplete}>
              <div className="modal-body">
                {completeError && (
                  <div style={{ color: 'var(--semantic-danger)', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
                    ⚠️ {completeError}
                  </div>
                )}

                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
                  <div>Vehicle: <strong>{completingTrip.vehicleReg}</strong> ({completingTrip.vehicle?.name})</div>
                  <div>Starting Odometer: <strong>{completingTrip.vehicle?.odometer} km</strong></div>
                  <div>Planned Trip Distance: <strong>{completingTrip.plannedDistance} km</strong></div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="finalOdometer-input">Final Odometer Reading (km)</label>
                  <input
                    id="finalOdometer-input"
                    type="number"
                    className="form-control"
                    placeholder={`e.g. ${Number(completingTrip.vehicle?.odometer || 0) + Number(completingTrip.plannedDistance)}`}
                    value={finalOdometer}
                    onChange={(e) => setFinalOdometer(e.target.value)}
                    required
                  />
                  <small style={{ display: 'block', marginTop: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    Must be greater than starting reading ({completingTrip.vehicle?.odometer} km).
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="fuelConsumed-input">Total Fuel Consumed (Liters)</label>
                  <input
                    id="fuelConsumed-input"
                    type="number"
                    className="form-control"
                    placeholder="e.g. 120"
                    value={fuelConsumed}
                    onChange={(e) => setFuelConsumed(e.target.value)}
                  />
                  <small style={{ display: 'block', marginTop: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    Optional. Logging fuel automatically appends a fuel ticket item for analytics.
                  </small>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCompleteModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Complete manifest & release
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
