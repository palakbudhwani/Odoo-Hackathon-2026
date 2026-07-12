import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function VehicleRegistry() {
  const { vehicles, saveVehicle, deleteVehicle, user, searchQuery } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  
  // Form fields
  const [regNum, setRegNum] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('Semi-Truck');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [odometer, setOdometer] = useState('');
  const [acquisitionCost, setAcquisitionCost] = useState('');
  const [status, setStatus] = useState('Available');
  const [region, setRegion] = useState('North');
  const [formError, setFormError] = useState('');

  // Local Filters
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('regNum');

  // RBAC Access Check
  const canModify = user.role === 'Fleet Manager'; // Only Fleet Manager can add/edit/delete vehicles!

  const openAddModal = () => {
    setEditingVehicle(null);
    setRegNum('');
    setName('');
    setType('Semi-Truck');
    setMaxCapacity('');
    setOdometer('');
    setAcquisitionCost('');
    setStatus('Available');
    setRegion('North');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setRegNum(vehicle.regNum);
    setName(vehicle.name);
    setType(vehicle.type);
    setMaxCapacity(vehicle.maxCapacity.toString());
    setOdometer(vehicle.odometer.toString());
    setAcquisitionCost(vehicle.acquisitionCost.toString());
    setStatus(vehicle.status);
    setRegion(vehicle.region || 'North');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    // Validations
    if (!regNum.trim()) return setFormError('Registration number is required.');
    if (!name.trim()) return setFormError('Name/Model is required.');
    if (isNaN(maxCapacity) || Number(maxCapacity) <= 0) return setFormError('Capacity must be a positive number.');
    if (isNaN(odometer) || Number(odometer) < 0) return setFormError('Odometer must be a non-negative number.');
    if (isNaN(acquisitionCost) || Number(acquisitionCost) < 0) return setFormError('Acquisition cost must be a non-negative number.');

    const vehicleData = {
      regNum: regNum.trim().toUpperCase(),
      name: name.trim(),
      type,
      maxCapacity: Number(maxCapacity),
      odometer: Number(odometer),
      acquisitionCost: Number(acquisitionCost),
      status,
      region
    };

    const res = saveVehicle(vehicleData);
    if (res.success) {
      setIsModalOpen(false);
    } else {
      setFormError(res.message);
    }
  };

  const handleDelete = (reg) => {
    if (window.confirm(`Are you sure you want to delete vehicle ${reg}?`)) {
      const res = deleteVehicle(reg);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  // Filter & Search Logic
  const filteredVehicles = vehicles
    .filter(v => {
      // Global Search in Navbar (search by Registration or Model)
      const matchesSearch = searchQuery === '' || 
        v.regNum.toLowerCase().includes(searchQuery.toLowerCase()) || 
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.region?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'all' || v.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'regNum') return a.regNum.localeCompare(b.regNum);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'capacity') return b.maxCapacity - a.maxCapacity;
      if (sortBy === 'odometer') return b.odometer - a.odometer;
      if (sortBy === 'cost') return b.acquisitionCost - a.acquisitionCost;
      return 0;
    });

  const uniqueTypes = [...new Set(vehicles.map(v => v.type))];

  return (
    <div>
      <div className="flex-between mb-24">
        <div>
          <h2 className="title-main">Vehicle Registry</h2>
          <p className="subtitle-main">Track vehicle status, mileage, load capacities, and lifecycle metrics</p>
        </div>
        {canModify && (
          <button className="btn btn-primary" onClick={openAddModal}>
            <span>+</span> Add Vehicle
          </button>
        )}
      </div>

      {/* Local Filter controls */}
      <div className="filter-bar">
        <div className="filter-item">
          <label htmlFor="vehicle-type-filter">Type</label>
          <select 
            id="vehicle-type-filter"
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="filter-item">
          <label htmlFor="vehicle-status-filter">Status</label>
          <select 
            id="vehicle-status-filter"
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
          <label htmlFor="vehicle-sort-filter">Sort By</label>
          <select 
            id="vehicle-sort-filter"
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="regNum">Reg Number</option>
            <option value="name">Model Name</option>
            <option value="capacity">Max Capacity</option>
            <option value="odometer">Odometer Reading</option>
            <option value="cost">Acquisition Cost</option>
          </select>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="th">Reg Number</th>
              <th className="th">Vehicle Name/Model</th>
              <th className="th">Type</th>
              <th className="th">Region</th>
              <th className="th">Max Load Capacity</th>
              <th className="th">Odometer</th>
              <th className="th">Acquisition Cost</th>
              <th className="th">Status</th>
              {canModify && <th className="th" style={{ textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.length === 0 ? (
              <tr>
                <td className="td" colSpan={canModify ? 9 : 8} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  No vehicles found.
                </td>
              </tr>
            ) : (
              filteredVehicles.map(vehicle => (
                <tr key={vehicle.regNum} className="tr-hover">
                  <td className="td" style={{ fontWeight: '700', color: 'var(--accent-primary)' }}>
                    {vehicle.regNum}
                  </td>
                  <td className="td" style={{ fontWeight: '600' }}>
                    {vehicle.name}
                  </td>
                  <td className="td">{vehicle.type}</td>
                  <td className="td">
                    <span className="badge badge-secondary">{vehicle.region || 'North'}</span>
                  </td>
                  <td className="td">{vehicle.maxCapacity.toLocaleString()} kg</td>
                  <td className="td">{vehicle.odometer.toLocaleString()} km</td>
                  <td className="td" style={{ fontWeight: '600' }}>
                    ${vehicle.acquisitionCost.toLocaleString()}
                  </td>
                  <td className="td">
                    <span className={`badge badge-${
                      vehicle.status === 'Available' ? 'success' :
                      vehicle.status === 'On Trip' ? 'info' :
                      vehicle.status === 'In Shop' ? 'warning' : 'danger'
                    }`}>
                      {vehicle.status}
                    </span>
                  </td>
                  {canModify && (
                    <td className="td" style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditModal(vehicle)}
                          style={{ padding: '4px 8px' }}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(vehicle.regNum)}
                          style={{ padding: '4px 8px' }}
                          disabled={vehicle.status === 'On Trip'}
                          title={vehicle.status === 'On Trip' ? 'Cannot delete vehicle currently on a trip' : ''}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>{editingVehicle ? 'Edit Vehicle' : 'Register New Vehicle'}</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && (
                  <div style={{ color: 'var(--semantic-danger)', fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
                    ⚠️ {formError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="regNum-input">Registration Number</label>
                  <input
                    id="regNum-input"
                    type="text"
                    className="form-control"
                    placeholder="e.g. TRK-999"
                    value={regNum}
                    onChange={(e) => setRegNum(e.target.value)}
                    required
                    disabled={!!editingVehicle} // Reg Number cannot be edited
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="name-input">Vehicle Name / Model</label>
                  <input
                    id="name-input"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Mercedes-Benz Actros"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="type-select">Vehicle Type</label>
                    <select
                      id="type-select"
                      className="form-control"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      <option value="Semi-Truck">Semi-Truck</option>
                      <option value="Flatbed">Flatbed</option>
                      <option value="EV Van">EV Van</option>
                      <option value="Cargo Van">Cargo Van</option>
                      <option value="Electric">Electric</option>
                      <option value="Box Truck">Box Truck</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="region-select">Region</label>
                    <select
                      id="region-select"
                      className="form-control"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                    >
                      <option value="North">North</option>
                      <option value="South">South</option>
                      <option value="East">East</option>
                      <option value="West">West</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="maxCapacity-input">Max Load Capacity (kg)</label>
                  <input
                    id="maxCapacity-input"
                    type="number"
                    className="form-control"
                    placeholder="e.g. 5000"
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="odometer-input">Initial Odometer (km)</label>
                    <input
                      id="odometer-input"
                      type="number"
                      className="form-control"
                      placeholder="e.g. 12000"
                      value={odometer}
                      onChange={(e) => setOdometer(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="acquisitionCost-input">Acquisition Cost ($)</label>
                    <input
                      id="acquisitionCost-input"
                      type="number"
                      className="form-control"
                      placeholder="e.g. 45000"
                      value={acquisitionCost}
                      onChange={(e) => setAcquisitionCost(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="status-select">Vehicle Status</label>
                  <select
                    id="status-select"
                    className="form-control"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={status === 'On Trip'} // Cannot change status manually if on a trip
                  >
                    <option value="Available">Available</option>
                    <option value="In Shop">In Shop</option>
                    <option value="Retired">Retired</option>
                    {status === 'On Trip' && <option value="On Trip">On Trip (Active)</option>}
                  </select>
                  {status === 'On Trip' && (
                    <small style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Vehicle is currently dispatched. Switch trip to complete/cancel to release.
                    </small>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingVehicle ? 'Save Changes' : 'Register Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
