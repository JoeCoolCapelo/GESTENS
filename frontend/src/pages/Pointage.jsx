import React, { useState, useEffect } from 'react';
import { scheduleService, pointageService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, CheckCircle, XCircle, AlertCircle, Clock, BookOpen, MapPin, Users, ChevronLeft, ChevronRight, Edit2, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../components/Modal';

const STATUTS = [
  { value: 'PRESENT',  label: 'Effectué',  color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: CheckCircle },
  { value: 'ABSENT',   label: 'Absent',    color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  icon: XCircle },
  { value: 'REPORTE',  label: 'Reporté',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: Clock },
  { value: 'ANNULE',   label: 'Annulé',    color: '#6b7280', bg: 'rgba(107,114,128,0.12)',icon: AlertCircle },
];

const getStatut = (val) => STATUTS.find(s => s.value === val) || STATUTS[0];

const StatusBadge = ({ statut }) => {
  const s = getStatut(statut);
  const Icon = s.icon;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '5px 12px', borderRadius: '20px',
      background: s.bg, color: s.color,
      fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px'
    }}>
      <Icon size={13} /> {s.label}
    </div>
  );
};

const Pointage = () => {
  const { isTeacher, selectedYearId } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [pointages, setPointages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSlot, setCurrentSlot] = useState(null);
  const [formData, setFormData] = useState({ statut: 'PRESENT', motif: '', heures_effectuees: 2 });

  const DAYS_FR = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];

  useEffect(() => { fetchData(); }, [selectedYearId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sr, pr] = await Promise.all([scheduleService.getAll(selectedYearId), pointageService.getAll(selectedYearId)]);
      setSchedules(sr.data);
      setPointages(pr.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const getDayName = (d) => DAYS_FR[new Date(d).getDay()];
  const selectedDayName = getDayName(selectedDate);
  const dailySchedules = schedules.filter(s => s.jour === selectedDayName);
  const getPointage = (slotId) => pointages.find(p => p.emploi_du_temps === slotId && p.date === selectedDate);

  const shiftDate = (n) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + n);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const openModal = (slot) => {
    const existing = getPointage(slot.id);
    const [hD, mD] = slot.heure_debut.split(':').map(Number);
    const [hF, mF] = slot.heure_fin.split(':').map(Number);
    const duree = Math.max(1, (hF + mF/60) - (hD + mD/60));
    setCurrentSlot(slot);
    setFormData({
      statut: existing?.statut || 'PRESENT',
      motif: existing?.motif || '',
      heures_effectuees: existing?.heures_effectuees ?? duree.toFixed(1)
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const existing = getPointage(currentSlot.id);
    const data = { ...formData, emploi_du_temps: currentSlot.id, date: selectedDate };
    try {
      if (existing) await pointageService.update(existing.id, data);
      else await pointageService.create(data);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur lors de l'enregistrement.");
    }
  };

  // Stats résumé
  const totalPointages = dailySchedules.filter(s => getPointage(s.id)).length;
  const totalCours = dailySchedules.length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <header style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '6px' }}>Pointage des Cours</h2>
            <p style={{ color: 'var(--text-muted)' }}>Validez l'exécution de vos séances planifiées.</p>
          </div>

          {/* Date navigator */}
          <div className="glass-morphism" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', borderRadius: '14px' }}>
            <button onClick={() => shiftDate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
              <ChevronLeft size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={18} color="var(--primary)" />
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                style={{ border: 'none', background: 'transparent', color: 'var(--text-main)', fontSize: '15px', fontWeight: '600', outline: 'none', cursor: 'pointer' }}
              />
            </div>
            <button onClick={() => shiftDate(1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Date label + progress */}
        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{formatDate(selectedDate)}</p>
          {totalCours > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '160px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(totalPointages / totalCours) * 100}%` }}
                  transition={{ duration: 0.8 }}
                  style={{ height: '100%', background: 'linear-gradient(to right, var(--primary), #a855f7)', borderRadius: '3px' }}
                />
              </div>
              <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '600' }}>{totalPointages}/{totalCours} pointés</span>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
          <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px' }} />
          Chargement...
        </div>
      ) : dailySchedules.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-morphism"
          style={{ padding: '60px', textAlign: 'center' }}
        >
          <Calendar size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>Aucun cours ce jour</p>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Il n'y a aucun cours planifié pour le {selectedDayName.toLowerCase()}.</p>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          <AnimatePresence>
            {dailySchedules.map((slot, idx) => {
              const pointage = getPointage(slot.id);
              const statut = pointage ? getStatut(pointage.statut) : null;
              const borderColor = statut ? statut.color : 'rgba(255,255,255,0.08)';

              return (
                <motion.div
                  key={slot.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.07 }}
                  whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(0,0,0,0.3)' }}
                  className="glass-morphism"
                  style={{
                    padding: '0',
                    overflow: 'hidden',
                    border: `1px solid ${borderColor}`,
                    borderTop: `4px solid ${borderColor}`,
                    position: 'relative'
                  }}
                >
                  {/* Header de la carte */}
                  <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: 'rgba(99,102,241,0.12)', color: 'var(--primary)',
                        padding: '4px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: '700'
                      }}>
                        <Clock size={13} />
                        {slot.heure_debut.slice(0,5)} – {slot.heure_fin.slice(0,5)}
                      </div>
                      {statut && <StatusBadge statut={pointage.statut} />}
                      {!statut && (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                          Non pointé
                        </div>
                      )}
                    </div>

                    <h3 style={{ fontSize: '17px', fontWeight: '700', marginTop: '14px', marginBottom: '4px', lineHeight: '1.3' }}>
                      {slot.enseignement_details?.matiere_details?.nom || 'Matière inconnue'}
                    </h3>
                  </div>

                  {/* Infos de la carte */}
                  <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <Users size={14} color="var(--primary)" />
                      <span>{slot.enseignement_details?.classe_details?.nom || 'Classe N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <MapPin size={14} color="#a855f7" />
                      <span>{slot.salle_details?.nom || 'Salle non assignée'}</span>
                    </div>
                    {pointage?.motif && (
                      <div style={{ marginTop: '4px', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', borderLeft: `3px solid ${getStatut(pointage.statut).color}` }}>
                        « {pointage.motif} »
                      </div>
                    )}
                    {pointage?.heures_effectuees != null && (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        ⏱ {pointage.heures_effectuees}h effectuées
                      </div>
                    )}
                  </div>

                  {/* Footer de la carte */}
                  {isTeacher && (
                    <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <button
                        className="btn btn-primary"
                        style={{ width: '100%', fontSize: '13px', padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        onClick={() => openModal(slot)}
                      >
                        {pointage ? <><Edit2 size={14} /> Modifier le pointage</> : <><PlusCircle size={14} /> Pointer cette séance</>}
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Modal pointage */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Pointer la séance">
        {currentSlot && (
          <div style={{ marginBottom: '20px', padding: '14px', background: 'rgba(99,102,241,0.07)', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.15)' }}>
            <p style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>
              {currentSlot.enseignement_details?.matiere_details?.nom}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {currentSlot.heure_debut?.slice(0,5)} – {currentSlot.heure_fin?.slice(0,5)} • {currentSlot.enseignement_details?.classe_details?.nom}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Statut en boutons */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600' }}>Statut de la séance</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {STATUTS.map(s => {
                const Icon = s.icon;
                const selected = formData.statut === s.value;
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, statut: s.value })}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: `2px solid ${selected ? s.color : 'rgba(255,255,255,0.08)'}`,
                      background: selected ? s.bg : 'rgba(255,255,255,0.02)',
                      color: selected ? s.color : 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '8px',
                      fontWeight: selected ? '700' : '500',
                      fontSize: '13px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Icon size={15} /> {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>Heures effectuées</label>
            <input
              type="number" step="0.5" min="0" required
              value={formData.heures_effectuees}
              onChange={e => setFormData({ ...formData, heures_effectuees: e.target.value })}
            />
          </div>

          {formData.statut !== 'PRESENT' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ marginBottom: '20px', overflow: 'hidden' }}
            >
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>Motif <span style={{ color: '#ef4444' }}>*</span></label>
              <textarea
                required
                value={formData.motif}
                onChange={e => setFormData({ ...formData, motif: e.target.value })}
                rows="3"
                placeholder="Expliquez la raison de l'absence / report / annulation..."
                style={{ width: '100%', resize: 'vertical' }}
              />
            </motion.div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" className="btn glass-morphism" onClick={() => setIsModalOpen(false)}>Annuler</button>
            <button type="submit" className="btn btn-primary">Enregistrer</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default Pointage;
