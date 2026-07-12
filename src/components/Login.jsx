import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Login() {
  const { login, signup } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Fleet Manager');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      let res;
      if (isSignUp) {
        if (!name.trim()) {
          setError('Full Name is required.');
          setIsLoading(false);
          return;
        }
        res = signup(name.trim(), email.trim(), password, role);
      } else {
        res = login(email.trim(), password);
      }
      
      setIsLoading(false);
      if (!res.success) {
        setError(res.message || 'Authentication failed');
      }
    }, 450);
  };

  const handleQuickLogin = (demoEmail) => {
    setError('');
    setIsLoading(true);
    setEmail(demoEmail);
    setPassword('password123');

    setTimeout(() => {
      const res = login(demoEmail, 'password123');
      setIsLoading(false);
      if (!res.success) {
        setError(res.message);
      }
    }, 450);
  };

  const demoAccounts = [
    { name: 'Fleet Manager', email: 'admin@transitops.com', color: '#4f46e5', desc: 'Manage assets, vehicles, lifecycle' },
    { name: 'Dispatcher', email: 'dispatcher@transitops.com', color: '#10b981', desc: 'Create trips, assign vehicles & drivers' },
    { name: 'Safety Officer', email: 'safety@transitops.com', color: '#f59e0b', desc: 'Driver compliance & safety audits' },
    { name: 'Financial Analyst', email: 'finance@transitops.com', color: '#06b6d4', desc: 'Operational costs, revenue & ROI' }
  ];

  return (
    <div style={styles.container}>
      {/* Left panel - branding */}
      <div style={styles.leftPanel}>
        <div style={styles.brandingContent}>
          <div style={styles.logoContainer}>
            <div style={styles.logoMark}>O</div>
            <h1 style={styles.logoText}>TransitOps</h1>
          </div>
          <p style={styles.logoSub}>Smart Transport Operations Platform</p>
          
          <div style={styles.brandingFeatureList}>
            <h3 style={styles.featureTitle}>Enforcing Fleet Regulations</h3>
            <ul style={styles.features}>
              <li style={styles.featureItem}>✓ Auto-restricts unlicensed or suspended drivers</li>
              <li style={styles.featureItem}>✓ Real-time cargo weight verification</li>
              <li style={styles.featureItem}>✓ Smart vehicle status-to-maintenance workflow</li>
              <li style={styles.featureItem}>✓ Automatic operational cost calculation</li>
            </ul>
          </div>
          
          <div style={styles.footerText}>
            © 2026 TransitOps Inc. • Secure Access Portal
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard}>
          {/* Tabs for Login / Register */}
          <div style={styles.authTabs}>
            <button 
              onClick={() => { setIsSignUp(false); setError(''); }}
              style={{
                ...styles.authTabBtn,
                borderBottomColor: !isSignUp ? 'var(--accent-primary)' : 'transparent',
                color: !isSignUp ? 'var(--text-primary)' : 'var(--text-muted)'
              }}
              type="button"
            >
              Sign In
            </button>
            <button 
              onClick={() => { setIsSignUp(true); setError(''); }}
              style={{
                ...styles.authTabBtn,
                borderBottomColor: isSignUp ? 'var(--accent-primary)' : 'transparent',
                color: isSignUp ? 'var(--text-primary)' : 'var(--text-muted)'
              }}
              type="button"
            >
              Sign Up
            </button>
          </div>

          <h2 style={styles.formHeader}>
            {isSignUp ? 'Create new account' : 'Sign in to your account'}
          </h2>
          <p style={styles.formSub}>
            {isSignUp ? 'Register to start managing logistics' : 'Enter your credentials to manage operations'}
          </p>

          {error && (
            <div style={styles.errorBanner}>
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {isSignUp && (
              <div className="form-group">
                <label className="form-label" htmlFor="name-input">Full Name</label>
                <input
                  id="name-input"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Alex Mercer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="email-input">Email Address</label>
              <input
                id="email-input"
                type="email"
                className="form-control"
                placeholder="name@transitops.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password-input">Password</label>
              <input
                id="password-input"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {isSignUp && (
              <div className="form-group">
                <label className="form-label" htmlFor="role-select">Select Organization Role</label>
                <select
                  id="role-select"
                  className="form-control"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="Fleet Manager">Fleet Manager (Full Access)</option>
                  <option value="Dispatcher">Dispatcher (Trips, Registry, Drivers)</option>
                  <option value="Safety Officer">Safety Officer (Drivers, Maintenance, Analytics)</option>
                  <option value="Financial Analyst">Financial Analyst (Fuel, Reports, Analytics)</option>
                </select>
              </div>
            )}

            {!isSignUp && (
              <div style={styles.formActions}>
                <label style={styles.rememberMe}>
                  <input type="checkbox" style={{ marginRight: '6px' }} />
                  Remember me
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Please contact your IT department to reset your password."); }} style={styles.forgot}>
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '15px', marginTop: isSignUp ? '8px' : '0' }}
              disabled={isLoading}
            >
              {isLoading 
                ? (isSignUp ? 'Creating Account...' : 'Authenticating...') 
                : (isSignUp ? 'Register Account' : 'Sign In')
              }
            </button>
          </form>

          {/* Quick Login Section for Demo Evaluators (only shown in Sign In tab) */}
          {!isSignUp && (
            <div style={styles.demoSection}>
              <div style={styles.demoHeaderLine}>
                <span style={styles.demoHeaderText}>Or Quick Sign-In As</span>
              </div>
              
              <div style={styles.demoGrid}>
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    onClick={() => handleQuickLogin(account.email)}
                    disabled={isLoading}
                    style={{
                      ...styles.demoButton,
                      borderLeft: `3px solid ${account.color}`
                    }}
                    type="button"
                  >
                    <div style={styles.demoRoleName}>{account.name}</div>
                    <div style={styles.demoRoleDesc}>{account.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: 'var(--bg-primary)'
  },
  leftPanel: {
    flex: '1.2',
    backgroundColor: '#0f172a', // Fixed slate-900 for sidebar branding
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
    position: 'relative',
    overflow: 'hidden',
  },
  brandingContent: {
    maxWidth: '460px',
    width: '100%',
    zIndex: '2',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'space-between'
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logoMark: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    backgroundColor: 'var(--accent-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-title)',
    fontSize: '24px',
    fontWeight: '800',
    color: '#ffffff'
  },
  logoText: {
    fontSize: '32px',
    fontWeight: '800',
    fontFamily: 'var(--font-title)',
    letterSpacing: '-0.03em',
    color: '#ffffff'
  },
  logoSub: {
    fontSize: '15px',
    color: '#94a3b8',
    marginTop: '6px'
  },
  brandingFeatureList: {
    margin: '80px 0'
  },
  featureTitle: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '16px',
    color: '#ffffff',
    fontFamily: 'var(--font-title)'
  },
  features: {
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  featureItem: {
    color: '#cbd5e1',
    fontSize: '14px',
    fontWeight: '500'
  },
  footerText: {
    color: '#64748b',
    fontSize: '12px',
    fontWeight: '600'
  },
  rightPanel: {
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
    backgroundColor: 'var(--bg-primary)',
    transition: 'background-color var(--transition-normal)'
  },
  formCard: {
    maxWidth: '420px',
    width: '100%',
    animation: 'fadeIn var(--transition-normal)'
  },
  authTabs: {
    display: 'flex',
    gap: '16px',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '24px'
  },
  authTabBtn: {
    background: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    padding: '8px 4px 12px 4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700',
    fontFamily: 'var(--font-primary)',
    transition: 'all var(--transition-fast)'
  },
  formHeader: {
    fontSize: '28px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginBottom: '6px',
    fontFamily: 'var(--font-title)'
  },
  formSub: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    marginBottom: '32px'
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--semantic-danger)',
    padding: '12px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  formActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
    marginTop: '4px',
    marginBottom: '16px'
  },
  rememberMe: {
    display: 'flex',
    alignItems: 'center',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    cursor: 'pointer'
  },
  forgot: {
    color: 'var(--accent-primary)',
    fontWeight: '700'
  },
  demoSection: {
    marginTop: '36px'
  },
  demoHeaderLine: {
    position: 'relative',
    textAlign: 'center',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  demoHeaderText: {
    position: 'relative',
    zIndex: '1',
    backgroundColor: 'var(--bg-primary)',
    padding: '0 12px',
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  demoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
  },
  demoButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '10px 12px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all var(--transition-fast)',
    boxShadow: 'var(--shadow-sm)'
  },
  demoRoleName: {
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  demoRoleDesc: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    marginTop: '2px',
    lineHeight: '1.2'
  }
};
