import React, { useState, useEffect } from 'react';
import { teachingService, teacherService, subjectService, classService, semesterService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, Plus, Trash2, Edit2, User, BookOpen, GraduationCap, Clock, Save, LayoutGrid, LayoutList } from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '../components/Modal';

const Teachings = () => {
  const { selectedYearId } = useAuth();
  const [teachings, setTeachings] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeaching, setEditingTeaching] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [formData, setFormData] = useState({
    enseignant: '',
    matiere: '',
    classe: '',
    semestre: ''
  });

  useEffect(() => {
    fetchTeachings();
    fetchData();
  }, [selectedYearId]);

  const fetchTeachings = async () => {
    try {
      setLoading(true);
      const res = await teachingService.getAll(selectedYearId);
      setTeachings(res.data);
    } catch (err) {
      console.error("Erreur listing enseignements", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const [teachersRes, subjectsRes, classesRes, semestersRes] = await Promise.all([
        teacherService.getAll(),
        subjectService.getAll(),
        classService.getAll(),
        semesterService.getAll()
      ]);
      setTeachers(teachersRes.data);
      setSubjects(subjectsRes.data);
      setClasses(classesRes.data);
      setSemesters(semestersRes.data);
    } catch (err) {
      console.error("Erreur chargement données", err);
    }
  };

  const handleOpenModal = (t = null) => {
    if (t) {
      setEditingTeaching(t);
      setFormData({
        enseignant: t.enseignant,
        matiere: t.matiere,
        classe: t.classe,
        semestre: t.semestre
      });
    } else {
      setEditingTeaching(null);
      setFormData({ enseignant: '', matiere: '', classe: '', semestre: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (selectedYearId) {
        payload.annee_academique = selectedYearId;
      }
      
      if (editingTeaching) {
        await teachingService.update(editingTeaching.id, payload);
      } else {
        await teachingService.create(payload);
      }
      setIsModalOpen(false);
      fetchTeachings();
    } catch (err) {
      alert("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cette affectation ?")) {
      try {
        await teachingService.delete(id);
        fetchTeachings();
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold' }}>Enseignements</h2>
          <p style={{ color: 'var(--text-muted)' }}>Gérez les affectations des professeurs aux matières et aux classes.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={20} /> Nouvelle Affectation
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {teachings.map((t) => (
              <motion.div key={t.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-morphism" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: 'var(--primary)' }}>
                    <User size={18} />
                    {t.enseignant_details?.prenom} {t.enseignant_details?.nom}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleOpenModal(t)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Edit2 size={16}/></button>
                    <button onClick={() => handleDelete(t.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={16}/></button>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                        <BookOpen size={14} color="var(--accent)" />
                        <span style={{ color: 'var(--text-muted)' }}>Matière :</span>
                        <span style={{ fontWeight: '500' }}>{t.matiere_details?.nom}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                        <GraduationCap size={14} color="#c084fc" />
                        <span style={{ color: 'var(--text-muted)' }}>Classe :</span>
                        <span style={{ fontWeight: '500' }}>{t.classe_details?.nom}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                        <Clock size={14} color="var(--text-muted)" />
                        <span style={{ color: 'var(--text-muted)' }}>Semestre :</span>
                        <span style={{ fontWeight: '500' }}>{t.semestre_details?.nom}</span>
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
                <th>Enseignant</th>
                <th>Matière</th>
                <th>Classe</th>
                <th>Semestre</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachings.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                      <User size={16} color="var(--primary)" />
                      {t.enseignant_details?.prenom} {t.enseignant_details?.nom}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BookOpen size={16} color="var(--accent)" />
                      {t.matiere_details?.nom}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <GraduationCap size={16} color="#c084fc" />
                      {t.classe_details?.nom}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={16} color="var(--text-muted)" />
                      {t.semestre_details?.nom}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={() => handleOpenModal(t)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(t.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTeaching ? "Modifier Affectation" : "Nouvelle Affectation"}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Enseignant</label>
            <select required value={formData.enseignant} onChange={(e) => setFormData({...formData, enseignant: e.target.value})}>
              <option value="">Sélectionner...</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.prenom} {t.nom}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Matière</label>
            <select required value={formData.matiere} onChange={(e) => setFormData({...formData, matiere: e.target.value})}>
              <option value="">Sélectionner...</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.nom} ({s.code})</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Classe</label>
              <select required value={formData.classe} onChange={(e) => setFormData({...formData, classe: e.target.value})}>
                <option value="">Sélectionner...</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Semestre</label>
              <select required value={formData.semestre} onChange={(e) => setFormData({...formData, semestre: e.target.value})}>
                <option value="">Sélectionner...</option>
                {semesters.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
              </select>
            </div>
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

export default Teachings;
