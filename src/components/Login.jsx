
import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import emailjs from '@emailjs/browser'; // Ensure you have this installed: npm install @emailjs/browser

export default function Login() {
  const { login, signup } = useApp();
  
  // View States
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Field States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Fleet Manager');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // EmailJS configuration (Update these with your actual EmailJS credentials)
  const EMAILJS_SERVICE_ID = 'service_1iwokxd';
  const EMAILJS_TEMPLATE_ID = 'template_sdo7i3f';
  const EMAILJS_PUBLIC_KEY = 'VjIXg3e0SXbVHb4HW';

  const getPasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return { score: 0, color: 'transparent', label: '' };
    if (pass.length > 5) score += 25;
    if (pass.length > 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;
    
    const finalScore = Math.min(100, score);
    let color = 'var(--semantic-danger, #ef4444)';
    let label = 'Weak';
    if (finalScore >= 50) { color = 'var(--semantic-warning, #f59e0b)'; label = 'Fair'; }
    if (finalScore >= 75) { color = 'var(--semantic-success, #10b981)'; label = 'Strong'; }
    return { score: finalScore, color, label };
  };

  const strength = getPasswordStrength(password);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) return setError('Full Name is required.');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    if (strength.score < 50) return setError('Please choose a stronger password.');

    setIsLoading(true);
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          name: name,         // <-- Changed this to match your {{name}} template!
          to_email: email,
          otp_code: newOtp,
        },
        EMAILJS_PUBLIC_KEY
      );
      setOtpStep(true);
      setSuccess('OTP sent to your email. Please verify.');
    } catch (err) {
      setError('Failed to send OTP. Please check your email and try again.');
      console.error('EmailJS Error:', err);
    }
    setIsLoading(false); 
  }; // <--- THIS WAS THE MISSING BRACKET THAT BROKE THE CODE!

  const handleVerifyOTPAndSignup = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (otp !== generatedOtp) {
        setError('Invalid OTP. Please try again.');
        setIsLoading(false);
        return;
      }
      
      const res = signup(name.trim(), email.trim(), password, role);
      setIsLoading(false);
      
      if (!res.success) {
        setError(res.message || 'Authentication failed');
      } else {
        setOtpStep(false);
        setSuccess('Account created successfully!');
      }
    }, 450);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const res = login(email.trim(), password);
      setIsLoading(false);
      if (!res.success) {
        setError(res.message || 'Authentication failed');
      }
    }, 450);
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setSuccess('If an account exists, a password reset link has been sent to your email.');
    }, 1000);
  };

  const resetViews = () => {
    setError('');
    setSuccess('');
    setOtpStep(false);
    setIsForgotPassword(false);
    setPassword('');
    setConfirmPassword('');
    setOtp('');
  };

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
          {!isForgotPassword && !otpStep && (
            <div style={styles.authTabs}>
              <button 
                onClick={() => { setIsSignUp(false); resetViews(); }}
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
                onClick={() => { setIsSignUp(true); resetViews(); }}
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
          )}

          <h2 style={styles.formHeader}>
            {isForgotPassword 
              ? 'Reset Password' 
              : otpStep 
                ? 'Verify Email' 
                : isSignUp 
                  ? 'Create new account' 
                  : 'Sign in to your account'}
          </h2>
          <p style={styles.formSub}>
            {isForgotPassword 
              ? 'Enter your email to receive a reset link' 
              : otpStep 
                ? 'Enter the 6-digit OTP sent to your email' 
                : isSignUp 
                  ? 'Register to start managing logistics' 
                  : 'Enter your credentials to manage operations'}
          </p>

          {error && (
            <div style={styles.errorBanner}>
              <span>⚠</span> {error}
            </div>
          )}
          
          {success && (
            <div style={{...styles.errorBanner, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--semantic-success, #10b981)'}}>
              <span>✓</span> {success}
            </div>
          )}

          {/* FORGOT PASSWORD FORM */}
          {isForgotPassword && (
            <form onSubmit={handleForgotPasswordSubmit} style={styles.form}>
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
              <button type="submit" className="btn btn-primary" style={styles.submitBtn} disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <button 
                type="button" 
                onClick={() => setIsForgotPassword(false)} 
                style={styles.textBtn}
              >
                Back to Sign In
              </button>
            </form>
          )}

          {/* OTP VERIFICATION FORM */}
          {!isForgotPassword && otpStep && (
            <form onSubmit={handleVerifyOTPAndSignup} style={styles.form}>
              <div className="form-group">
                <label className="form-label" htmlFor="otp-input">6-Digit OTP</label>
                <input
                  id="otp-input"
                  type="text"
                  maxLength="6"
                  className="form-control"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  disabled={isLoading}
                  style={{ letterSpacing: '0.2em', textAlign: 'center', fontSize: '18px' }}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={styles.submitBtn} disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify & Create Account'}
              </button>
              <button 
                type="button" 
                onClick={() => setOtpStep(false)} 
                style={styles.textBtn}
              >
                Change Email / Back
              </button>
            </form>
          )}

          {/* LOGIN / SIGNUP FORM */}
          {!isForgotPassword && !otpStep && (
            <form onSubmit={isSignUp ? handleSendOTP : handleLogin} style={styles.form}>
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
                <div style={styles.passwordContainer}>
                  <input
                    id="password-input"
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    style={styles.passwordInput}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                    tabIndex="-1"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                
                {isSignUp && password && (
                  <div style={styles.strengthMeterContainer}>
                    <div style={{ ...styles.strengthMeterBar, width: `${strength.score}%`, backgroundColor: strength.color }} />
                    <span style={{ fontSize: '12px', color: strength.color, alignSelf: 'flex-end', marginTop: '4px' }}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              {isSignUp && (
                <div className="form-group">
                  <label className="form-label" htmlFor="confirm-password-input">Confirm Password</label>
                  <div style={styles.passwordContainer}>
                    <input
                      id="confirm-password-input"
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      style={styles.passwordInput}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeBtn}
                      tabIndex="-1"
                    >
                      {showConfirmPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              )}

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
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); setIsForgotPassword(true); }} style={styles.forgot}>
                    Forgot password?
                  </a>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={styles.submitBtn}
                disabled={isLoading}
              >
                {isLoading 
                  ? (isSignUp ? 'Sending OTP...' : 'Authenticating...') 
                  : (isSignUp ? 'Register Account' : 'Sign In')
                }
              </button>
            </form>
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
    backgroundColor: '#0f172a',
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
    gap: '12px',
    padding: 0,
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
    fontWeight: '700',
    textDecoration: 'none'
  },
  passwordContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%'
  },
  passwordInput: {
    width: '100%',
    paddingRight: '60px'
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '4px'
  },
  strengthMeterContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginTop: '6px',
    backgroundColor: 'var(--border-color)',
    height: '4px',
    borderRadius: '2px',
    position: 'relative'
  },
  strengthMeterBar: {
    height: '100%',
    borderRadius: '2px',
    transition: 'all 0.3s ease'
  },
  submitBtn: {
    width: '100%', 
    padding: '12px', 
    fontSize: '15px', 
    marginTop: '8px'
  },
  textBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '12px',
    width: '100%',
    textAlign: 'center'
  }
};



