import React, { useState, useEffect } from 'react';
import { supabase } from './src/supabaseClient';

// Automatically detect whether the app is running locally or in production
const getRedirectUrl = () => {
  if (typeof window !== 'undefined') {
    const isLocal =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    if (isLocal) {
      return 'http://localhost:8081';
    }
  }
  return 'https://blinkit-aurangabad.netlify.app';
};

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const targetUrl = getRedirectUrl();

  useEffect(() => {
    setFormData({ email: '', password: '', rememberMe: false });
    setError('');

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleRedirect(session.user);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        handleRedirect(session.user);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleRedirect = (user) => {
    if (onLogin) onLogin(user);
    window.location.href = targetUrl;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: targetUrl,
          },
        });
        if (signUpError) throw signUpError;

        if (data.session) {
          handleRedirect(data.user);
        } else {
          alert('Sign up successful! Please check your email to verify your account.');
          setIsSignUp(false);
          setFormData({ email: '', password: '', rememberMe: false });
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (signInError) throw signInError;

        handleRedirect(data.user);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      setError('');
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: targetUrl,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      setError(err.message || `Failed to sign in with ${provider}`);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      width: '100vw',
      maxWidth: '100vw',
      position: 'relative',
      display: 'flex',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxSizing: 'border-box',
      overflow: 'hidden',
    },
    mainCard: {
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      width: '100%',
      maxWidth: '1020px',
      minHeight: '580px',
      backgroundColor: 'rgba(255, 255, 255, 0.94)',
      backdropFilter: 'blur(16px)',
      borderRadius: '24px',
      boxShadow: '0 30px 70px -15px rgba(28, 10, 60, 0.28)',
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.6)',
    },
    leftSide: {
      width: '45%',
      position: 'relative',
      background: 'linear-gradient(155deg, #2E0854 0%, #4E2298 50%, #1E40AF 100%)',
      padding: '40px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      color: '#ffffff',
      overflow: 'hidden',
    },
    rightSide: {
      flex: 1,
      padding: '36px 24px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    rightInner: {
      maxWidth: '380px',
      width: '100%',
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      backgroundColor: '#F3F4F6',
      border: '1.5px solid transparent',
      borderRadius: '12px',
      outline: 'none',
      fontSize: '14px',
      color: '#1F2937',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box',
    },
    buttonPrimary: {
      width: '100%',
      background: '#4E2298',
      color: 'white',
      fontWeight: '600',
      padding: '13px',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '15px',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 14px rgba(78, 34, 152, 0.3)',
    },
    socialBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '10px 14px',
      border: '1.5px solid #E5E7EB',
      borderRadius: '12px',
      background: '#ffffff',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '500',
      color: '#374151',
      transition: 'all 0.2s ease',
    },
  };

  return (
    <div style={styles.container}>
      {/* Live Animated Background Spheres */}
      <div className="live-bg-container">
        <div className="live-orb orb-1" />
        <div className="live-orb orb-2" />
        <div className="live-orb orb-3" />
        <div className="live-orb orb-4" />
      </div>

      <div style={styles.mainCard}>
        {/* Left Side: Branding Banner */}
        <div style={styles.leftSide} className="left-side-hero">
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  style={{ width: '22px', height: '22px', color: '#ffffff' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <span style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.02em' }}>
                InventoryPro
              </span>
            </div>

            <div style={{ marginTop: '56px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800', lineHeight: '1.2', margin: '0 0 16px 0' }}>
                Smart Quick-Commerce <br />Delivery <br />
                <span style={{ color: '#56B4E9' }}>Made Fast</span>
              </h1>
              <p
                style={{
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  margin: 0,
                  maxWidth: '320px',
                }}
              >
                Access local dark stores, browse catalogue items, and process orders in real time.
              </p>
            </div>
          </div>

          <div
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              paddingTop: '24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <div>
              <div style={{ fontSize: '20px', fontWeight: '700' }}>10 Min</div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.75)', marginTop: '2px' }}>
                Delivery Goal
              </div>
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '700' }}>100%</div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.75)', marginTop: '2px' }}>
                Live Tracking
              </div>
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '700' }}>99.9%</div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.75)', marginTop: '2px' }}>
                Uptime
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div style={styles.rightSide}>
          <div style={styles.rightInner}>
            <h2
              style={{
                fontSize: '26px',
                fontWeight: '700',
                color: '#111827',
                margin: '0 0 8px 0',
                textAlign: 'center',
              }}
            >
              {isSignUp ? 'Create an Account' : 'Welcome Back'}
            </h2>
            <p
              style={{
                color: '#6B7280',
                fontSize: '14px',
                margin: '0 0 24px 0',
                textAlign: 'center',
              }}
            >
              {isSignUp
                ? 'Sign up to start browsing stores and orders'
                : 'Sign in to access your store dashboard'}
            </p>

            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px',
                  }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="you@example.com"
                  style={styles.input}
                  onFocus={(e) => (e.target.style.borderColor = '#4E2298')}
                  onBlur={(e) => (e.target.style.borderColor = 'transparent')}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px',
                  }}
                >
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your password"
                    style={{ ...styles.input, paddingRight: '42px' }}
                    onFocus={(e) => (e.target.style.borderColor = '#4E2298')}
                    onBlur={(e) => (e.target.style.borderColor = 'transparent')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#9CA3AF',
                      display: 'flex',
                      padding: 0,
                    }}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <svg
                        style={{ width: '18px', height: '18px' }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    ) : (
                      <svg
                        style={{ width: '18px', height: '18px' }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {!isSignUp && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      color: '#4B5563',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      style={{ accentColor: '#4E2298' }}
                    />
                    Remember me
                  </label>
                  <a
                    href="#forgot"
                    style={{
                      fontSize: '13px',
                      color: '#4E2298',
                      fontWeight: '500',
                      textDecoration: 'none',
                    }}
                  >
                    Forgot password?
                  </a>
                </div>
              )}

              {error && (
                <div
                  style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    color: '#B91C1C',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '13px',
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{ ...styles.buttonPrimary, opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
              </button>
            </form>

            <div style={{ marginTop: '20px' }}>
              <div style={{ position: 'relative', textAlign: 'center', marginBottom: '16px' }}>
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    height: '1px',
                    backgroundColor: '#E5E7EB',
                  }}
                />
                <span
                  style={{
                    position: 'relative',
                    backgroundColor: '#ffffff',
                    padding: '0 12px',
                    fontSize: '13px',
                    color: '#9CA3AF',
                  }}
                >
                  Or continue with
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  style={styles.socialBtn}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                >
                  <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin('apple')}
                  style={styles.socialBtn}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                >
                  <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  Apple
                </button>
              </div>
            </div>

            <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#6B7280' }}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                style={{
                  color: '#4E2298',
                  fontWeight: '600',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        html, body, #root {
          width: 100% !important;
          min-height: 100vh !important;
          margin: 0 !important;
          padding: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          flex: 1 !important;
        }

        /* Live Background Mesh Canvas */
        .live-bg-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #0f0c20;
          z-index: 1;
        }

        .live-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(85px);
          opacity: 0.75;
          mix-blend-mode: screen;
          will-change: transform;
        }

        .orb-1 {
          width: 520px;
          height: 520px;
          background: radial-gradient(circle, #7928ca 0%, rgba(121, 40, 202, 0) 70%);
          top: -100px;
          left: -100px;
          animation: floatOrb1 18s ease-in-out infinite alternate;
        }

        .orb-2 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, #2563eb 0%, rgba(37, 99, 235, 0) 70%);
          bottom: -150px;
          right: -100px;
          animation: floatOrb2 22s ease-in-out infinite alternate;
        }

        .orb-3 {
          width: 440px;
          height: 440px;
          background: radial-gradient(circle, #f7d435 0%, rgba(247, 212, 53, 0) 70%);
          opacity: 0.45;
          top: 35%;
          left: 45%;
          animation: floatOrb3 15s ease-in-out infinite alternate;
        }

        .orb-4 {
          width: 480px;
          height: 480px;
          background: radial-gradient(circle, #ec4899 0%, rgba(236, 72, 153, 0) 70%);
          bottom: 15%;
          left: 5%;
          animation: floatOrb4 20s ease-in-out infinite alternate;
        }

        @keyframes floatOrb1 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(140px, 90px) scale(1.15); }
          100% { transform: translate(60px, 200px) scale(0.95); }
        }

        @keyframes floatOrb2 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-120px, -110px) scale(1.1); }
          100% { transform: translate(-60px, -180px) scale(0.9); }
        }

        @keyframes floatOrb3 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-100px, 120px) scale(1.25); }
          100% { transform: translate(110px, -90px) scale(0.85); }
        }

        @keyframes floatOrb4 {
          0% { transform: translate(0px, 0px) scale(0.9); }
          50% { transform: translate(130px, -100px) scale(1.15); }
          100% { transform: translate(70px, 70px) scale(1); }
        }

        @media (max-width: 820px) {
          .left-side-hero {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;