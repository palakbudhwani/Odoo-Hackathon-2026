import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Navbar({ toggleSidebar }) {
  const { user, view, darkMode, setDarkMode, alerts, setView, searchQuery, setSearchQuery, goBack, goForward } = useApp();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  if (!user) return null;

  // View title lookup
  const viewTitles = {
    dashboard: 'Dashboard Overview',
    fleet: 'Vehicle Registry',
    drivers: 'Drivers & Safety Profiles',
    trips: 'Trip Dispatcher Board',
    maintenance: 'Maintenance Work Orders',
    fuel_expenses: 'Fuel & Expenses Ledger',
    analytics: 'Analytics & Reporting',
    settings: 'System Settings & Access Controls'
  };

  const currentTitle = viewTitles[view] || 'TransitOps';

  return (
    <header style={styles.header}>
      {/* Left items - hamburger & Title */}
      <div style={styles.left}>
        <div style={styles.navGroup}>
          <button style={styles.toggleBtn} onClick={toggleSidebar} title="Open menu">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button style={styles.iconBtn} onClick={goBack} title="Go back">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button style={styles.iconBtn} onClick={goForward} title="Go forward">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <h1 style={styles.title}>{currentTitle}</h1>
      </div>

      {/* Center - Search Bar */}
      <div style={styles.searchContainer}>
        <span style={styles.searchIcon}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text"
          placeholder={`Search ${currentTitle.toLowerCase()}...`}
          style={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Right items - Mode Toggle, Alerts, User indicator */}
      <div style={styles.right}>
        {/* Dark mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={styles.actionBtn}
          title="Toggle light/dark mode"
        >
          {darkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Notifications / Alerts center */}
        <div style={styles.alertContainer}>
          <button
            onClick={() => setIsAlertOpen(!isAlertOpen)}
            style={{
              ...styles.actionBtn,
              backgroundColor: alerts.length > 0 ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
              color: alerts.length > 0 ? 'var(--semantic-danger)' : 'var(--text-secondary)'
            }}
            title="System alerts & logs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.003 6.003 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {alerts.length > 0 && <span style={styles.alertBadge}>{alerts.length}</span>}
          </button>

          {isAlertOpen && (
            <>
              <div style={styles.dropdownOverlay} onClick={() => setIsAlertOpen(false)}></div>
              <div style={styles.alertDropdown}>
                <div style={styles.dropdownHeader}>
                  <h4>Alerts & Compliance Notifications</h4>
                  {alerts.length > 0 && <span className="badge badge-danger">{alerts.length} Active</span>}
                </div>
                <div style={styles.dropdownBody}>
                  {alerts.length === 0 ? (
                    <div style={styles.emptyAlerts}>
                      <span style={{ fontSize: '24px' }}>✓</span>
                      <p>All driver licenses valid. No active fleet alerts.</p>
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <div
                        key={alert.id}
                        onClick={() => {
                          setView(alert.link);
                          setIsAlertOpen(false);
                        }}
                        style={{
                          ...styles.alertItem,
                          borderLeftColor:
                            alert.type === 'danger' ? 'var(--semantic-danger)' :
                            alert.type === 'warning' ? 'var(--semantic-warning)' : 'var(--semantic-info)'
                        }}
                      >
                        <div style={styles.alertText}>{alert.message}</div>
                        <div style={styles.alertMeta}>Click to resolve in {alert.link}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Minimal User indicator */}
        <div style={styles.userBadge}>
          <span style={styles.dot}></span>
          <span style={styles.roleText}>{user.role}</span>
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    height: 'var(--header-height)',
    backgroundColor: 'var(--bg-card)',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    position: 'sticky',
    top: 0,
    zIndex: '90',
    transition: 'background-color var(--transition-normal), border-color var(--transition-normal)'
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  navGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  toggleBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    borderRadius: '8px',
    ':hover': {
      backgroundColor: 'var(--bg-secondary)'
    }
  },
  iconBtn: {
    background: 'transparent',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    transition: 'all var(--transition-fast)',
    ':hover': {
      backgroundColor: 'var(--bg-secondary)',
      color: 'var(--text-primary)'
    }
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-title)',
    letterSpacing: '-0.02em'
  },
  searchContainer: {
    position: 'relative',
    maxWidth: '380px',
    width: '100%',
    marginLeft: '24px',
    marginRight: 'auto',
    display: 'block'
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none'
  },
  searchInput: {
    width: '100%',
    padding: '8px 12px 8px 36px',
    borderRadius: 'var(--border-radius-full)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'all var(--transition-fast)'
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  actionBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all var(--transition-fast)',
    ':hover': {
      backgroundColor: 'var(--bg-secondary)'
    }
  },
  alertBadge: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    backgroundColor: 'var(--semantic-danger)',
    color: '#ffffff',
    fontSize: '9px',
    fontWeight: '800',
    borderRadius: '50%',
    width: '15px',
    height: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  alertContainer: {
    position: 'relative'
  },
  dropdownOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: '998',
    background: 'transparent'
  },
  alertDropdown: {
    position: 'absolute',
    top: '110%',
    right: '0',
    width: '320px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    boxShadow: 'var(--shadow-lg)',
    zIndex: '999',
    overflow: 'hidden',
    animation: 'fadeIn var(--transition-fast)'
  },
  dropdownHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    borderBottom: '1px solid var(--border-color)',
    h4: {
      fontSize: '13px',
      fontWeight: '700',
      color: 'var(--text-primary)'
    }
  },
  dropdownBody: {
    maxHeight: '300px',
    overflowY: 'auto',
    padding: '8px'
  },
  emptyAlerts: {
    padding: '24px 16px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '13px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    span: {
      color: 'var(--semantic-success)',
      fontWeight: '700'
    }
  },
  alertItem: {
    padding: '10px 12px',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-secondary)',
    marginBottom: '8px',
    borderLeft: '4px solid #ccc',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    ':hover': {
      filter: 'brightness(0.95)'
    }
  },
  alertText: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    lineHeight: '1.4'
  },
  alertMeta: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    marginTop: '4px',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  userBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 'var(--border-radius-full)',
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-secondary)'
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'var(--semantic-success)'
  },
  roleText: {
    textTransform: 'capitalize'
  }
};
