import React, { useState, useEffect } from 'react';
import { userService, facultyService } from '../services/api';
import { Users as UsersIcon, Plus, Edit2, Trash2, Shield, Mail, User, Building, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const Users = () => {
  const { user: currentUser, faculty: currentFaculty } = useAuth();
  const [users, setUsers] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    is_superuser: false,
    faculte_id: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchFaculties();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await userService.getAll();
      setUsers(res.data);
    } catch (err) {
      console.error("Erreur listing utilisateurs", err);
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

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        password: '', // On ne pré-remplit pas le mot de passe
        is_superuser: user.is_superuser,
        faculte_id: user.profile?.faculte || ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        is_superuser: false,
        faculte_id: (!currentUser?.is_superuser && currentFaculty) ? currentFaculty.id : ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await userService.update(editingUser.id, formData);
      } else {
        await userService.create(formData);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert("Erreur lors de l'enregistrement. Vérifiez l'unicité de l'identifiant/email.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cet utilisateur ?")) {
      try {
        await userService.delete(id);
        fetchUsers();
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold' }}>Gestion des Utilisateurs</h2>
          <p style={{ color: 'var(--text-muted)' }}>Administrez les comptes et les accès aux facultés.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={20} /> Nouvel Utilisateur
        </button>
      </header>

      <div>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>
        ) : (
          <motion.div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '24px',
              padding: '8px'
            }}
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {users.map((u) => (
              <motion.div 
                key={u.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
                }}
                whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
                className="glass-morphism"
                style={{ 
                  padding: '24px', 
                  borderRadius: '20px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '16px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {u.is_superuser && (
                  <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '50px', height: '50px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', filter: 'blur(15px)' }}></div>
                )}
                
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ 
                      width: '48px', height: '48px', 
                      borderRadius: '16px', 
                      background: u.is_superuser ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'linear-gradient(135deg, var(--primary) 0%, #818cf8 100%)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
                    }}>
                      <User size={24} color="white" />
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 'bold', fontSize: '18px', margin: 0 }}>{u.username}</h3>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{u.email}</div>
                    </div>
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '10px',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <Shield size={14} color={u.is_superuser ? '#ef4444' : 'var(--primary)'} />
                    <span style={{ 
                      fontWeight: 600,
                      color: u.is_superuser ? '#ef4444' : 'var(--primary)'
                    }}>
                      {u.is_superuser ? 'Admin Global' : 'Gestionnaire'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    <Building size={14} />
                    <span>
                      {u.is_superuser ? (
                        <i style={{ opacity: 0.7 }}>Toutes les facultés</i>
                      ) : (
                        u.profile?.faculte_details?.nom || 'Aucune faculté'
                      )}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '8px' }}>
                  <button onClick={() => handleOpenModal(u)} className="action-btn" style={{ flex: 1, justifyContent: 'center', padding: '10px' }} title="Modifier">
                    <Edit2 size={16} /> Modifier
                  </button>
                  <button onClick={() => handleDelete(u.id)} className="action-btn danger" style={{ flex: 1, justifyContent: 'center', padding: '10px' }} title="Supprimer">
                    <Trash2 size={16} /> Supprimer
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? "Modifier Utilisateur" : "Nouvel Utilisateur"}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}><User size={12}/> Identifiant</label>
              <input type="text" required value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}><Mail size={12}/> Email</label>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>Mdp {editingUser && "(laisser vide pour ne pas changer)"}</label>
            <input type="password" required={!editingUser} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}><Shield size={12}/> Rôle</label>
              <select 
                value={formData.is_superuser} 
                onChange={(e) => setFormData({...formData, is_superuser: e.target.value === 'true'})}
                disabled={!currentUser?.is_superuser}
              >
                <option value="false">Gestionnaire Faculté</option>
                {currentUser?.is_superuser && <option value="true">Administrateur Global</option>}
              </select>
            </div>
            {!formData.is_superuser && (
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}><Building size={12}/> Faculté</label>
                <select 
                    required={!formData.is_superuser} 
                    value={formData.faculte_id} 
                    onChange={(e) => setFormData({...formData, faculte_id: e.target.value})}
                    disabled={!currentUser?.is_superuser && !editingUser}
                >
                  <option value="">Sélectionner une faculté...</option>
                  {faculties.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                </select>
                {!currentUser?.is_superuser && !editingUser && currentFaculty && (
                    <p style={{ fontSize: '10px', color: 'var(--accent)', marginTop: '4px' }}>Force : {currentFaculty.nom}</p>
                )}
              </div>
            )}
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

export default Users;
