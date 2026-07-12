import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Settings() {
  const {
    settings,
    saveGlobalSettings,
    resetDatabase,
    user
  } = useApp();

  // Settings form state
  const [currency, setCurrency] = useState(settings.currency || 'USD');
  const [revenuePerKm, setRevenuePerKm] = useState(settings.revenuePerKm?.toString() || '3.00');
  const [licenseWarningDays, setLicenseWarningDays] = useState(settings.licenseWarningDays?.toString() || '30');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');

  // RBAC Access check for Settings modify
  const canModify = user.role === 'Fleet Manager';

  const handleSave = (e) => {
    e.preventDefault();
    setMsg('');

    if (isNaN(revenuePerKm) || Number(revenuePerKm) <= 0) {
      setMsgType('error');
      return setMsg('Revenue per km must be a positive number.');
    }
    if (isNaN(licenseWarningDays) || Number(licenseWarningDays) <= 0) {
      setMsgType('error');
      return setMsg('Warning days window must be a positive number.');
    }

    const res = saveGlobalSettings({
      currency,
      revenuePerKm: Number(revenuePerKm),
      licenseWarningDays: Number(licenseWarningDays)
    });

    if (res.success) {
      setMsgType('success');
      setMsg('Settings updated successfully.');
      setTimeout(() => setMsg(''), 3000);
    } else {
      setMsgType('error');
      setMsg(res.message);
    }
  };

  const handleReset = () => {
    if (window.confirm('WARNING: This will reset the database and delete all custom trips, vehicles, fuel logs, and drivers, reloading original seed data. Proceed?')) {
      resetDatabase();
      setMsgType('success');
      setMsg('Database state reset to defaults.');
      setTimeout(() => window.location.reload(), 1000); // Reload page to refresh context completely
    }
  };

  // RBAC Access Control Visual Grid Matrix data
  const matrixData = [
    { module: 'Dashboard', manager: 'Full Access', dispatcher: 'Full Access', safety: 'Full Access', finance: 'Full Access' },
    { module: 'Vehicles CRUD', manager: 'Full Access', dispatcher: 'Read Only', safety: 'Access Denied', finance: 'Access Denied' },
    { module: 'Drivers CRUD', manager: 'Full Access', dispatcher: 'Read Only', safety: 'Full Access', finance: 'Access Denied' },
    { module: 'Trip Booking & Dispatch', manager: 'Full Access', dispatcher: 'Full Access', safety: 'Access Denied', finance: 'Access Denied' },
    { module: 'Maintenance Log', manager: 'Full Access', dispatcher: 'Access Denied', safety: 'Full Access', finance: 'Access Denied' },
    { module: 'Fuel & Expense Log', manager: 'Full Access', dispatcher: 'Access Denied', safety: 'Access Denied', finance: 'Full Access' },
    { module: 'Reports & Analytics', manager: 'Full Access', dispatcher: 'Access Denied', safety: 'Full Access', finance: 'Full Access' },
    { module: 'System Settings & Config', manager: 'Full Access', dispatcher: 'Access Denied', safety: 'Access Denied', finance: 'Access Denied' }
  ];

  return (
    <div>
      <div className="flex-between mb-24">
        <div>
          <h2 className="title-main">System Settings</h2>
          <p className="subtitle-main">Configure global operational coefficients and review Role-Based Access Control (RBAC) maps</p>
        </div>
      </div>

      <div className="grid-layout">
        {/* Left Side: Parameters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <h3 className="card-title">Global Coefficients</h3>
            
            {msg && (
              <div style={{
                backgroundColor: msgType === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: msgType === 'success' ? 'var(--semantic-success)' : 'var(--semantic-danger)',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '16px'
              }}>
                {msg}
              </div>
            )}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="currency-select">Functional Currency</label>
                <select
                  id="currency-select"
                  className="form-control"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  disabled={!canModify}
                >
                  <option value="USD">USD ($) - United States Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="CAD">CAD ($) - Canadian Dollar</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="revenuePerKm-input">Trip Revenue Rate ($/km)</label>
                  <input
                    id="revenuePerKm-input"
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={revenuePerKm}
                    onChange={(e) => setRevenuePerKm(e.target.value)}
                    disabled={!canModify}
                    required
                  />
                  <small style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Calculates default revenue on distance of new trips.
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="licenseWarningDays-input">CDL Expiry Warning (Days)</label>
                  <input
                    id="licenseWarningDays-input"
                    type="number"
                    className="form-control"
                    value={licenseWarningDays}
                    onChange={(e) => setLicenseWarningDays(e.target.value)}
                    disabled={!canModify}
                    required
                  />
                  <small style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Days before driver license expiry to trigger warning alert.
                  </small>
                </div>
              </div>

              {canModify && (
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>
                  Save Configuration
                </button>
              )}
            </form>
          </div>

          {/* Reset database card */}
          <div className="card" style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <h3 className="card-title text-danger">Database Diagnostics</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
              Reset the LocalStorage state to re-populate all default demo vehicles, drivers, expired license compliance issues, and trips.
            </p>
            <button className="btn btn-danger" style={{ width: '100%' }} onClick={handleReset}>
              Reset & Re-Seed Database 🔄
            </button>
          </div>
        </div>

        {/* Right Side: RBAC Grid Matrix */}
        <div className="card">
          <h3 className="card-title">Role-Based Access Control (RBAC) Matrix</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
            Review functional module accessibility mappings. Access rules are enforced automatically based on user sessions.
          </p>

          <div className="table-container" style={{ margin: 0 }}>
            <table className="table" style={{ fontSize: '12px' }}>
              <thead>
                <tr>
                  <th className="th">Module</th>
                  <th className="th">Fleet Mgr</th>
                  <th className="th">Dispatcher</th>
                  <th className="th">Safety Off</th>
                  <th className="th">Fin Analyst</th>
                </tr>
              </thead>
              <tbody>
                {matrixData.map((row, i) => (
                  <tr key={i} className="tr-hover">
                    <td className="td" style={{ fontWeight: '700' }}>{row.module}</td>
                    <td className="td">
                      <span style={{ fontWeight: '700', color: 'var(--semantic-success)' }}>{row.manager}</span>
                    </td>
                    <td className="td">
                      <span style={{
                        fontWeight: '700',
                        color: row.dispatcher === 'Full Access' ? 'var(--semantic-success)' :
                               row.dispatcher === 'Read Only' ? 'var(--semantic-info)' : 'var(--semantic-danger)'
                      }}>{row.dispatcher}</span>
                    </td>
                    <td className="td">
                      <span style={{
                        fontWeight: '700',
                        color: row.safety === 'Full Access' ? 'var(--semantic-success)' :
                               row.safety === 'Read Only' ? 'var(--semantic-info)' : 'var(--semantic-danger)'
                      }}>{row.safety}</span>
                    </td>
                    <td className="td">
                      <span style={{
                        fontWeight: '700',
                        color: row.finance === 'Full Access' ? 'var(--semantic-success)' :
                               row.finance === 'Read Only' ? 'var(--semantic-info)' : 'var(--semantic-danger)'
                      }}>{row.finance}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
