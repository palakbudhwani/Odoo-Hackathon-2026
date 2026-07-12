import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { isLicenseExpired, isLicenseExpiringSoon } from '../data/mockDb';

export default function DriverManagement() {
  const { drivers, saveDriver, deleteDriver, user, searchQuery, settings } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [licenseNum, setLicenseNum] = useState('');
  const [category, setCategory] = useState('Class A');
  const [expiryDate, setExpiryDate] = useState('');
  const [contact, setContact] = useState('');
  const [safetyScore, setSafetyScore] = useState('');
  const [status, setStatus] = useState('Available');
  const [formError, setFormError] = useState('');

  // Filters State
  const [statusFilter, setStatusFilter] = useState('all');
  const [licenseFilter, setLicenseFilter] = useState('all'); // all, expired, expiring-soon, valid
  const [sortBy, setSortBy] = useState('name');

  // RBAC Access Check
  const canModify = ['Fleet Manager', 'Safety Officer'].includes(user.role);

  const openAddModal = () => {
    setEditingDriver(null);
    setName('');
    setLicenseNum('');
    setCategory('Class A');
    setExpiryDate('');
    setContact('');
    setSafetyScore('90');
    setStatus('Available');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (driver) => {
    setEditingDriver(driver);
    setName(driver.name);
    setLicenseNum(driver.licenseNum);
    setCategory(driver.category);
    setExpiryDate(driver.expiryDate);
    setContact(driver.contact);
    setSafetyScore(driver.safetyScore.toString());
    setStatus(driver.status);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    // Validations
    if (!name.trim()) return setFormError('Driver name is required.');
    if (!licenseNum.trim()) return setFormError('License number is required.');
    if (!expiryDate) return setFormError('License expiry date is required.');
    if (!contact.trim()) return setFormError('Contact number is required.');
    if (isNaN(safetyScore) || Number(safetyScore) < 0 || Number(safetyScore) > 100) {
      return setFormError('Safety score must be between 0 and 100.');
    }

    const driverData = {
      id: editingDriver?.id || null,
      name: name.trim(),
      licenseNum: licenseNum.trim().toUpperCase(),
      category,
      expiryDate,
      contact: contact.trim(),
      safetyScore: Number(safetyScore),
      status
    };

    const res = saveDriver(driverData);
    if (res.success) {
      setIsModalOpen(false);
    } else {
      setFormError(res.message);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      const res = deleteDriver(id);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  // Filter & Search Logic
  const filteredDrivers = drivers
    .filter(d => {
      // Global Search
      const matchesSearch = searchQuery === '' || 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        d.licenseNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.contact.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' || d.status === statusFilter;

      // License status filter
      const isExpired = isLicenseExpired(d.expiryDate);
      const isSoon = isLicenseExpiringSoon(d.expiryDate, settings.licenseWarningDays || 30);
      
      let matchesLicense = true;
      if (licenseFilter === 'expired') matchesLicense = isExpired;
      else if (licenseFilter === 'expiring-soon') matchesLicense = isSoon;
      else if (licenseFilter === 'valid') matchesLicense = !isExpired && !isSoon;

      return matchesSearch && matchesStatus && matchesLicense;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'safetyScore') return b.safetyScore - a.safetyScore;
      if (sortBy === 'expiryDate') return new Date(a.expiryDate) - new Date(b.expiryDate);
      return 0;
    });

  return (
    <div>
      <div className="flex-between mb-24">
        <div>
          <h2 className="title-main">Driver Management</h2>
          <p className="subtitle-main">Track driver availability, CDL categories, safety performance scores, and license compliance</p>
        </div>
        {canModify && (
          <button className="btn btn-primary" onClick={openAddModal}>
            <span>+</span> Add Driver
          </button>
        )}
      </div>

      {/* Local Filter Bar */}
      <div className="filter-bar">
        <div className="filter-item">
          <label htmlFor="driver-status-filter">Status</label>
          <select 
            id="driver-status-filter"
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="Off Duty">Off Duty</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        <div className="filter-item">
          <label htmlFor="license-filter">License Compliance</label>
          <select 
            id="license-filter"
            value={licenseFilter} 
            onChange={(e) => setLicenseFilter(e.target.value)}
          >
            <option value="all">All Compliance</option>
            <option value="valid">Valid License</option>
            <option value="expiring-soon">Expiring Soon (30d)</option>
            <option value="expired">Expired License</option>
          </select>
        </div>

        <div className="filter-item">
          <label htmlFor="driver-sort-filter">Sort By</label>
          <select 
            id="driver-sort-filter"
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Name</option>
            <option value="safetyScore">Safety Score</option>
            <option value="expiryDate">License Expiry Date</option>
          </select>
        </div>
      </div>

      {/* Drivers List Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="th">Driver Name</th>
              <th className="th">License Number</th>
              <th className="th">Category</th>
              <th className="th">License Expiry</th>
              <th className="th">Contact</th>
              <th className="th">Safety Score</th>
              <th className="th">Status</th>
              {canModify && <th className="th" style={{ textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.length === 0 ? (
              <tr>
                <td className="td" colSpan={canModify ? 8 : 7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  No drivers found.
                </td>
              </tr>
            ) : (
              filteredDrivers.map(driver => {
                const expired = isLicenseExpired(driver.expiryDate);
                const expiringSoon = isLicenseExpiringSoon(driver.expiryDate, settings.licenseWarningDays || 30);

                return (
                  <tr key={driver.id} className="tr-hover">
                    <td className="td" style={{ fontWeight: '700' }}>
                      {driver.name}
                    </td>
                    <td className="td" style={{ fontFamily: 'monospace', fontWeight: '600' }}>
                      {driver.licenseNum}
                    </td>
                    <td className="td">
                      <span className="badge badge-secondary">{driver.category}</span>
                    </td>
                    <td className="td">
                      <span style={{
                        fontWeight: '700',
                        color: expired ? 'var(--semantic-danger)' : expiringSoon ? 'var(--semantic-warning)' : 'inherit'
                      }}>
                        {driver.expiryDate} {expired ? '(EXPIRED)' : expiringSoon ? '(EXPIRING SOON)' : ''}
                      </span>
                    </td>
                    <td className="td">{driver.contact}</td>
                    <td className="td">
                      <div className="flex-align-center">
                        <span style={{
                          fontWeight: '800',
                          color: driver.safetyScore >= 90 ? 'var(--semantic-success)' : driver.safetyScore >= 80 ? 'var(--semantic-warning)' : 'var(--semantic-danger)'
                        }}>
                          {driver.safetyScore}%
                        </span>
                        {/* Tiny safety progress rail */}
                        <div style={{ width: '50px', height: '6px', backgroundColor: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${driver.safetyScore}%`,
                            height: '100%',
                            backgroundColor: driver.safetyScore >= 90 ? 'var(--semantic-success)' : driver.safetyScore >= 80 ? 'var(--semantic-warning)' : 'var(--semantic-danger)'
                          }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="td">
                      <span className={`badge badge-${
                        driver.status === 'Available' ? 'success' :
                        driver.status === 'On Trip' ? 'info' :
                        driver.status === 'Off Duty' ? 'secondary' : 'danger'
                      }`}>
                        {driver.status}
                      </span>
                    </td>
                    {canModify && (
                      <td className="td" style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => openEditModal(driver)}
                            style={{ padding: '4px 8px' }}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(driver.id)}
                            style={{ padding: '4px 8px' }}
                            disabled={driver.status === 'On Trip'}
                            title={driver.status === 'On Trip' ? 'Cannot delete driver currently on a trip' : ''}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Driver Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>{editingDriver ? 'Edit Driver Profile' : 'Register New Driver'}</h3>
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
                  <label className="form-label" htmlFor="driverName-input">Full Name</label>
                  <input
                    id="driverName-input"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Richard Hendricks"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="licenseNum-input">License Number</label>
                    <input
                      id="licenseNum-input"
                      type="text"
                      className="form-control"
                      placeholder="e.g. DL-2049"
                      value={licenseNum}
                      onChange={(e) => setLicenseNum(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="category-select">License Category</label>
                    <select
                      id="category-select"
                      className="form-control"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="Class A">Class A (Semi)</option>
                      <option value="Class B">Class B (Commercial)</option>
                      <option value="Class C">Class C (Courier)</option>
                      <option value="Class D">Class D (Passenger)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="expiryDate-input">License Expiry Date</label>
                    <input
                      id="expiryDate-input"
                      type="date"
                      className="form-control"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-input">Contact Number</label>
                    <input
                      id="contact-input"
                      type="tel"
                      className="form-control"
                      placeholder="e.g. +1-555-0199"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="safetyScore-input">Safety Score (%)</label>
                    <input
                      id="safetyScore-input"
                      type="number"
                      min="0"
                      max="100"
                      className="form-control"
                      placeholder="e.g. 95"
                      value={safetyScore}
                      onChange={(e) => setSafetyScore(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="driver-status-select">Status</label>
                    <select
                      id="driver-status-select"
                      className="form-control"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      disabled={status === 'On Trip'} // Driver cannot change status if currently dispatching
                    >
                      <option value="Available">Available</option>
                      <option value="Off Duty">Off Duty</option>
                      <option value="Suspended">Suspended</option>
                      {status === 'On Trip' && <option value="On Trip">On Trip (Active)</option>}
                    </select>
                    {status === 'On Trip' && (
                      <small style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Driver is currently dispatched. Switch trip status to complete/cancel to release.
                      </small>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingDriver ? 'Save Changes' : 'Add Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
