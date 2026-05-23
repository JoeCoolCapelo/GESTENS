import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { School, Sun, Moon, ArrowLeft, LogIn, Lock, User, AlertCircle, CheckCircle, ChevronDown, Eye, EyeOff, Database } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `http://localhost:8000${url}`;
};

const UniversityHome = () => {
  const { id } = useParams();
  const location = useLocation();
  const [faculties, setFaculties] = useState([]);
  const [univ, setUniv] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();

  // Login form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const successMessage = location.state?.message;

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 900;

  useEffect(() => {
    if (id) {
      localStorage.setItem('lastUnivId', id);
    }
    const loadData = async () => {
      try {
        const [fRes, uRes] = await Promise.all([
          authService.getFacultiesPublic(id),
          authService.getUniversityInfo(id)
        ]);
        setFaculties(fRes.data);
        setUniv(uRes.data);
      } catch (err) {
        console.error("Erreur chargement données", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const res = await login(username, password, facultyId);
    setSubmitting(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error);
    }
  };

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Chargement...</div>;
  }

  if (!univ) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Université introuvable.</div>;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-gradient)',
      overflowX: 'hidden'
    }}>
      {/* Floating Buttons */}
      <div style={{ position: 'fixed', top: '24px', left: '24px', zIndex: 100 }}>
        <button 
          onClick={() => navigate('/')}
          className="glass-morphism"
          style={{ 
            padding: '10px 16px', 
            background: isMobile ? 'var(--glass)' : 'rgba(255, 255, 255, 0.2)', 
            color: isMobile ? 'var(--text-main)' : 'white', 
            border: isMobile ? '1px solid var(--glass-border)' : '1px solid rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(10px)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: 500,
            borderRadius: '12px'
          }}
        >
          <ArrowLeft size={18} /> Retour au portail
        </button>
      </div>

      <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 100 }}>
        <button 
          onClick={toggleTheme}
          className="glass-morphism"
          style={{ 
            padding: '10px', 
            background: 'var(--glass)', 
            color: 'var(--text-main)', 
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(10px)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '12px'
          }}
        >
          {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
        </button>
      </div>

      {/* Split Screen Container */}
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        width: '100%',
        minHeight: '100vh'
      }}>
        {/* Left Side: University Info (Full Bleed) */}
        <div style={{ 
        flex: 1, 
        width: isMobile ? '100%' : '50%',
        minHeight: isMobile ? 'auto' : '100vh',
        background: 'linear-gradient(135deg, var(--primary) 0%, #a855f7 100%)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: isMobile ? '100px 24px 40px' : '40px 60px',
        color: 'white'
      }}>
        {/* Decorative Elements */}
        <div style={{
          position: 'absolute', top: '-10%', right: '-10%', width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
          filter: 'blur(40px)', zIndex: 0
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '-10%', width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
          filter: 'blur(40px)', zIndex: 0
        }} />
        
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: '550px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
            <motion.div 
              whileHover={{ scale: 1.05, rotate: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              style={{ 
                width: '120px', 
                height: '120px', 
                background: 'white', 
                borderRadius: '28px', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                flexShrink: 0
              }}
            >
              {univ.logo ? (
                <img 
                  src={getImageUrl(univ.logo)} 
                  alt="University Logo" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <div style={{ color: 'var(--primary)', fontWeight: '900', fontSize: '36px' }}>{univ.sigle}</div>
              )}
            </motion.div>
            <div>
              <div style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '6px 14px', background: 'rgba(255, 255, 255, 0.2)', 
                color: 'white', borderRadius: '100px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px',
                backdropFilter: 'blur(10px)'
              }}>
                <School size={14} /> Portail Universitaire
              </div>
              <h1 style={{ fontSize: '56px', fontWeight: '900', margin: 0, lineHeight: 1, letterSpacing: '-2px', color: 'white' }}>
                {univ.sigle}
              </h1>
            </div>
          </div>

          <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'white', marginBottom: '20px', lineHeight: 1.2, letterSpacing: '-0.5px' }}>
            {univ.nom}
          </h2>
          
          <div style={{ 
            display: 'flex',
            gap: '16px',
            marginBottom: '40px' 
          }}>
            <div style={{ width: '4px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.5)' }}></div>
            <p style={{ fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.9)', fontSize: '18px', margin: 0, lineHeight: 1.6, flex: 1 }}>
              "{univ.slogan}"
            </p>
          </div>

          <div style={{ 
            padding: '24px', 
            background: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: '24px', 
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'white', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }}></div>
              Facultés rattachées ({faculties.length})
            </h3>

            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '12px',
              maxHeight: isMobile ? 'none' : '300px',
              overflowY: isMobile ? 'visible' : 'auto',
              paddingRight: '8px'
            }} className="custom-scrollbar">
              {faculties.map((f, idx) => (
                <motion.div 
                  key={f.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                  style={{ 
                    padding: '12px 16px', 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '16px',
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    transition: 'all 0.2s ease',
                    cursor: 'default'
                  }}
                >
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    background: 'white', 
                    borderRadius: '12px', 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                  }}>
                    {f.logo ? (
                      <img 
                        src={getImageUrl(f.logo)} 
                        alt={f.nom} 
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} 
                      />
                    ) : (
                      <School size={20} color="var(--primary)" />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'white', margin: 0, lineHeight: 1.3 }}>{f.nom}</h4>
                  </div>
                </motion.div>
              ))}
              {faculties.length === 0 && (
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontStyle: 'italic', textAlign: 'center', padding: '20px 0', margin: 0 }}>
                  Aucune faculté enregistrée pour le moment.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side: Login Form (Full Bleed) */}
      <div style={{ 
        flex: 1, 
        width: isMobile ? '100%' : '50%',
        minHeight: isMobile ? 'auto' : '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: isMobile ? '40px 24px 80px' : '40px 60px',
        position: 'relative'
      }}>
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ width: '100%', maxWidth: '420px' }}
        >
          <div className="glass-morphism" style={{ 
            padding: '40px 32px', 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ 
                width: '60px', height: '60px', 
                background: 'linear-gradient(135deg, var(--primary) 0%, #a855f7 100%)', 
                borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <LogIn size={28} color="white" />
              </div>
              <h2 className="gradient-text" style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>Connexion</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
                Accédez à votre espace membre
              </p>
            </div>

            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
              >
                <CheckCircle size={18} /> {successMessage}
              </motion.div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
              >
                <AlertCircle size={18} /> {error}
              </motion.div>
            )}

            <form onSubmit={handleLoginSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px', fontWeight: '500' }}>Identifiant</label>
                <div style={{ position: 'relative' }}>
                  <User size={17} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Nom d'utilisateur" 
                    style={{ paddingLeft: '40px', marginBottom: 0 }}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px', fontWeight: '500' }}>Mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={17} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    style={{ paddingLeft: '40px', paddingRight: '40px', marginBottom: 0 }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px', fontWeight: '500' }}>Faculté / Institut</label>
                <div style={{ position: 'relative' }}>
                  <School size={17} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)', zIndex: 1 }} />
                  <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '13px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <select
                    value={facultyId}
                    onChange={(e) => setFacultyId(e.target.value)}
                    style={{ paddingLeft: '40px', paddingRight: '36px', marginBottom: 0, appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer', color: facultyId ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: 600 }}
                  >
                    <option value="" disabled style={{ color: 'var(--text-muted)', background: 'var(--bg-card)' }}>
                      {faculties.length === 0 ? 'Aucune faculté disponible' : 'Sélectionnez votre faculté'}
                    </option>
                    {faculties.map(f => (
                      <option key={f.id} value={f.id} style={{ color: 'var(--text-main)', background: 'var(--bg-card)' }}>
                        {f.nom}
                      </option>
                    ))}
                  </select>
                </div>
                {faculties.length === 0 && (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Aucune faculté enregistrée.
                  </p>
                )}
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
                disabled={submitting}
              >
                {submitting ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          </div>
        </motion.div>

      </div>
      </div>

      {/* Global Footer */}
      <footer style={{ 
        borderTop: '1px solid rgba(255,255,255,0.05)', 
        padding: '60px 20px 20px',
        background: 'var(--bg-card)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '60px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Database size={24} color="var(--primary)" />
              <span style={{ fontSize: '20px', fontWeight: 'bold' }}>GESTENS</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
              Système de gestion intégrée conçu pour la performance académique et administrative.
            </p>
          </div>
          
          <div>
            <h4 style={{ fontWeight: 'bold', marginBottom: '20px' }}>Plateforme</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-muted)', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }}>À propos</li>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Fonctionnalités</li>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Sécurité</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontWeight: 'bold', marginBottom: '20px' }}>Support</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-muted)', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Centre d'aide</li>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Documentation</li>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Contact technique</li>
            </ul>
          </div>
        </div>

        <div style={{ 
          maxWidth: '1200px', margin: '0 auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '13px'
        }}>
          <p>© {new Date().getFullYear()} GESTENS. Tous droits réservés.</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Conditions générales</span>
            <span>Politique de confidentialité</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UniversityHome;
