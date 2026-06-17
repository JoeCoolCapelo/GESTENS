import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService, facultyService, teacherService, classService, departmentService, activityService, academicYearService } from '../services/api';
import { School, Users, GraduationCap, Layers, Clock, PlusCircle, Edit, Trash2, Info, Archive, Building2, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `http://localhost:8000${url}`;
};

const formatRelativeTime = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSecs = Math.floor((now - date) / 1000);
  
  if (diffInSecs < 60) return "À l'instant";
  if (diffInSecs < 3600) return `Il y a ${Math.floor(diffInSecs / 60)} min`;
  if (diffInSecs < 86400) return `Il y a ${Math.floor(diffInSecs / 3600)} h`;
  return date.toLocaleDateString();
};

const StatCard = ({ title, value, icon, color }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -8, boxShadow: '0 12px 30px rgba(0,0,0,0.3)' }}
    transition={{ duration: 0.3 }}
    className="glass-morphism" 
    style={{ padding: '24px', flex: 1, minWidth: '200px', cursor: 'pointer' }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>{title}</p>
        <h3 style={{ fontSize: '28px', fontWeight: 'bold' }}>{value}</h3>
      </div>
      <div style={{ padding: '12px', background: `${color}20`, borderRadius: '12px', color: color }}>
        {icon}
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { user, faculty, selectedYearId } = useAuth();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(null);
  const [univ, setUniv] = useState(null);
  const [archivingId, setArchivingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, a, y, u] = await Promise.all([
          activityService.getStats(selectedYearId),
          activityService.getAll(),
          academicYearService.getCurrent().catch(() => ({ data: null })),
          authService.getUniversityInfo(faculty?.universite_id || faculty?.universite || faculty?.university?.id).catch(() => ({ data: null }))
        ]);
        setStats(s.data);
        setActivities(a.data);
        setCurrentYear(y.data);
        if (u.data) setUniv(u.data);
      } catch (error) {
        console.error("Erreur tableau de bord", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [faculty, selectedYearId]);

  const handleArchive = async (id) => {
    setArchivingId(id);
    try {
      await activityService.archive(id);
      setActivities(prev => prev.filter(act => act.id !== id));
    } catch (err) {
      console.error("Erreur archivage", err);
    } finally {
      setArchivingId(null);
    }
  };

  const handleArchiveAll = async () => {
    if (!window.confirm("Voulez-vous archiver toutes les activités affichées ?")) return;
    try {
      await activityService.archiveAll();
      setActivities([]);
    } catch (err) {
      console.error("Erreur archivage global", err);
    }
  };

  const getActionIcon = (type) => {
    switch (type) {
      case 'create': return <PlusCircle size={16} color="#10b981" />;
      case 'update': return <Edit size={16} color="#f59e0b" />;
      case 'delete': return <Trash2 size={16} color="#ef4444" />;
      default: return <Info size={16} color="var(--primary)" />;
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement du tableau de bord...</div>;

  return (
    <div>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold' }}>Bonjour, {user?.username} !</h2>
          <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Bienvenue sur le portail de {univ?.nom || 'votre université'}.
            {currentYear && (
                <span style={{ 
                    padding: '2px 10px', 
                    background: 'rgba(99, 102, 241, 0.1)', 
                    color: 'var(--primary)', 
                    borderRadius: '20px', 
                    fontSize: '12px', 
                    fontWeight: 'bold',
                    border: '1px solid rgba(99, 102, 241, 0.2)'
                }}>
                    Année : {currentYear.nom}
                </span>
            )}
          </p>
        </div>
        {faculty?.logo && (
          <div style={{ width: '80px', height: '80px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
            <img 
              src={getImageUrl(faculty.logo)} 
              alt="Logo Faculté" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
        )}
      </header>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '40px' }}>
        {user?.is_superuser && (
          <StatCard title="Universités" value={stats?.global?.total_universities ?? 0} icon={<Globe size={24} />} color="#6366f1" />
        )}
        {user?.is_superuser && (
          <StatCard title="Facultés" value={stats?.global?.total_faculties ?? 0} icon={<Building2 size={24} />} color="#8b5cf6" />
        )}
        <StatCard title="Départements" value={stats?.global?.total_departments || 0} icon={<Layers size={24} />} color="#818cf8" />
        <StatCard title="Enseignants" value={stats?.global?.total_teachers || 0} icon={<Users size={24} />} color="#a855f7" />
        <StatCard title="Classes" value={stats?.global?.total_classes || 0} icon={<GraduationCap size={24} />} color="#c084fc" />
      </div>

      {stats?.is_teacher ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            <StatCard 
              title="Mes Enseignements" 
              value={stats.teacher_stats?.total_teachings || 0} 
              icon={<School size={24} />} 
              color="#3b82f6" 
            />
            <StatCard 
              title="Heures Programmées" 
              value={`${stats.teacher_stats?.total_hours || 0}h`} 
              icon={<Clock size={24} />} 
              color="#a855f7" 
            />
            <StatCard 
              title="Classes Différentes" 
              value={stats.total_classes || 0} 
              icon={<GraduationCap size={24} />} 
              color="#ec4899" 
            />
          </div>

          <div className="glass-morphism" style={{ padding: '24px', marginBottom: '40px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={18} color="var(--primary)" /> Mes cours prévus aujourd'hui
            </h3>
            {stats.teacher_stats?.today_classes?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.teacher_stats.today_classes.map((cours, idx) => (
                  <div key={idx} style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold' }}>
                      {cours.heure_debut.substring(0, 5)} - {cours.heure_fin.substring(0, 5)}
                    </div>
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '15px' }}>{cours.enseignement__matiere__nom}</p>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Classe : {cours.enseignement__classe__nom} | Salle : {cours.salle || 'Non assignée'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', color: 'var(--text-muted)' }}>
                Aucun cours prévu pour vous aujourd'hui.
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            
            {/* Graphique Volume Horaire par Département (Vertical Bar Chart) */}
            <div className="glass-morphism" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Clock size={18} color="#a855f7" /> Volume Horaire Hebdomadaire
                </h3>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#a855f7', lineHeight: '1' }}>
                    {stats?.hours_by_dept?.reduce((acc, curr) => acc + curr.count, 0) || 0}h
                  </span>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Total global</div>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', marginTop: '-8px' }}>Par département</p>
              
              <div style={{ display: 'flex', alignItems: 'flex-end', height: '240px', gap: '16px', marginTop: 'auto', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', overflowX: 'auto', overflowY: 'hidden' }}>
                {stats?.hours_by_dept?.map(d => {
                  const maxVal = Math.max(...(stats?.hours_by_dept?.map(x => x.count) || [40]), 40);
                  const heightPct = Math.max(5, (d.count / maxVal) * 100);
                  return (
                    <div key={d.name} style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative', width: '90px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-main)' }}>{d.count}h</span>
                      <div style={{ width: '100%', maxWidth: '40px', height: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPct}%` }}
                          transition={{ duration: 1.2, type: "spring", bounce: 0.3 }}
                          style={{ width: '100%', background: 'linear-gradient(to top, #6366f1, #a855f7)', borderRadius: '8px' }}
                        />
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', whiteSpace: 'normal', lineHeight: '1.3', width: '100%', wordBreak: 'break-word', minHeight: '30px' }} title={d.name}>
                        {d.name.replace('Département de ', '').replace("Département d'", "")}
                      </span>
                    </div>
                  );
                })}
                {(!stats?.hours_by_dept || stats.hours_by_dept.length === 0) && (
                    <div style={{ width: '100%', textAlign: 'center', color: 'var(--text-muted)' }}>Aucune donnée</div>
                )}
              </div>
            </div>

            {/* Graphique Enseignants par Grade (Horizontal Chart) */}
            <div className="glass-morphism" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <GraduationCap size={18} color="var(--primary)" /> Répartition par Grade
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>Niveaux académiques</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: 'auto' }}>
                {stats?.teachers_by_grade?.map((g, idx) => {
                  const maxVal = Math.max(...(stats?.teachers_by_grade?.map(x => x.count) || [1]), 1);
                  const colors = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#10b981'];
                  const barColor = colors[idx % colors.length];
                  return (
                    <div key={g.grade_academique || 'Non défini'}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{g.grade_academique || 'Non défini'}</span>
                        <span style={{ fontWeight: 'bold' }}>{g.count}</span>
                      </div>
                      <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(g.count / maxVal) * 100}%` }}
                          transition={{ duration: 1, delay: idx * 0.1 }}
                          style={{ height: '100%', background: barColor, borderRadius: '5px' }}
                        />
                      </div>
                    </div>
                  );
                })}
                {(!stats?.teachers_by_grade || stats.teachers_by_grade.length === 0) && (
                    <div style={{ width: '100%', textAlign: 'center', color: 'var(--text-muted)' }}>Aucune donnée</div>
                )}
              </div>
            </div>

          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            
            {/* Taux d'occupation (Jauge Circulaire CSS) */}
            <div className="glass-morphism" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', width: '100%', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <School size={18} color="#ec4899" /> Occupation des Salles
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '32px', width: '100%' }}>Utilisation globale</p>
              
              <div style={{ position: 'relative', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <svg width="150" height="150" viewBox="0 0 150 150" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
                  <circle cx="75" cy="75" r="65" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                  <motion.circle 
                    cx="75" cy="75" r="65" fill="none" 
                    stroke="url(#gradientPink)" strokeWidth="12" 
                    strokeDasharray="408.4"
                    initial={{ strokeDashoffset: 408.4 }}
                    animate={{ strokeDashoffset: 408.4 - ((stats?.room_occupancy_pct || 0) / 100) * 408.4 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradientPink" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#f43f5e" />
                    </linearGradient>
                  </defs>
            </svg>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats?.room_occupancy_pct || 0}%</span>
            </div>
          </div>
        </div>

        {/* Top 5 Enseignants */}
        <div className="glass-morphism" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={18} color="#10b981" /> Top 5 Enseignants
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>Par volume horaire</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats?.top_teachers?.map((t, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: idx === 0 ? '#fbbf24' : idx === 1 ? '#9ca3af' : idx === 2 ? '#b45309' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: idx < 3 ? '#000' : '#fff' }}>
                    {idx + 1}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{t.name}</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981' }}>{t.hours}h</span>
              </div>
            ))}
            {(!stats?.top_teachers || stats.top_teachers.length === 0) && (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Aucun enseignant assigné</div>
            )}
          </div>
        </div>

        {/* Répartition Classes */}
        <div className="glass-morphism" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={18} color="#3b82f6" /> Classes par Niveau
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>Distribution</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: 'auto' }}>
            {stats?.classes_by_level?.map((c, idx) => {
              const maxVal = Math.max(...(stats?.classes_by_level?.map(x => x.count) || [1]), 1);
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{c.niveau || 'Autre'}</span>
                    <span style={{ fontWeight: 'bold' }}>{c.count}</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(c.count / maxVal) * 100}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      style={{ height: '100%', background: '#3b82f6', borderRadius: '4px' }}
                    />
                  </div>
                </div>
              );
            })}
            {(!stats?.classes_by_level || stats.classes_by_level.length === 0) && (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Aucune classe</div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {/* Cours du jour */}
        <div className="glass-morphism" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={18} color="#f59e0b" /> Cours Aujourd'hui
            </h3>
            <span style={{ fontSize: '12px', padding: '4px 8px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '12px', fontWeight: 'bold' }}>En direct</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '14px', minWidth: '600px' }}>
              <thead>
                <tr style={{ color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '12px 8px' }}>Heure</th>
                  <th style={{ padding: '12px 8px' }}>Classe</th>
                  <th style={{ padding: '12px 8px' }}>Matière</th>
                  <th style={{ padding: '12px 8px' }}>Enseignant</th>
                  <th style={{ padding: '12px 8px' }}>Salle</th>
                </tr>
              </thead>
              <tbody>
                {stats?.today_classes?.map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 'bold', color: 'var(--text-main)' }}>{c.heure_debut} - {c.heure_fin}</td>
                    <td style={{ padding: '12px 8px' }}>{c.classe}</td>
                    <td style={{ padding: '12px 8px', color: 'var(--primary)' }}>{c.matiere}</td>
                    <td style={{ padding: '12px 8px' }}>{c.enseignant}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontSize: '12px' }}>{c.salle}</span>
                    </td>
                  </tr>
                ))}
                {(!stats?.today_classes || stats.today_classes.length === 0) && (
                  <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Aucun cours programmé aujourd'hui.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alertes (Matières sans prof) */}
        <div className="glass-morphism" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444' }}>
            <Info size={18} /> Alertes & Anomalies
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>Matières créées nécessitant une attribution d'enseignant</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {stats?.unassigned_subjects?.map((m, idx) => (
              <div key={idx} style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px', flex: 1 }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>{m.nom}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Code: {m.code}</div>
                </div>
              </div>
            ))}
            {(!stats?.unassigned_subjects || stats.unassigned_subjects.length === 0) && (
              <div style={{ padding: '20px', width: '100%', textAlign: 'center', color: '#10b981', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', border: '1px dashed rgba(16, 185, 129, 0.2)' }}>
                Tout est en ordre ! Aucun conflit détecté.
              </div>
            )}
          </div>
        </div>
      </div>
      </>
      )}

      {/* Activités Récentes (Visible uniquement pour les gestionnaires) */}
      {!stats?.is_teacher && (
        <div className="glass-morphism" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Activités récentes</h3>
          </div>
          {activities.length > 0 && (
            <button 
              onClick={handleArchiveAll}
              style={{ 
                background: 'rgba(99, 102, 241, 0.1)', 
                border: 'none', 
                color: 'var(--primary)', 
                padding: '6px 14px', 
                borderRadius: '8px',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Archive size={14} />
              Tout archiver
            </button>
          )}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activities.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Aucune activité récente pour le moment.</p>
          ) : (
            <AnimatePresence>
              {activities.map((act, index) => (
                <motion.div 
                  key={act.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px', 
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '10px', 
                    background: 'rgba(99, 102, 241, 0.1)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center' 
                  }}>
                    {getActionIcon(act.action_type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', margin: 0 }}>
                      <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{act.user_name}</span>
                      {' '}{act.description}{' '}
                      <span style={{ fontWeight: '600' }}>{act.target_name}</span>
                    </p>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatRelativeTime(act.timestamp)}</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleArchive(act.id);
                    }}
                    disabled={archivingId === act.id}
                    style={{ 
                      background: 'transparent', 
                      border: 'none', 
                      color: archivingId === act.id ? 'var(--primary)' : 'var(--text-muted)', 
                      cursor: archivingId === act.id ? 'wait' : 'pointer',
                      padding: '8px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      zIndex: 10
                    }}
                    title="Archiver"
                    className="archive-btn"
                  >
                    {archivingId === act.id ? (
                      <div className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                    ) : (
                      <Archive size={16} />
                    )}
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

export default Dashboard;
