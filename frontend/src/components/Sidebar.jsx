import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Building2,
  School, 
  Users, 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  ClipboardList,
  Layers,
  LogOut,
  Sun,
  Moon,
  Shield,
  Archive,
  ChevronLeft,
  Settings,
  MapPin
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, faculty, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleLogout = () => {
    // Enregistrer l'ID de l'université avant la déconnexion pour la redirection
    const univId = faculty?.universite?.id || faculty?.universite || faculty?.university?.id || faculty?.university;
    if (univId) {
      localStorage.setItem('lastUnivId', univId);
    }
    logout();
    // App.jsx (ProtectedRoute) prendra le relais pour la redirection
  };

  const menuItems = [
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Tableau de bord' },
    { path: '/universities', icon: <Building2 size={20} />, label: 'Universités', adminOnly: true },
    { path: '/faculties', icon: <School size={20} />, label: 'Facultés', adminOnly: true },
    { path: '/academic-years', icon: <Calendar size={20} />, label: 'Années Acad.', adminOnly: true },
    { path: '/departments', icon: <Layers size={20} />, label: 'Départements' },
    { path: '/rooms', icon: <MapPin size={20} />, label: 'Salles' },
    { path: '/teachers', icon: <Users size={20} />, label: 'Enseignants' },
    { path: '/classes', icon: <GraduationCap size={20} />, label: 'Classes' },
    { path: '/subjects', icon: <BookOpen size={20} />, label: 'Matières' },
    { path: '/semesters', icon: <ClipboardList size={20} />, label: 'Semestres' },
    { path: '/teachings', icon: <ClipboardList size={20} />, label: 'Enseignements' },
    { path: '/schedule', icon: <Calendar size={20} />, label: 'Emploi du temps' },
    { path: '/archives', icon: <Archive size={20} />, label: 'Archives' },
    { path: '/users', icon: <Shield size={20} />, label: 'Utilisateurs' },
    { path: '/settings', icon: <Settings size={20} />, label: 'Paramètres' },
  ];

  return (
    <aside className={`sidebar ${!isOpen ? 'closed' : ''}`}>
      <div style={{ marginBottom: '24px', padding: '0 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '2px' }}>GESTENS</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Portail de Gestion</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={toggleTheme}
            style={{
              background: 'rgba(99, 102, 241, 0.1)',
              border: 'none',
              color: 'var(--primary)',
              padding: '6px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title={theme === 'dark' ? 'Mode Clair' : 'Mode Sombre'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            style={{
              background: 'rgba(99, 102, 241, 0.1)',
              border: 'none',
              color: 'var(--primary)',
              padding: '6px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Cacher le menu"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
      </div>

      {/* Widget Date & Heure */}
      <div style={{ 
        padding: '12px', 
        marginBottom: '20px', 
        background: 'rgba(99, 102, 241, 0.05)', 
        borderRadius: '12px',
        border: '1px solid rgba(99, 102, 241, 0.1)'
      }}>
        <div style={{ color: 'var(--primary)', fontSize: '18px', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '1px' }}>
          {formatTime(dateTime)}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'capitalize', marginTop: '2px' }}>
          {formatDate(dateTime)}
        </div>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', overflowX: 'hidden' }}>
        {menuItems.filter(item => !item.adminOnly || user?.is_superuser).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
        {user?.is_superuser && (
          <a
            href="http://localhost:8000/admin"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
            style={{ marginTop: '8px', color: 'var(--accent)' }}
          >
            <LayoutDashboard size={20} />
            <span>Back-Office</span>
          </a>
        )}
      </nav>

      {/* Section utilisateur */}
      <div className="sidebar-logout">
        {user && (
          <Link 
            to="/profile"
            style={{ 
              padding: '12px 16px', 
              marginBottom: '8px',
              color: 'var(--text-muted)', 
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              borderRadius: '12px',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            className="user-profile-link"
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary) 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: '600',
              color: 'white',
              flexShrink: 0,
              overflow: 'hidden',
              border: '2px solid rgba(255,255,255,0.1)'
            }}>
              {user.profile?.photo ? (
                <img 
                  src={`http://localhost:8000${user.profile.photo}`} 
                  alt="Avatar" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                user.username?.charAt(0).toUpperCase()
              )}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.username}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                Voir le profil
              </div>
            </div>
          </Link>
        )}
        <button 
          onClick={handleLogout}
          className="logout-btn"
        >
          <LogOut size={18} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
