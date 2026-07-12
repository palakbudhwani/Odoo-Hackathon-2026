import React from 'react';
import { useApp } from '../context/AppContext';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { user, logout, view, setView } = useApp();

  if (!user) return null;

  // View lists with icons (SVG)
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )},
    { id: 'fleet', label: 'Vehicle Registry', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M13 16h8l1-4v-3a1 1 0 00-1-1h-9M13 9h8" />
      </svg>
    )},
    { id: 'drivers', label: 'Drivers & Safety', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )},
    { id: 'trips', label: 'Trip Dispatcher', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )},
    { id: 'maintenance', label: 'Maintenance', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )},
    { id: 'fuel_expenses', label: 'Fuel & Expenses', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { id: 'analytics', label: 'Reports & Analytics', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2zm12 0v-8a2 2 0 00-2-2h-2a2 2 0 00-2 2v8a2 2 0 002 2h2a2 2 0 002-2z" />
      </svg>
    )},
    { id: 'settings', label: 'Settings & RBAC', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    )}
  ];

  // RBAC Permission Check
  const hasAccess = (itemId) => {
    if (user.role === 'Fleet Manager') return true;
    if (user.role === 'Dispatcher') {
      return ['dashboard', 'fleet', 'drivers', 'trips'].includes(itemId);
    }
    if (user.role === 'Safety Officer') {
      return ['dashboard', 'drivers', 'maintenance', 'analytics'].includes(itemId);
    }
    if (user.role === 'Financial Analyst') {
      return ['dashboard', 'fuel_expenses', 'analytics'].includes(itemId);
    }
    return false;
  };

  const filteredItems = navItems.filter(item => hasAccess(item.id));

  // Role color mappings
  const roleColors = {
    'Fleet Manager': '#6366f1', // Indigo
    'Dispatcher': '#10b981', // Green
    'Safety Officer': '#f59e0b', // Yellow
    'Financial Analyst': '#06b6d4' // Cyan
  };

  const userRoleColor = roleColors[user.role] || 'var(--accent-primary)';

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && <div style={styles.overlay} onClick={toggleSidebar}></div>}

      <aside style={{
        ...styles.sidebar,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        left: isOpen ? '0' : `-${styles.sidebar.width}`
      }}>
        {/* Top Header */}
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <div style={styles.logoMark}>O</div>
            <h2 style={styles.logoText}>TransitOps</h2>
          </div>
          <button style={styles.closeMobileBtn} onClick={toggleSidebar}>×</button>
        </div>

        {/* Navigation list */}
        <nav style={styles.nav}>
          <div style={styles.navSectionHeader}>Main Navigation</div>
          <ul style={styles.navList}>
            {filteredItems.map(item => {
              const isActive = view === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setView(item.id);
                      if (window.innerWidth <= 1024) toggleSidebar();
                    }}
                    style={{
                      ...styles.navButton,
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                      color: isActive ? 'var(--text-on-sidebar-active)' : 'var(--text-on-sidebar)',
                      borderLeft: isActive ? `4px solid ${userRoleColor}` : '4px solid transparent',
                      paddingLeft: isActive ? '12px' : '16px'
                    }}
                  >
                    <span style={{
                      ...styles.navIcon,
                      color: isActive ? userRoleColor : 'var(--text-on-sidebar)'
                    }}>{item.icon}</span>
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom User Profile Section */}
        <div style={styles.userSection}>
          <div style={styles.userCard}>
            <div style={{ ...styles.avatar, backgroundColor: userRoleColor }}>
              {user.name.charAt(0)}
            </div>
            <div style={styles.userInfo}>
              <div style={styles.userName}>{user.name}</div>
              <div style={{ ...styles.userRole, color: userRoleColor }}>{user.role}</div>
            </div>
          </div>

          <button onClick={logout} style={styles.logoutBtn}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: '99',
    backdropFilter: 'blur(2px)'
  },
  sidebar: {
    width: 'var(--sidebar-width)',
    height: '100vh',
    backgroundColor: 'var(--bg-sidebar)',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    bottom: 0,
    zIndex: '100',
    transition: 'transform var(--transition-normal)',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '4px 0 20px rgba(0, 0, 0, 0.15)',
    // In CSS, media queries handle the width but in inline styles, we set position: fixed/absolute and toggle translateX
    // On desktop, translateX(0) is default. We'll add styles to App.jsx to handle main panel margin.
  },
  header: {
    height: 'var(--header-height)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  logoMark: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    backgroundColor: 'var(--accent-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-title)',
    fontSize: '20px',
    fontWeight: '800',
    color: '#ffffff'
  },
  logoText: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#ffffff',
    fontFamily: 'var(--font-title)',
    letterSpacing: '-0.02em'
  },
  closeMobileBtn: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    fontSize: '24px',
    cursor: 'pointer',
    display: 'none', // Overridden in responsive environments
    '@media (max-width: 1024px)': {
      display: 'block'
    }
  },
  nav: {
    flex: '1',
    padding: '24px 0',
    overflowY: 'auto'
  },
  navSectionHeader: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: '0 20px',
    marginBottom: '12px'
  },
  navList: {
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  navButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    textAlign: 'left',
    fontFamily: 'var(--font-primary)',
    transition: 'all var(--transition-fast)'
  },
  navIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  userSection: {
    padding: '20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontWeight: '800',
    fontSize: '16px'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0
  },
  userName: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#ffffff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  userRole: {
    fontSize: '12px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: 'none',
    color: '#ef4444',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    ':hover': {
      backgroundColor: 'rgba(239, 68, 68, 0.15)'
    }
  }
};
