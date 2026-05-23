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

      <div className="glass-morphism" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Chargement...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Rôle</th>
                <th>Faculté Associée</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={16} color="white" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{u.username}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      fontSize: '11px',
                      background: u.is_superuser ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                      color: u.is_superuser ? '#ef4444' : 'var(--primary)'
                    }}>
                      {u.is_superuser ? 'Admin Global' : 'Gestionnaire'}
                    </span>
                  </td>
                  <td>
                    {u.is_superuser ? (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Toutes les facultés</span>
                    ) : (
                      u.profile?.faculte_details?.nom || 'Aucune'
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={() => handleOpenModal(u)} className="action-btn" title="Modifier"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(u.id)} className="action-btn danger" title="Supprimer"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
