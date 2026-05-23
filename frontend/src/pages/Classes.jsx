import React, { useState, useEffect } from 'react';
import { classService, departmentService } from '../services/api';
import { GraduationCap, Plus, Edit2, Trash2, Users, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '../components/Modal';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({ nom: '', niveau: '', departement: '' });

  useEffect(() => {
    fetchClasses();
    fetchDepartments();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await classService.getAll();
      setClasses(res.data);
    } catch (err) {
      console.error("Erreur listing classes", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await departmentService.getAll();
      setDepartments(res.data);
    } catch (err) {
      console.error("Erreur listing départements", err);
    }
  };

  const handleOpenModal = (cls = null) => {
    if (cls) {
      setEditingClass(cls);
      setFormData({ nom: cls.nom, niveau: cls.niveau, departement: cls.departement });
    } else {
      setEditingClass(null);
      setFormData({ nom: '', niveau: '', departement: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClass) {
        await classService.update(editingClass.id, formData);
      } else {
        await classService.create(formData);
      }
      setIsModalOpen(false);
      fetchClasses();
    } catch (err) {
      alert("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cette classe ?")) {
      try {
        await classService.delete(id);
        fetchClasses();
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold' }}>Classes</h2>
          <p style={{ color: 'var(--text-muted)' }}>Gérez les groupes d'étudiants par niveau et département.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={20} /> Nouvelle Classe
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', gridColumn: '1/-1' }}>Chargement...</div>
        ) : classes.length === 0 ? (
          <div className="glass-morphism" style={{ padding: '40px', textAlign: 'center', gridColumn: '1/-1' }}>
            Aucune classe enregistrée.
          </div>
        ) : (
          classes.map((c) => (
            <div key={c.id} className="glass-morphism" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(192, 132, 252, 0.1)', color: '#c084fc', padding: '10px', borderRadius: '12px' }}>
                  <GraduationCap size={24} />
                </div>
                <span style={{ fontSize: '12px', background: 'var(--border)', padding: '4px 8px', borderRadius: '6px' }}>
                  {c.niveau}
                </span>
              </div>
              
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>{c.nom}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
                {c.departement_details?.nom || 'Département inconnu'}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  <Users size={16} /> 0 étudiants
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleOpenModal(c)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(c.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingClass ? "Modifier Classe" : "Nouvelle Classe"}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Nom</label>
            <input type="text" required value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} placeholder="Ex: Informatique L1" />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Niveau</label>
            <input type="text" required value={formData.niveau} onChange={(e) => setFormData({...formData, niveau: e.target.value})} placeholder="Ex: L1, M1, etc." />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Département</label>
            <select required value={formData.departement} onChange={(e) => setFormData({...formData, departement: e.target.value})}>
              <option value="">Sélectionner un département...</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.nom}</option>
              ))}
            </select>
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

export default Classes;
