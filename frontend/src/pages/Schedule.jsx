import React, { useState, useEffect } from 'react';
import { scheduleService, teachingService, roomService, classService, semesterService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FileText, Calendar, Plus, Clock, User, BookOpen, MapPin, Save, Trash2, Printer, X } from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '../components/Modal';
import PrintLayout from '../components/PrintLayout';
import SchedulePrintGrid from '../components/SchedulePrintGrid';
const Schedule = () => {
  const { isTeacher } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [teachings, setTeachings] = useState([]);
  const [classes, setClasses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedClasse, setSelectedClasse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    jour: 'Lundi',
    heure_debut: '08:00',
    heure_fin: '10:00',
    enseignement: '',
    salle: ''
  });
  const [rooms, setRooms] = useState([]);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  useEffect(() => {
    fetchSchedules();
    fetchTeachings();
    fetchRooms();
    fetchClasses();
    fetchSemesters();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await classService.getAll();
      setClasses(res.data);
    } catch (err) {
      console.error("Erreur listing classes", err);
    }
  };

  const fetchSemesters = async () => {
    try {
      const res = await semesterService.getAll();
      setSemesters(res.data);
    } catch (err) {
      console.error("Erreur listing semestres", err);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await roomService.getAll();
      setRooms(res.data);
    } catch (err) {
      console.error("Erreur listing salles", err);
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await scheduleService.getAll();
      setSchedules(res.data);
    } catch (err) {
      console.error("Erreur listing emplois du temps", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachings = async () => {
    try {
      const res = await teachingService.getAll();
      setTeachings(res.data);
    } catch (err) {
      console.error("Erreur listing enseignements", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const data = {
        ...formData,
        heure_debut: formData.heure_debut.length === 5 ? `${formData.heure_debut}:00` : formData.heure_debut,
        heure_fin: formData.heure_fin.length === 5 ? `${formData.heure_fin}:00` : formData.heure_fin,
        salle: formData.salle || null
      };
      await scheduleService.create(data);
      setIsModalOpen(false);
      fetchSchedules();
      setFormData({ ...formData, enseignement: '', salle: '' });
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        const errors = err.response.data;
        if (typeof errors === 'object') {
          // Gérer les erreurs de validation DRF
          const messages = Object.values(errors).flat().join(' ');
          setErrorMessage(messages);
        } else {
          setErrorMessage("Une erreur est survenue lors de l'ajout.");
        }
      } else {
        alert("Erreur réseau ou serveur");
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce créneau ?")) {
      try {
        await scheduleService.delete(id);
        fetchSchedules();
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  // Filter schedules
  const filteredSchedules = schedules.filter(item => {
    const matchClasse = selectedClasse ? item.enseignement_details?.classe_details?.id.toString() === selectedClasse : true;
    const matchSemester = selectedSemester ? item.enseignement_details?.semestre_details?.id.toString() === selectedSemester : true;
    return matchClasse && matchSemester;
  });

  // Grouper par jour
  const scheduleByDay = days.reduce((acc, day) => {
    acc[day] = filteredSchedules.filter(s => s.jour === day);
    return acc;
  }, {});

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold' }}>{isTeacher ? "Mon Emploi du temps" : "Emploi du temps"}</h2>
          <p style={{ color: 'var(--text-muted)' }}>{isTeacher ? "Visualisez vos heures de cours programmées." : "Visualisez et gérez le planning des cours hebdomadaires."}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn glass-morphism" onClick={() => setShowPrintPreview(true)}>
            <Printer size={20} /> Aperçu & Imprimer
          </button>
          {!isTeacher && (
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={20} /> Ajouter un cours
            </button>
          )}
        </div>
      </header>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <select 
          className="glass-morphism"
          style={{ padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-main)', outline: 'none', width: 'auto', minWidth: '200px', fontSize: '14px' }}
          value={selectedClasse}
          onChange={(e) => setSelectedClasse(e.target.value)}
        >
          <option value="" style={{ color: 'black' }}>Toutes les licences</option>
          {classes.map(c => (
            <option key={c.id} value={c.id} style={{ color: 'black' }}>{c.nom} ({c.niveau})</option>
          ))}
        </select>

        <select 
          className="glass-morphism"
          style={{ padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-main)', outline: 'none', width: 'auto', minWidth: '160px', fontSize: '14px' }}
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
        >
          <option value="" style={{ color: 'black' }}>Tous les semestres</option>
          {semesters.map(s => (
            <option key={s.id} value={s.id} style={{ color: 'black' }}>{s.nom}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
        {days.map((day) => (
          <div key={day} style={{ minWidth: '280px', flex: 1 }}>
            <div className="glass-morphism" style={{ padding: '12px 16px', marginBottom: '16px', textAlign: 'center', background: 'var(--primary)', borderColor: 'var(--primary)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white' }}>{day}</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {loading ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>...</div>
              ) : scheduleByDay[day]?.length > 0 ? (
                scheduleByDay[day].map((item) => (
                  <div key={item.id} className="glass-morphism" style={{ padding: '16px', borderLeft: '4px solid var(--primary)', position: 'relative' }}>
                    {!isTeacher && (
                      <button 
                        onClick={() => handleDelete(item.id)}
                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'var(--danger)', opacity: 0.5, cursor: 'pointer' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--primary)', marginBottom: '8px', fontWeight: 'bold' }}>
                      <Clock size={12} /> {(item.heure_debut || '').slice(0, 5)} - {(item.heure_fin || '').slice(0, 5)}
                    </div>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                      {item.enseignement_details?.matiere_details?.nom}
                    </h4>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      <User size={12} style={{ marginRight: '4px' }} />
                      {item.enseignement_details?.enseignant_details?.prenom} {item.enseignement_details?.enseignant_details?.nom}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      <MapPin size={12} style={{ marginRight: '4px' }} />
                      {item.salle_details?.nom || 'Non assignée'}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Aucun cours
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Ajouter un créneau"
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Jour</label>
            <select 
              value={formData.jour}
              onChange={(e) => setFormData({...formData, jour: e.target.value})}
            >
              {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Heure Début</label>
              <input 
                type="time" required
                value={formData.heure_debut}
                onChange={(e) => setFormData({...formData, heure_debut: e.target.value})}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Heure Fin</label>
              <input 
                type="time" required
                value={formData.heure_fin}
                onChange={(e) => setFormData({...formData, heure_fin: e.target.value})}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Enseignement (Cours)</label>
            <select 
              required
              value={formData.enseignement}
              onChange={(e) => setFormData({...formData, enseignement: e.target.value})}
            >
              <option value="">Choisir un enseignement...</option>
              {teachings.map(t => (
                <option key={t.id} value={t.id}>
                  {t.matiere_details?.nom} - {t.enseignant_details?.nom} ({t.classe_details?.nom})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Salle (Optionnel)</label>
            <select 
              value={formData.salle}
              onChange={(e) => setFormData({...formData, salle: e.target.value})}
            >
              <option value="">Choisir une salle...</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{r.nom} ({r.capacite} places)</option>
              ))}
            </select>
          </div>

          {errorMessage && (
            <div style={{ 
              marginBottom: '16px', 
              padding: '12px', 
              borderRadius: '8px', 
              background: 'rgba(239, 68, 68, 0.1)', 
              color: 'var(--danger)', 
              fontSize: '13px', 
              border: '1px solid var(--danger)' 
            }}>
              <strong>Attention :</strong> {errorMessage}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn glass-morphism" onClick={() => setIsModalOpen(false)}>Annuler</button>
            <button type="submit" className="btn btn-primary">
              <Save size={18} /> Enregistrer
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal d'aperçu Impression */}
      {showPrintPreview && (
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
            <button className="btn glass-morphism" onClick={() => setShowPrintPreview(false)}>
              <X size={18} /> Quitter l'aperçu
            </button>
          </div>

          <PrintLayout 
            title={`EMPLOI DU TEMPS HEBDOMADAIRE${selectedClasse ? ' - ' + classes.find(c => c.id.toString() === selectedClasse)?.nom : ''}${selectedSemester ? ' (' + semesters.find(s => s.id.toString() === selectedSemester)?.nom + ')' : ''}`}
            departmentName={selectedClasse ? classes.find(c => c.id.toString() === selectedClasse)?.departement_details?.nom : 'Tous les départements'}
          >
            <div style={{ marginTop: '30px' }}>
              <SchedulePrintGrid schedules={filteredSchedules} days={days} />
            </div>
          </PrintLayout>
        </div>
      )}
    </motion.div>
  );
};

export default Schedule;
