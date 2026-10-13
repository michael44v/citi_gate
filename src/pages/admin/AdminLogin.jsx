import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { ShieldAlert, Lock, ArrowRight } from 'lucide-react';
import GlobeBackground from '../../components/ui/Globebackground';

const Field = ({ label, type = 'text', placeholder, value, onChange, name, icon: Icon }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{
        display: 'block', fontSize: 11, fontWeight: 700, color: '#5A6A8A',
        marginBottom: 6, fontFamily: '"DM Sans", sans-serif',
        letterSpacing: '0.07em', textTransform: 'uppercase',
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {Icon && (
          <div style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: focused ? '#117ACA' : '#94A3B8', transition: 'color 0.2s',
          }}>
            <Icon size={18} />
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: Icon ? '13px 15px 13px 42px' : '13px 15px',
            fontSize: 14, fontFamily: '"DM Sans", sans-serif',
            background: 'rgba(255,255,255,0.95)',
            border: `1.5px solid ${focused ? '#117ACA' : '#D8E4F0'}`,
            borderRadius: 12,
            outline: 'none',
            color: '#0A2D5A',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxShadow: focused ? '0 0 0 3px rgba(17,122,202,0.15)' : 'none',
          }}
          required
        />
      </div>
    </div>
  );
};

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (storedUser.role === 'admin' || storedUser.role === 'super_admin') {
        toast.success('Admin Portal Access Granted');
        navigate('/admin');
      } else {
        toast.error('Access Denied: Admin credentials required.');
      }
    } else {
      toast.error(result.message || 'Invalid admin credentials');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: 'linear-gradient(170deg, #0A192F 0%, #0D213A 45%, #0A2D5A 100%)',
      fontFamily: '"DM Sans", sans-serif',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Globe Background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.4 }}>
        <GlobeBackground />
      </div>

      <div style={{
        position: 'relative', zIndex: 2,
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center',
        padding: '36px 20px',
        maxWidth: 440, margin: '0 auto', width: '100%',
      }}>

        {/* Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 100, padding: '6px 16px',
          }}>
            <ShieldAlert size={16} className="text-red-400" />
            <span style={{ fontSize: 11, fontWeight: 800, color: '#F87171', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Restricted Portal • Admin Only
            </span>
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 24,
          border: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '32px 26px 28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#FFFFFF', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
              Admin Control Panel
            </h1>
            <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>
              Authenticate with your administrative credentials
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <Field
              label="Admin Email Address"
              type="email"
              name="email"
              placeholder="admin@citigatebank.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Field
              label="Security Password"
              type="password"
              name="password"
              placeholder="••••••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              icon={Lock}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '15px',
                marginTop: '1rem',
                background: loading ? '#475569' : 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
                color: 'white', border: 'none', borderRadius: 14,
                fontSize: 15, fontWeight: 800,
                cursor: loading ? 'default' : 'pointer',
                letterSpacing: '0.02em',
                boxShadow: '0 8px 20px rgba(234, 88, 12, 0.35)',
                display: 'flex', items: 'center', justify: 'center', gap: 8,
                transition: 'all 0.2s',
                fontFamily: '"DM Sans", sans-serif',
              }}
            >
              {loading ? 'Authenticating...' : <>Access Admin Panel <ArrowRight size={18} /></>}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1.25rem' }}>
            <Link to="/login" style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              ← Return to Standard Banking Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
