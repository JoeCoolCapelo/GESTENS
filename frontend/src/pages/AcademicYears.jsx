import React, { useState, useEffect } from 'react';
import { academicYearService } from '../services/api';
import { Calendar, Plus, Edit2, Trash2, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const AcademicYears = () => {
  const { refreshAcademicYear } = useAuth();
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState(null);
  const [formData, setFormData] = useState({ nom: '', description: '', is_current: false });

  useEffect(() => {
    fetchYears();
  }, []);

  const fetchYears = async () => {
    try {
      const res = await academicYearService.getAll();
      setYears(res.data);
    } catch (err) {
      console.error("Erreur listing années académiques", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (year = null) => {
    if (year) {
      setEditingYear(year);
      setFormData({ nom: year.nom, description: year.description || '', is_current: year.is_current });
    } else {
      setEditingYear(null);
      setFormData({ nom: '', description: '', is_current: false });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation du format et de la date
    const yearRegex = /^(\d{4})-(\d{4})$/;
    const match = formData.nom.match(yearRegex);
    
    if (!match) {
        alert("Le format doit être YYYY-YYYY (ex: 2024-2025)");
        return;
    }

    const startYear = parseInt(match[1]);
    const endYear = parseInt(match[2]);

    if (endYear <= startYear) {
        alert("L'année de fin doit être supérieure à l'année de début.");
        return;
    }

    try {
      if (editingYear) {
        await academicYearService.update(editingYear.id, formData);
      } else {
        await academicYearService.create(formData);
      }
      setIsModalOpen(false);
      fetchYears();
    } catch (err) {
      alert("Erreur lors de l'enregistrement. (Ex: Année déjà existante)");
    }
  };

  const handleSetCurrent = async (id) => {
    if (window.confirm("Voulez-vous vraiment définir cette année comme l'année académique actuelle ? Cela désactivera l'année précédente.")) {
      try {
        await academicYearService.setCurrent(id);
        await refreshAcademicYear();
        fetchYears();
      } catch (err) {
        alert("Erreur lors de l'activation.");
      }
    }
  };

  const handleDeactivate = async (id) => {
    if (window.confirm("Voulez-vous désactiver cette année académique ? Les données (emploi du temps, etc.) seront masquées jusqu'à réactivation.")) {
        try {
            await academicYearService.deactivate(id);
            await refreshAcademicYear();
            fetchYears();
        } catch (err) {
            alert("Erreur lors de la désactivation.");
        }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cette année académique ? Toutes les données liées (emplois du temps, enseignements) seront impactées.")) {
      try {
        await academicYearService.delete(id);
        fetchYears();
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold' }}>Années Académiques</h2>
          <p style={{ color: 'var(--text-muted)' }}>Gérez les périodes de formation universitaires.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={20} /> Nouvelle Année
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', gridColumn: '1/-1' }}>Chargement...</div>
        ) : years.length === 0 ? (
          <div className="glass-morphism" style={{ padding: '40px', textAlign: 'center', gridColumn: '1/-1' }}>
            Aucune année enregistrée.
          </div>
        ) : (
          years.map((y) => (
            <div 
              key={y.id} 
              className={`glass-morphism ${y.is_current ? 'active-card' : ''}`} 
              style={{ 
                padding: '24px', 
                border: y.is_current ? '2px solid var(--primary)' : '1px solid var(--border)',
                position: 'relative'
              }}
            >
              {y.is_current && (
                <div style={{ 
                  position: 'absolute', top: '-12px', right: '20px', 
                  background: 'var(--primary)', color: 'white', 
                  padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  <CheckCircle2 size={12} /> ACTUELLE
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ 
                  width: '48px', height: '48px', 
                  background: y.is_current ? 'var(--primary)' : 'rgba(255,255,255,0.05)', 
                  borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  <Calendar size={24} color={y.is_current ? 'white' : 'var(--primary)'} />
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>{y.nom}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {y.is_current ? "Année de référence (active)" : "Année non active"}
                  </p>
                </div>
              </div>
              
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', height: '40px', overflow: 'hidden' }}>
                {y.description || "Aucune description."}
              </p>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {!y.is_current ? (
                    <button 
                        onClick={() => handleSetCurrent(y.id)} 
                        className="btn-text" 
                        style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '13px' }}
                    >
                        Activer cette année
                    </button>
                ) : (
                    <button 
                        onClick={() => handleDeactivate(y.id)} 
                        className="btn-text" 
                        style={{ color: 'var(--danger)', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                        <CheckCircle2 size={14} /> Désactiver l'année
                    </button>
                )}
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => handleOpenModal(y)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(y.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingYear ? "Modifier l'Année" : "Nouvelle Année Académique"}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Nom de l'année (ex: 2023-2024)</label>
            <input 
              type="text" 
              required 
              placeholder="ex: 2024-2025"
              value={formData.nom} 
              onChange={(e) => setFormData({...formData, nom: e.target.value})} 
            />
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Format attendu : <strong>AAAA-AAAA</strong> (ex: 2024-2025). Les années passées ne sont pas autorisées.
            </p>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Description (Optionnel)</label>
            <textarea 
              rows="3"
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Informations complémentaires..."
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn glass-morphism" onClick={() => setIsModalOpen(false)}>Annuler</button>
            <button type="submit" className="btn btn-primary"><Save size={18} /> Enregistrer</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default AcademicYears;
