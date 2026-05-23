import React, { useState, useEffect } from 'react';
import { roomService, facultyService } from '../services/api';
import { MapPin, Plus, Edit2, Trash2, Save, Users, LayoutGrid, LayoutList } from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const { user, faculty } = useAuth();
  const [formData, setFormData] = useState({ nom: '', capacite: '', faculte: '' });
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchRooms();
    fetchFaculties();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await roomService.getAll();
      setRooms(res.data);
    } catch (err) {
      console.error("Erreur listing salles", err);
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

  const handleOpenModal = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setFormData({ nom: room.nom, capacite: room.capacite || '', faculte: room.faculte });
    } else {
      setEditingRoom(null);
      const defaultFaculte = (!user?.is_superuser && faculty) ? faculty.id : '';
      setFormData({ nom: '', capacite: '', faculte: defaultFaculte });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await roomService.update(editingRoom.id, formData);
      } else {
        await roomService.create(formData);
      }
      setIsModalOpen(false);
      fetchRooms();
    } catch (err) {
      alert("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cette salle ?")) {
      try {
        await roomService.delete(id);
        fetchRooms();
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold' }}>Salles de cours</h2>
          <p style={{ color: 'var(--text-muted)' }}>Gérez les salles et leur capacité d'accueil.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={20} /> Nouvelle Salle
        </button>
      </header>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={() => setViewMode('grid')} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: viewMode === 'grid' ? 'var(--primary)' : 'transparent', color: viewMode === 'grid' ? 'white' : 'var(--text-muted)' }}><LayoutGrid size={18}/></button>
          <button onClick={() => setViewMode('table')} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: viewMode === 'table' ? 'var(--primary)' : 'transparent', color: viewMode === 'table' ? 'white' : 'var(--text-muted)' }}><LayoutList size={18}/></button>
        </div>
      </div>

      <div style={{ minHeight: '300px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement...</div>
        ) : viewMode === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                {rooms.map((r) => (
                    <motion.div key={r.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-morphism" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <MapPin size={20} color="var(--primary)" />
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => handleOpenModal(r)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Edit2 size={16}/></button>
                                <button onClick={() => handleDelete(r.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={16}/></button>
                            </div>
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>{r.nom}</h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>{r.faculte_details?.nom || 'N/A'}</p>
                        
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Users size={16} color="var(--primary)" />
                            <span style={{ fontSize: '14px' }}>{r.capacite || '0'} places</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        ) : (
          <div className="glass-morphism">
            <table className="data-table">
            <thead>
              <tr>
                <th>Nom de la Salle</th>
                <th>Capacité</th>
                <th>Faculté</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <MapPin size={18} color="var(--primary)" />
                      {r.nom}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={14} color="var(--text-muted)" />
                        {r.capacite || 'Non définie'} places
                    </div>
                  </td>
                  <td>{r.faculte_details?.nom || 'N/A'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={() => handleOpenModal(r)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(r.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rooms.length === 0 && !loading && (
                  <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                          Aucune salle enregistrée.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRoom ? "Modifier Salle" : "Nouvelle Salle"}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Nom / Numéro de salle</label>
            <input type="text" required placeholder="Ex: Salle 101, Amphi A..." value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Capacité (Nombre de places)</label>
            <input type="number" value={formData.capacite} onChange={(e) => setFormData({...formData, capacite: e.target.value})} />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Faculté</label>
            <select 
              required 
              value={formData.faculte} 
              onChange={(e) => setFormData({...formData, faculte: e.target.value})}
              disabled={!user?.is_superuser && faculty && !editingRoom}
              style={{ opacity: (!user?.is_superuser && faculty && !editingRoom) ? 0.7 : 1, cursor: (!user?.is_superuser && faculty && !editingRoom) ? 'not-allowed' : 'pointer' }}
            >
              <option value="">Sélectionner une faculté...</option>
              {faculties.map(f => (
                <option key={f.id} value={f.id}>{f.nom}</option>
              ))}
            </select>
            {!user?.is_superuser && faculty && !editingRoom && (
              <p style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '-8px' }}>
                Votre compte est rattaché à : <strong>{faculty.nom}</strong>
              </p>
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

export default Rooms;
