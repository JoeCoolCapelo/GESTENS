import React, { useState, useEffect } from 'react';
import { facultyService, universityAdminService } from '../services/api';
import { School, Plus, Edit2, Trash2, Mail, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '../components/Modal';

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `http://localhost:8000${url}`;
};

const Faculties = () => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [formData, setFormData] = useState({ nom: '', email: '', universite_id: '', logo: null, admin_username: '', admin_password: '' });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [universities, setUniversities] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, logo: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    fetchFaculties();
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const res = await universityAdminService.getAll();
      setUniversities(res.data);
    } catch (err) {
      console.error("Erreur listing universités", err);
    }
  };

  const fetchFaculties = async () => {
    try {
      const res = await facultyService.getAll();
      setFaculties(res.data);
    } catch (err) {
      console.error("Erreur listing facultés", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (faculty = null) => {
    if (faculty) {
      setEditingFaculty(faculty);
      setFormData({ nom: faculty.nom, email: faculty.email, universite_id: faculty.universite || '', logo: null, admin_username: '', admin_password: '' });
      setPreviewUrl(getImageUrl(faculty.logo));
    } else {
      setEditingFaculty(null);
      setFormData({ nom: '', email: '', universite_id: '', logo: null, admin_username: '', admin_password: '' });
      setPreviewUrl(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const sendData = new FormData();
    sendData.append('nom', formData.nom);
    sendData.append('email', formData.email);
    if (formData.universite_id) {
      sendData.append('universite', formData.universite_id);
    }
    if (formData.logo) {
      sendData.append('logo', formData.logo);
    }
    if (!editingFaculty) {
      sendData.append('admin_username', formData.admin_username);
      sendData.append('admin_password', formData.admin_password);
    }

    try {
      if (editingFaculty) {
        await facultyService.update(editingFaculty.id, sendData);
      } else {
        await facultyService.create(sendData);
      }
      setIsModalOpen(false);
      fetchFaculties();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement: " + (err.response?.data?.detail || "Vérifiez vos informations"));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cette faculté ?")) {
      try {
        await facultyService.delete(id);
        fetchFaculties();
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold' }}>Facultés</h2>
          <p style={{ color: 'var(--text-muted)' }}>Gérez les établissements de l'université.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={20} /> Nouvelle Faculté
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', gridColumn: '1/-1' }}>Chargement...</div>
        ) : faculties.length === 0 ? (
          <div className="glass-morphism" style={{ padding: '40px', textAlign: 'center', gridColumn: '1/-1' }}>
            Aucune faculté enregistrée.
          </div>
        ) : (
          faculties.map((f) => (
            <motion.div 
              key={f.id} 
              whileHover={{ y: -8, boxShadow: '0 12px 30px rgba(0,0,0,0.3)' }}
              transition={{ duration: 0.3 }}
              className="glass-morphism" 
              style={{ 
                padding: '24px', 
                border: '1px solid rgba(255,255,255,0.05)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  background: 'var(--bg-card)', 
                  borderRadius: '20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                  marginBottom: '16px'
                }}>
                  {f.logo ? (
                    <img 
                      src={getImageUrl(f.logo)} 
                      alt={f.nom} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <School size={36} color="var(--primary)" />
                  )}
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '4px' }}>{f.nom}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    <Mail size={14} /> {f.email}
                  </div>
                </div>
              </div>
              
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                  onClick={() => handleOpenModal(f)}
                  className="btn-icon"
                  style={{ background: 'rgba(99, 102, 241, 0.1)', border: 'none', color: 'var(--primary)', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(f.id)}
                  className="btn-icon"
                  style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: 'var(--danger)', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingFaculty ? "Modifier la Faculté" : "Nouvelle Faculté"}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Nom de la faculté</label>
            <input 
              type="text" 
              required
              value={formData.nom}
              onChange={(e) => setFormData({...formData, nom: e.target.value})}
              placeholder="Ex: Faculté des Sciences"
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Email Institutionnel</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="contact@faculte.edu"
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Université de rattachement</label>
            <select 
              required
              value={formData.universite_id}
              onChange={(e) => setFormData({...formData, universite_id: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)' }}
            >
              <option value="" disabled>Sélectionnez une université</option>
              {universities.map(u => (
                <option key={u.id} value={u.id}>{u.nom}</option>
              ))}
            </select>
          </div>
          
          {!editingFaculty && (
            <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '12px' }}>Compte Responsable</h4>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>Identifiant de connexion</label>
                <input 
                  type="text" 
                  required={!editingFaculty}
                  value={formData.admin_username}
                  onChange={(e) => setFormData({...formData, admin_username: e.target.value})}
                  placeholder="Ex: admin_sciences"
                  style={{ background: 'var(--bg-card)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>Mot de passe initial</label>
                <input 
                  type="password" 
                  required={!editingFaculty}
                  value={formData.admin_password}
                  onChange={(e) => setFormData({...formData, admin_password: e.target.value})}
                  placeholder="••••••••"
                  style={{ background: 'var(--bg-card)' }}
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Logo de la Faculté</label>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div 
                style={{ width: '80px', height: '80px', borderRadius: '12px', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => document.getElementById('logo-upload').click()}
              >
                {previewUrl ? <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <School size={24} color="var(--border)" />}
              </div>
              <div>
                <button type="button" className="btn glass-morphism" style={{ fontSize: '13px' }} onClick={() => document.getElementById('logo-upload').click()}>
                  Choisir une image
                </button>
                <input id="logo-upload" type="file" hidden accept="image/*" onChange={handleFileChange} />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn glass-morphism" onClick={() => setIsModalOpen(false)}>Annuler</button>
            <button type="submit" className="btn btn-primary">
              <Save size={18} /> {editingFaculty ? "Mettre à jour" : "Créer"}
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default Faculties;
