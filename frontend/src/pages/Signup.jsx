import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Lock, School, ChevronDown, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/api';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [faculties, setFaculties] = useState([]);
  const [loadingFaculties, setLoadingFaculties] = useState(true);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    faculty_id: ''
  });

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const univId = searchParams.get('univ');

  useEffect(() => {
    authService.getFacultiesPublic(univId)
      .then(res => setFaculties(res.data))
      .catch(() => setFaculties([]))
      .finally(() => setLoadingFaculties(false));
  }, [univId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.faculty_id) {
      setError('Veuillez sélectionner une faculté.');
      return;
    }
    setLoading(true);
    setError('');

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) data.append(key, formData[key]);
    });

    const result = await signup(data);
    if (result.success) {
      navigate('/login', { state: { message: 'Compte créé ! Veuillez attendre la validation de l\'administrateur ou connectez-vous.' } });
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', padding: '20px' }}>
      <div className="glass-morphism" style={{ width: '100%', maxWidth: '500px', padding: '40px', position: 'relative', overflow: 'hidden' }}>
        
        <header style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1 className="gradient-text" style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>GESTENS</h1>
          <p style={{ color: 'var(--text-muted)' }}>Création de compte utilisateur</p>
        </header>

        {error && (
          <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <motion.div
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }}
          >
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '14px' }}>
                <User size={16} /> Identifiant
              </label>
              <input 
                type="text" required placeholder="Nom d'utilisateur"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '14px' }}>
                <Mail size={16} /> Email
              </label>
              <input 
                type="email" required placeholder="votre@email.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '14px' }}>
                <Lock size={16} /> Mot de passe
              </label>
              <input 
                type="password" required placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '14px' }}>
                <School size={16} /> Faculté
              </label>
              <div style={{ position: 'relative' }}>
                <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '13px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <select
                  value={formData.faculty_id}
                  onChange={(e) => setFormData({...formData, faculty_id: e.target.value})}
                  required
                  style={{
                    paddingRight: '36px',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    cursor: 'pointer',
                    color: formData.faculty_id ? 'white' : 'var(--text-muted)',
                  }}
                >
                  <option value="" disabled>
                    {loadingFaculties ? 'Chargement...' : faculties.length === 0 ? 'Aucune faculté disponible' : 'Sélectionnez votre faculté'}
                  </option>
                  {faculties.map(f => (
                    <option key={f.id} value={f.id} style={{ color: 'white', background: 'var(--bg-card)' }}>
                      {f.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading || loadingFaculties}>
              {loading ? 'Création...' : 'Créer mon compte'} <CheckCircle2 size={18} />
            </button>
          </motion.div>
        </form>

        <p style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
          Déjà un compte ? <Link to={`/login${univId ? '?univ=' + univId : ''}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
