import React, { useEffect, useState } from 'react';
import { activityService } from '../services/api';
import { Archive, Trash2, ArrowLeft, Loader2, Info, PlusCircle, Edit, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const formatRelativeTime = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSecs = Math.floor((now - date) / 1000);
  if (diffInSecs < 60) return "À l'instant";
  if (diffInSecs < 3600) return `Il y a ${Math.floor(diffInSecs / 60)} min`;
  if (diffInSecs < 86400) return `Il y a ${Math.floor(diffInSecs / 3600)} h`;
  return date.toLocaleDateString();
};

const Archives = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchArchived();
  }, []);

  const fetchArchived = async () => {
    try {
      const response = await activityService.getArchived();
      setActivities(response.data);
    } catch (err) {
      console.error("Erreur chargement archives", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    try {
      await activityService.restore(id);
      setActivities(prev => prev.filter(act => act.id !== id));
    } catch (err) {
      console.error("Erreur restauration", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer définitivement cette activité ?Cette action est irréversible.")) return;
    try {
      await activityService.delete(id);
      setActivities(prev => prev.filter(act => act.id !== id));
    } catch (err) {
      console.error("Erreur suppression", err);
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <header style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: '600' }}>Archives des Activités</h2>
          <p style={{ color: 'var(--text-muted)' }}>Gestion et nettoyage de l'historique archivé (Admin uniquement).</p>
        </div>
      </header>

      <div className="glass-morphism" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <Archive size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Activités Archivées</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <Loader2 className="animate-spin" size={30} color="var(--primary)" />
            </div>
          ) : activities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                <Archive size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                <p>Aucune activité dans les archives.</p>
            </div>
          ) : (
            <AnimatePresence>
              {activities.map((act, index) => (
                <motion.div 
                  key={act.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
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
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleRestore(act.id)}
                      style={{ 
                        background: 'rgba(99, 102, 241, 0.1)', 
                        border: 'none', 
                        color: 'var(--primary)', 
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      <RotateCcw size={14} />
                      Restaurer
                    </button>
                    <button 
                      onClick={() => handleDelete(act.id)}
                      style={{ 
                        background: 'rgba(239, 68, 68, 0.1)', 
                        border: 'none', 
                        color: '#ef4444', 
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      <Trash2 size={14} />
                      Supprimer
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Archives;
