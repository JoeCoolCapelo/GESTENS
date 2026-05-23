import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogIn, Lock, User, AlertCircle, CheckCircle, School, ChevronDown, Eye, EyeOff, ArrowLeft, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { authService } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [faculties, setFaculties] = useState([]);
  const [loadingFaculties, setLoadingFaculties] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const univId = searchParams.get('univ');
  const successMessage = location.state?.message;

  // Charger la liste des facultés au montage
  useEffect(() => {
    authService.getFacultiesPublic(univId)
      .then(res => setFaculties(res.data))
      .catch(() => setFaculties([]))
      .finally(() => setLoadingFaculties(false));
  }, [univId]);

  const handleSubmit = async (e) => {
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

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--bg-gradient)',
      padding: '40px 0',
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      {/* Bouton Retour & Thème Floatants */}
      <div style={{ position: 'absolute', top: '24px', left: '24px', right: '24px', display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
        <button 
          onClick={() => navigate('/')}
          className="glass-morphism"
          style={{ 
            padding: '10px 16px', 
            background: 'var(--glass)', 
            color: 'var(--text-main)', 
            border: '1px solid var(--glass-border)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          <ArrowLeft size={18} /> Retour
        </button>

        <button 
          onClick={toggleTheme}
          className="glass-morphism"
          style={{ 
            padding: '10px', 
            background: 'var(--glass)', 
            color: 'var(--primary)', 
            border: '1px solid var(--glass-border)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '12px'
          }}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-morphism" 
        style={{ 
          padding: '40px 32px', 
          width: '90%', 
          maxWidth: '380px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)'
        }}
      >
        {/* En-tête */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ 
            width: '64px', height: '64px', 
            background: 'linear-gradient(135deg, var(--primary) 0%, #a855f7 100%)', 
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <LogIn size={32} color="white" />
          </div>
          <h1 className="gradient-text" style={{ fontSize: '30px', fontWeight: 'bold' }}>Bienvenue</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Connectez-vous à votre espace GESTENS
          </p>
        </div>

        {/* Message de succès */}
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
          >
            <CheckCircle size={18} /> {successMessage}
          </motion.div>
        )}

        {/* Message d'erreur */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
          >
            <AlertCircle size={18} /> {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Identifiant */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px', fontWeight: '500' }}>
              Identifiant
            </label>
            <div style={{ position: 'relative' }}>
              <User size={17} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              <input 
                id="login-username"
                type="text" 
                placeholder="Nom d'utilisateur" 
                style={{ paddingLeft: '40px', marginBottom: 0 }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px', fontWeight: '500' }}>
              Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={17} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              <input 
                id="login-password"
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
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '12px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Faculté */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px', fontWeight: '500' }}>
              Faculté
            </label>
            <div style={{ position: 'relative' }}>
              <School size={17} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)', zIndex: 1 }} />
              <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '13px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <select
                id="login-faculty"
                value={facultyId}
                onChange={(e) => setFacultyId(e.target.value)}
                style={{
                  paddingLeft: '40px',
                  paddingRight: '36px',
                  marginBottom: 0,
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  cursor: 'pointer',
                  color: facultyId ? 'var(--text-main)' : 'var(--text-muted)',
                  fontWeight: 600,
                }}
              >
                <option value="" disabled style={{ color: 'var(--text-muted)', background: 'var(--bg-card)' }}>
                  {loadingFaculties ? 'Chargement...' : faculties.length === 0 ? 'Aucune faculté disponible' : 'Sélectionnez votre faculté'}
                </option>
                {faculties.map(f => (
                  <option key={f.id} value={f.id} style={{ color: 'var(--text-main)', background: 'var(--bg-card)' }}>
                    {f.nom}
                  </option>
                ))}
              </select>
            </div>
            {faculties.length === 0 && !loadingFaculties && (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                Aucune faculté enregistrée.{' '}
                <Link to={`/signup${univId ? '?univ=' + univId : ''}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>Créez votre espace</Link>
              </p>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
            disabled={submitting || loadingFaculties}
          >
            {submitting ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '28px', color: 'var(--text-muted)', fontSize: '14px' }}>
          Pas encore de compte ?{' '}
          <Link to={`/signup${univId ? '?univ=' + univId : ''}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
            Créer mon espace
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
