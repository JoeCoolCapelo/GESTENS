import React, { useState, useEffect } from 'react';
import { teacherService, departmentService, scheduleService } from '../services/api';
import { FileText, Users, Plus, Edit2, Trash2, Search, Filter, Save, User as UserIcon, Phone, Mail, Award, BadgeCheck, Fingerprint, Briefcase, Eye, Calendar as CalendarIcon, Printer, X, Camera, LayoutGrid, LayoutList, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '../components/Modal';
import PrintLayout from '../components/PrintLayout';
import SchedulePrintGrid from '../components/SchedulePrintGrid';
import TeacherListPrint from '../components/TeacherListPrint';

const getImageUrl = (url) => {
  if (!url) return null;
  if (typeof url !== 'string') return null;
  if (url.startsWith('http')) return url;
  return `http://localhost:8000${url}`;
};

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showListPrintPreview, setShowListPrintPreview] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [listToPrint, setListToPrint] = useState([]);
  const [printTitle, setPrintTitle] = useState('');
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'table'
  const [formData, setFormData] = useState({
    prenom: '', nom: '', email: '', telephone: '', 
    date_naissance: '', specialite: '', dernier_diplome: '', 
    grade_academique: '', matricule: '', fonction: '', 
    type: 'National', departement: ''
  });

  const handlePrintList = (type) => {
    const filtered = teachers.filter(t => t.type === type);
    setListToPrint(filtered);
    setPrintTitle(`LISTE DES ENSEIGNANTS : ${type.toUpperCase()}S`);
    setShowListPrintPreview(true);
  };

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  useEffect(() => {
    fetchTeachers();
    fetchDepartments();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await teacherService.getAll();
      setTeachers(res.data);
    } catch (err) {
      console.error("Erreur listing enseignants", err);
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

  const handleOpenModal = (teacher = null) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setFormData({
        prenom: teacher.prenom, nom: teacher.nom, email: teacher.email,
        telephone: teacher.telephone || '', date_naissance: teacher.date_naissance || '',
        specialite: teacher.specialite || '', dernier_diplome: teacher.dernier_diplome || '',
        grade_academique: teacher.grade_academique || '', matricule: teacher.matricule,
        fonction: teacher.fonction || '', type: teacher.type, departement: teacher.departement
      });
    } else {
      setEditingTeacher(null);
      setFormData({
        prenom: '', nom: '', email: '', telephone: '', 
        date_naissance: '', specialite: '', dernier_diplome: '', 
        grade_academique: '', matricule: '', fonction: '', 
        type: 'National', departement: ''
      });
      setPhotoFile(null);
      setPhotoPreview(null);
    }
    setIsModalOpen(true);
  };

  const handleOpenView = (teacher) => {
    setSelectedTeacher(teacher);
    setIsViewModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        // N'envoyer que les valeurs non nulles et non vides
        if (formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });
      
      if (photoFile) {
        data.append('photo', photoFile);
      }

      if (editingTeacher) {
        await teacherService.update(editingTeacher.id, data);
      } else {
        await teacherService.create(data);
      }
      setIsModalOpen(false);
      fetchTeachers();
    } catch (err) {
      console.error("Erreur soumission:", err.response?.data);
      alert("Erreur lors de l'enregistrement. Vérifiez que tous les champs obligatoires sont remplis.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cet enseignant ?")) {
      try {
        await teacherService.delete(id);
        fetchTeachers();
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  const filteredTeachers = teachers.filter(t => 
    `${t.prenom} ${t.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.matricule.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold' }}>Enseignants</h2>
          <p style={{ color: 'var(--text-muted)' }}>Gérez la liste des professeurs et intervenants.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn glass-morphism" onClick={() => handlePrintList('National')} style={{ color: 'var(--primary)' }}>
            <Printer size={18} /> Nationaux
          </button>
          <button className="btn glass-morphism" onClick={() => handlePrintList('Etranger')} style={{ color: 'var(--accent)' }}>
            <Printer size={18} /> Étrangers
          </button>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={20} /> Nouveau
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Rechercher par nom ou matricule..." 
            style={{ paddingLeft: '48px', marginBottom: 0 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <button 
            onClick={() => setViewMode('grid')}
            style={{ 
              padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: viewMode === 'grid' ? 'var(--primary)' : 'transparent',
              color: viewMode === 'grid' ? 'white' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s'
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
              display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s'
            }}
          >
            <LayoutList size={18} />
          </button>
        </div>

        <button className="btn glass-morphism" style={{ padding: '10px 20px', color: 'var(--text-muted)' }}>
          <Filter size={18} /> Filtres
        </button>
      </div>

      <div style={{ minHeight: '400px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement...</div>
        ) : viewMode === 'grid' ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '24px' 
          }}>
            {filteredTeachers.map((teacher) => (
              <motion.div 
                key={teacher.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-morphism"
                style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}
              >
                <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleOpenView(teacher)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}><Eye size={14}/></button>
                    <button onClick={() => handleOpenModal(teacher)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '6px', borderRadius: '8px', cursor: 'pointer' }}><Edit2 size={14}/></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ 
                    width: '80px', height: '80px', borderRadius: '24px', overflow: 'hidden', 
                    marginBottom: '16px', border: '3px solid var(--primary)', padding: '3px', background: 'var(--bg-card)'
                  }}>
                    {teacher.photo ? (
                      <img src={getImageUrl(teacher.photo)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '18px' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'var(--primary)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', color: 'white' }}>
                        {teacher.prenom[0]}{teacher.nom[0]}
                      </div>
                    )}
                  </div>
                  
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>{teacher.prenom} {teacher.nom}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '500', marginBottom: '16px' }}>{teacher.grade_academique || 'Enseignant'}</p>
                  
                  <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '12px', textAlign: 'left' }}>
                        <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Matricule</span>
                        <code style={{ fontSize: '12px' }}>{teacher.matricule}</code>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '12px', textAlign: 'left' }}>
                        <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Département</span>
                        <span style={{ fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{teacher.departement_details?.nom || 'N/A'}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                    <span style={{ 
                        padding: '4px 12px', borderRadius: '20px', fontSize: '11px',
                        background: teacher.type === 'National' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: teacher.type === 'National' ? '#10b981' : '#f59e0b'
                    }}>
                        {teacher.type}
                    </span>
                    <button onClick={() => handleDelete(teacher.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                        <Trash2 size={14} /> Supprimer
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-morphism" style={{ overflow: 'hidden' }}>
            <table className="data-table">
            <thead>
              <tr>
                <th>Identité</th>
                <th>Matricule</th>
                <th>Département</th>
                <th>Grade</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '36px', height: '36px', borderRadius: '10px', overflow: 'hidden', 
                        background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {teacher.photo ? (
                          <img src={getImageUrl(teacher.photo)} alt="Profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)' }}>
                            {teacher.prenom[0]}{teacher.nom[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{teacher.prenom} {teacher.nom}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{teacher.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><code>{teacher.matricule}</code></td>
                  <td>{teacher.departement_details?.nom || 'N/A'}</td>
                  <td>{teacher.grade_academique}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      fontSize: '11px',
                      background: teacher.type === 'National' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: teacher.type === 'National' ? '#10b981' : '#f59e0b'
                    }}>
                      {teacher.type}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button 
                        onClick={() => handleOpenView(teacher)}
                        style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}
                        title="Détails"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleOpenModal(teacher)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        title="Modifier"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(teacher.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                        title="Supprimer"
                      >
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

      {/* Modal d'édition */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTeacher ? "Modifier Enseignant" : "Nouvel Enseignant"}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}><UserIcon size={12}/> Prénom</label>
            <input type="text" required value={formData.prenom} onChange={(e) => setFormData({...formData, prenom: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}><UserIcon size={12}/> Nom</label>
            <input type="text" required value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}><Mail size={12}/> Email</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}><Phone size={12}/> Téléphone</label>
            <input type="text" value={formData.telephone} onChange={(e) => setFormData({...formData, telephone: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}><Fingerprint size={12}/> Matricule</label>
            <input type="text" required value={formData.matricule} onChange={(e) => setFormData({...formData, matricule: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}><Award size={12}/> Grade</label>
            <select value={formData.grade_academique} onChange={(e) => setFormData({...formData, grade_academique: e.target.value})}>
              <option value="">Sélectionner...</option>
              {['Assistant', 'Maître de Conférences', 'Professeur'].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}><BadgeCheck size={12}/> Spécialité</label>
            <input type="text" value={formData.specialite} onChange={(e) => setFormData({...formData, specialite: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}><Briefcase size={12}/> Fonction</label>
            <input type="text" value={formData.fonction} onChange={(e) => setFormData({...formData, fonction: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}><CalendarIcon size={12}/> Date de Naissance</label>
            <input type="date" value={formData.date_naissance} onChange={(e) => setFormData({...formData, date_naissance: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}><Award size={12}/> Dernier Diplôme</label>
            <input type="text" value={formData.dernier_diplome} onChange={(e) => setFormData({...formData, dernier_diplome: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>Département</label>
            <select required value={formData.departement} onChange={(e) => setFormData({...formData, departement: e.target.value})}>
              <option value="">Sélectionner...</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>Type</label>
            <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
              <option value="National">National</option>
              <option value="Etranger">Étranger</option>
            </select>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}><Camera size={12}/> Photo de profil</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '60px', height: '60px', borderRadius: '12px', border: '2px dashed var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'rgba(255,255,255,0.05)'
              }}>
                {photoPreview || (editingTeacher && editingTeacher.photo) ? (
                  <img src={photoPreview || getImageUrl(editingTeacher.photo)} alt="Profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Camera size={20} style={{ color: 'var(--text-muted)' }} />
                )}
              </div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setPhotoFile(file);
                    setPhotoPreview(URL.createObjectURL(file));
                  }
                }} 
              />
            </div>
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn glass-morphism" onClick={() => setIsModalOpen(false)}>Annuler</button>
            <button type="submit" className="btn btn-primary"><Save size={18} /> Enregistrer</button>
          </div>
        </form>
      </Modal>

      {/* Modal de Visionnage (Toutes les infos) */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Profil Enseignant">
        {selectedTeacher && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10px', padding: '20px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '16px' }}>
              {selectedTeacher.photo ? (
                <img src={getImageUrl(selectedTeacher.photo)} alt="Profil" style={{ width: '80px', height: '80px', borderRadius: '20px', objectFit: 'cover', border: '3px solid var(--primary)' }} />
              ) : (
                <div style={{ width: '64px', height: '64px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                  {selectedTeacher.prenom[0]}{selectedTeacher.nom[0]}
                </div>
              )}
              <div>
                <h3 style={{ fontSize: '22px', fontWeight: 'bold' }}>{selectedTeacher.prenom} {selectedTeacher.nom}</h3>
                <p style={{ color: 'var(--primary)', fontWeight: '500' }}>{selectedTeacher.grade_academique || 'Enseignant'}</p>
              </div>
            </div>

            <InfoItem icon={<Fingerprint size={16}/>} label="Matricule" value={selectedTeacher.matricule} />
            <InfoItem icon={<BadgeCheck size={16}/>} label="Spécialité" value={selectedTeacher.specialite} />
            <InfoItem icon={<Mail size={16}/>} label="Email" value={selectedTeacher.email} />
            <InfoItem icon={<Phone size={16}/>} label="Téléphone" value={selectedTeacher.telephone} />
            <InfoItem icon={<Briefcase size={16}/>} label="Fonction" value={selectedTeacher.fonction} />
            <InfoItem icon={<Award size={16}/>} label="Dernier Diplôme" value={selectedTeacher.dernier_diplome} />
            <InfoItem icon={<CalendarIcon size={16}/>} label="Date de Naissance" value={selectedTeacher.date_naissance} />
            <InfoItem icon={<Users size={16}/>} label="Département" value={selectedTeacher.departement_details?.nom} />
            
            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button className="btn btn-primary" onClick={() => setIsViewModalOpen(false)}>Fermer</button>
            </div>
          </div>
        )}
      </Modal>
      {/* Modal d'aperçu Impression (Liste des Enseignants) */}
      {showListPrintPreview && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          zIndex: 9999, background: 'white', color: 'black', 
          padding: '40px', overflowY: 'auto' 
        }}>
          <div className="no-print" style={{ 
            position: 'fixed', top: '20px', right: '40px', 
            display: 'flex', gap: '12px', zIndex: 10001 
          }}>
            <button className="btn btn-primary" onClick={() => window.print()}>
              <Printer size={18} /> Imprimer maintenant
            </button>
            <button className="btn glass-morphism" onClick={() => setShowListPrintPreview(false)}>
              <X size={18} /> Quitter l'aperçu
            </button>
          </div>

          <PrintLayout title={printTitle}>
            <TeacherListPrint teachers={listToPrint} />
          </PrintLayout>
        </div>
      )}
    </motion.div>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div>
    <p style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px', marginBottom: '4px' }}>
      {icon} {label}
    </p>
    <p style={{ fontWeight: '500' }}>{value || 'N/A'}</p>
  </div>
);

export default Teachers;
