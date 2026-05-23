import React, { useState, useEffect } from 'react';
import { departmentService, facultyService } from '../services/api';
import { Layers, Plus, Edit2, Trash2, Info, Save, LayoutGrid, LayoutList } from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const { user, faculty } = useAuth();
  const [formData, setFormData] = useState({ nom: '', description: '', faculte: '' });
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchDepartments();
    fetchFaculties();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await departmentService.getAll();
      setDepartments(res.data);
    } catch (err) {
      console.error("Erreur listing départements", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculties = async () => {
    try {
      const res = await facultyService.getAll();
      setFaculties(res.data);
    } catch (err) {
      console.error("Erreur listing facultés", err);
    }
  };

  const handleOpenModal = (dept = null) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({ nom: dept.nom, description: dept.description || '', faculte: dept.faculte });
    } else {
      setEditingDept(null);
      // Auto-fill le champ faculté si l'utilisateur est lié à une faculté spécifique et n'est pas admin
      const defaultFaculte = (!user?.is_superuser && faculty) ? faculty.id : '';
      setFormData({ nom: '', description: '', faculte: defaultFaculte });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await departmentService.update(editingDept.id, formData);
      } else {
        await departmentService.create(formData);
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (err) {
      alert("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce département ?")) {
      try {
        await departmentService.delete(id);
        fetchDepartments();
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold' }}>Départements</h2>
          <p style={{ color: 'var(--text-muted)' }}>Gérez les départements académiques au sein des facultés.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={20} /> Nouveau Département
        </button>
      </header>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <button 
            onClick={() => setViewMode('grid')}
            style={{ 
              padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: viewMode === 'grid' ? 'var(--primary)' : 'transparent',
              color: viewMode === 'grid' ? 'white' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', transition: 'all 0.3s'
            }}
          >
            <LayoutGrid size={18} />
          </button>
          <button 
            onClick={() => setViewMode('table')}
            style={{ 
              padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: viewMode === 'table' ? 'var(--primary)' : 'transparent',
              color: viewMode === 'table' ? 'white' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', transition: 'all 0.3s'
            }}
          >
            <LayoutList size={18} />
          </button>
        </div>
      </div>

      <div style={{ minHeight: '300px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement...</div>
        ) : viewMode === 'grid' ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '20px' 
          }}>
            {departments.map((d) => (
              <motion.div 
                key={d.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-morphism"
                style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Layers size={24} color="var(--primary)" />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleOpenModal(d)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Edit2 size={16}/></button>
                    <button onClick={() => handleDelete(d.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={16}/></button>
                  </div>
                </div>
                
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>{d.nom}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{d.faculte_details?.nom || 'N/A'}</p>
                </div>
                
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', flex: 1 }}>
                  {d.description || 'Aucune description fournie pour ce département.'}
                </p>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={() => handleOpenModal(d)} className="btn-text" style={{ fontSize: '13px', color: 'var(--primary)' }}>
                        Détails →
                    </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-morphism" style={{ overflow: 'hidden' }}>
            <table className="data-table">
            <thead>
              <tr>
                <th>Nom du Département</th>
                <th>Faculté Parente</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d) => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Layers size={18} color="var(--primary)" />
                      {d.nom}
                    </div>
                  </td>
                  <td>{d.faculte_details?.nom || 'N/A'}</td>
                  <td>
                    <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '13px' }}>
                      {d.description || 'Aucune description'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={() => handleOpenModal(d)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(d.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingDept ? "Modifier Département" : "Nouveau Département"}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Nom</label>
            <input type="text" required value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Faculté</label>
            <select 
              required 
              value={formData.faculte} 
              onChange={(e) => setFormData({...formData, faculte: e.target.value})}
              disabled={!user?.is_superuser && faculty && !editingDept}
              style={{ opacity: (!user?.is_superuser && faculty && !editingDept) ? 0.7 : 1, cursor: (!user?.is_superuser && faculty && !editingDept) ? 'not-allowed' : 'pointer' }}
            >
              <option value="">Sélectionner une faculté...</option>
              {faculties.map(f => (
                <option key={f.id} value={f.id}>{f.nom}</option>
              ))}
            </select>
            {!user?.is_superuser && faculty && !editingDept && (
              <p style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '-8px', marginBottom: '12px' }}>
                Votre compte est rattaché à : <strong>{faculty.nom}</strong>
              </p>
            )}
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Description</label>
            <textarea rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
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

export default Departments;
