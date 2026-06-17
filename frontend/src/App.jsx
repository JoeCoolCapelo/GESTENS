import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, AlertTriangle, Calendar } from 'lucide-react'
import { useLocation, Link } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Teachers from './pages/Teachers'
import Faculties from './pages/Faculties'
import Universities from './pages/Universities'
import Departments from './pages/Departments'
import Classes from './pages/Classes'
import Subjects from './pages/Subjects'
import Teachings from './pages/Teachings'
import Schedule from './pages/Schedule'
import Semesters from './pages/Semesters'
import AcademicYears from './pages/AcademicYears'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Welcome from './pages/Welcome'
import UsersPage from './pages/Users'
import Profile from './pages/Profile'
import Archives from './pages/Archives'
import Settings from './pages/Settings'
import UniversityHome from './pages/UniversityHome'
import Rooms from './pages/Rooms'
import Pointage from './pages/Pointage'

// Composant pour protéger les routes
const ProtectedRoute = ({ children, adminOnly = false, teacherOk = true }) => {
  const { token, user, loading, academicYear, isTeacher } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const location = useLocation();
  
  const isAcademicYearPage = location.pathname === '/academic-years';
  const showWarning = !academicYear && user && !isAcademicYearPage;
  
  if (loading) return null;
  if (!token) {
    const lastUnivId = localStorage.getItem('lastUnivId');
    const isAtUnivHome = window.location.pathname.startsWith('/university/');
    const isAtHome = window.location.pathname === '/';
    const isAtSignup = window.location.pathname === '/signup';
    
    if (lastUnivId && !isAtUnivHome && !isAtHome && !isAtSignup) {
      return <Navigate to={`/university/${lastUnivId}`} />;
    }
    if (!lastUnivId && !isAtUnivHome && !isAtHome && !isAtSignup) {
      return <Navigate to="/" />;
    }
    return null; // On laisse le composant actuel (UniversityHome ou Welcome) s'afficher
  }
  if (adminOnly && !user?.is_superuser) return <Navigate to="/dashboard" />;
  if (isTeacher && !teacherOk) return <Navigate to="/dashboard" />;
  
  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className={`main-content ${!isSidebarOpen ? 'expanded' : ''}`} style={{ flex: 1, position: 'relative' }}>
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="btn glass-morphism"
            style={{ 
              position: 'fixed', 
              top: '20px', 
              left: '20px', 
              zIndex: 90, 
              padding: '8px',
              borderRadius: '8px'
            }}
            title="Afficher le menu"
          >
            <Menu size={20} />
          </button>
        )}
        {showWarning && (
            <div style={{ 
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                zIndex: 1000, background: 'rgba(0,0,0,0.85)', 
                backdropFilter: 'blur(8px)', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', padding: '20px' 
            }}>
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-morphism" 
                    style={{ maxWidth: '500px', padding: '40px', textAlign: 'center', border: '1px solid var(--danger)' }}
                >
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <AlertTriangle size={40} color="var(--danger)" />
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Attention : Année non configurée</h2>
                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '32px' }}>
                        Le système ne peut pas fonctionner correctement car aucune année académique n'est actuellement activée. 
                        Veuillez activer une année pour continuer.
                    </p>
                    {user?.is_superuser ? (
                        <Link to="/academic-years" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={18} /> Gérer les années académiques
                        </Link>
                    ) : (
                        <p style={{ color: 'var(--accent)', fontWeight: '500' }}>
                            Veuillez contacter l'administrateur central pour activer l'année académique.
                        </p>
                    )}
                </motion.div>
            </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 260, damping: 20 }}
            style={{ width: '100%' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ancienne page de login retirée, on passe par les universités */}
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/" element={<Welcome />} />
          <Route path="/university/:id" element={<UniversityHome />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/universities" element={<ProtectedRoute adminOnly={true} teacherOk={false}><Universities /></ProtectedRoute>} />
          <Route path="/faculties" element={<ProtectedRoute adminOnly={true} teacherOk={false}><Faculties /></ProtectedRoute>} />
          <Route path="/academic-years" element={<ProtectedRoute teacherOk={false}><AcademicYears /></ProtectedRoute>} />
          <Route path="/departments" element={<ProtectedRoute teacherOk={false}><Departments /></ProtectedRoute>} />
          <Route path="/rooms" element={<ProtectedRoute teacherOk={false}><Rooms /></ProtectedRoute>} />
          <Route path="/teachers" element={<ProtectedRoute teacherOk={false}><Teachers /></ProtectedRoute>} />
          <Route path="/classes" element={<ProtectedRoute teacherOk={false}><Classes /></ProtectedRoute>} />
          <Route path="/subjects" element={<ProtectedRoute teacherOk={false}><Subjects /></ProtectedRoute>} />
          <Route path="/semesters" element={<ProtectedRoute teacherOk={false}><Semesters /></ProtectedRoute>} />
          <Route path="/teachings" element={<ProtectedRoute teacherOk={false}><Teachings /></ProtectedRoute>} />
          <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
          <Route path="/pointage" element={<ProtectedRoute><Pointage /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute teacherOk={false}><UsersPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/archives" element={<ProtectedRoute teacherOk={false}><Archives /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute teacherOk={false}><Settings /></ProtectedRoute>} />
          
          {/* Redirection vers le dashboard par défaut */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
