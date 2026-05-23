import React, { useState, useEffect } from 'react';
import { semesterService } from '../services/api';
import { ClipboardList, Plus, Edit2, Trash2, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '../components/Modal';

const Semesters = () => {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState(null);
  const [formData, setFormData] = useState({ nom: '', type: 'Impair' });

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    try {
      const res = await semesterService.getAll();
      setSemesters(res.data);
    } catch (err) {
      console.error("Erreur listing semestres", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (semester = null) => {
    if (semester) {
      setEditingSemester(semester);
      setFormData({ nom: semester.nom, type: semester.type });
    } else {
      setEditingSemester(null);
      setFormData({ nom: '', type: 'Impair' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation de la parité
    const numMatch = formData.nom.match(/\d+/);
    if (numMatch) {
      const num = parseInt(numMatch[0]);
      const isEven = num % 2 === 0;
      const expectedType = isEven ? 'Pair' : 'Impair';
      
      if (formData.type !== expectedType) {
        alert(`Erreur de cohérence : Le semestre ${formData.nom} doit être de type "${expectedType}".`);
        return;
      }
    }

    try {
      if (editingSemester) {
        await semesterService.update(editingSemester.id, formData);
      } else {
        await semesterService.create(formData);
      }
      setIsModalOpen(false);
      fetchSemesters();
    } catch (err) {
      alert("Erreur lors de l'enregistrement. (Ex: S1 déjà existant)");
    }
  };

  const handleNomChange = (val) => {
    const newFormData = { ...formData, nom: val };
    const numMatch = val.match(/\d+/);
    if (numMatch) {
      const num = parseInt(numMatch[0]);
      newFormData.type = (num % 2 === 0) ? 'Pair' : 'Impair';
    }
    setFormData(newFormData);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce semestre ?")) {
      try {
        await semesterService.delete(id);
        fetchSemesters();
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold' }}>Semestres</h2>
          <p style={{ color: 'var(--text-muted)' }}>Gérez les périodes académiques.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={20} /> Nouveau Semestre
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', gridColumn: '1/-1' }}>Chargement...</div>
        ) : semesters.length === 0 ? (
          <div className="glass-morphism" style={{ padding: '40px', textAlign: 'center', gridColumn: '1/-1' }}>
            Aucun semestre enregistré. (S1 à S8 attendus)
          </div>
        ) : (
          semesters.map((s) => (
            <div key={s.id} className="glass-morphism" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ width: '48px', height: '48px', background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ClipboardList size={24} color="white" />
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>{s.nom}</h3>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    fontSize: '11px',
                    background: s.type === 'Impair' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(168, 85, 247, 0.1)',
                    color: s.type === 'Impair' ? 'var(--primary)' : '#a855f7'
                  }}>
                    {s.type}
                  </span>
                </div>
              </div>
              
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => handleOpenModal(s)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(s.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSemester ? "Modifier Semestre" : "Nouveau Semestre"}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Nom (ex: S1, S2...)</label>
            <input 
              type="text" 
              required 
              maxLength="5" 
              placeholder="ex: S3"
              value={formData.nom} 
              onChange={(e) => handleNomChange(e.target.value)} 
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Type</label>
            <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
              <option value="Impair">Impair</option>
              <option value="Pair">Pair</option>
            </select>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
              ℹ️ Le type est détecté automatiquement selon le numéro.
            </p>
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

export default Semesters;
