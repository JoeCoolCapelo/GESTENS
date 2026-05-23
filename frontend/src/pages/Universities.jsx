import React, { useState, useEffect } from 'react';
import { universityAdminService } from '../services/api';
import { Building2, Plus, Edit2, Trash2, Mail, Save, MapPin, AlignLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '../components/Modal';

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `http://localhost:8000${url}`;
};

const Universities = () => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState(null);
  const [formData, setFormData] = useState({ nom: '', sigle: '', slogan: '', republique: '', email_contact: '', bp: '', logo: null });
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, logo: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      const res = await universityAdminService.getAll();
      setUniversities(res.data);
    } catch (err) {
      console.error("Erreur listing universités", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (university = null) => {
    if (university) {
      setEditingUniversity(university);
      setFormData({ 
        nom: university.nom || '', 
        sigle: university.sigle || '', 
        slogan: university.slogan || '', 
        republique: university.republique || '', 
        email_contact: university.email_contact || '', 
        bp: university.bp || '', 
        logo: null 
      });
      setPreviewUrl(getImageUrl(university.logo));
    } else {
      setEditingUniversity(null);
      setFormData({ nom: '', sigle: '', slogan: '', republique: '', email_contact: '', bp: '', logo: null });
      setPreviewUrl(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const sendData = new FormData();
    sendData.append('nom', formData.nom);
    sendData.append('sigle', formData.sigle);
    sendData.append('slogan', formData.slogan);
    sendData.append('republique', formData.republique);
    sendData.append('email_contact', formData.email_contact);
    sendData.append('bp', formData.bp);
    if (formData.logo) {
      sendData.append('logo', formData.logo);
    }

    try {
      if (editingUniversity) {
        await universityAdminService.update(editingUniversity.id, sendData);
      } else {
        await universityAdminService.create(sendData);
      }
      setIsModalOpen(false);
      fetchUniversities();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement: " + (err.response?.data?.detail || "Vérifiez vos informations"));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cette université ?")) {
      try {
        await universityAdminService.delete(id);
        fetchUniversities();
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '24px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold' }}>Universités</h2>
          <p style={{ color: 'var(--text-muted)' }}>Gérez les universités du système.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={20} /> Nouvelle Université
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', gridColumn: '1/-1' }}>Chargement...</div>
        ) : universities.length === 0 ? (
          <div className="glass-morphism" style={{ padding: '40px', textAlign: 'center', gridColumn: '1/-1' }}>
            Aucune université enregistrée.
          </div>
        ) : (
          universities.map((u) => (
            <motion.div 
              key={u.id} 
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
                  {u.logo ? (
                    <img 
                      src={getImageUrl(u.logo)} 
                      alt={u.nom} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <Building2 size={36} color="var(--primary)" />
                  )}
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '4px' }}>{u.nom} ({u.sigle})</h3>
                  <div style={{ color: 'var(--accent)', fontSize: '14px', marginBottom: '8px', fontStyle: 'italic' }}>
                    "{u.slogan}"
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={14} /> {u.email_contact}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} /> {u.bp} - {u.republique}
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                  onClick={() => handleOpenModal(u)}
                  className="btn-icon"
                  style={{ background: 'rgba(99, 102, 241, 0.1)', border: 'none', color: 'var(--primary)', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(u.id)}
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
        title={editingUniversity ? "Modifier l'Université" : "Nouvelle Université"}
      >
        <form onSubmit={handleSubmit} style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Nom de l'université</label>
            <input 
              type="text" 
              required
              value={formData.nom}
              onChange={(e) => setFormData({...formData, nom: e.target.value})}
              placeholder="Ex: Université Gamal Abdel Nasser"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Sigle</label>
              <input 
                type="text" 
                required
                value={formData.sigle}
                onChange={(e) => setFormData({...formData, sigle: e.target.value})}
                placeholder="Ex: UGANC"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Email Contact</label>
              <input 
                type="email" 
                required
                value={formData.email_contact}
                onChange={(e) => setFormData({...formData, email_contact: e.target.value})}
                placeholder="contact@univ.edu"
              />
            </div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Slogan</label>
            <input 
              type="text" 
              value={formData.slogan}
              onChange={(e) => setFormData({...formData, slogan: e.target.value})}
              placeholder="Ex: Le temple du savoir"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>République</label>
              <input 
                type="text" 
                value={formData.republique}
                onChange={(e) => setFormData({...formData, republique: e.target.value})}
                placeholder="Ex: RÉPUBLIQUE DE GUINÉE"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Boîte Postale (BP)</label>
              <input 
                type="text" 
                value={formData.bp}
                onChange={(e) => setFormData({...formData, bp: e.target.value})}
                placeholder="Ex: BP 1147 Conakry"
              />
            </div>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Logo de l'Université</label>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div 
                style={{ width: '80px', height: '80px', borderRadius: '12px', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => document.getElementById('logo-upload').click()}
              >
                {previewUrl ? <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Building2 size={24} color="var(--border)" />}
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
              <Save size={18} /> {editingUniversity ? "Mettre à jour" : "Créer"}
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default Universities;
