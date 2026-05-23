import React, { useState, useEffect } from 'react';
import { authService, facultyService } from '../services/api';
import { Settings as SettingsIcon, School, Globe, Mail, MapPin, Save, Camera, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `http://localhost:8000${url}`;
};

const Settings = () => {
  const { user, faculty: userFaculty } = useAuth();
  const [univInfo, setUnivInfo] = useState({
    nom: '', sigle: '', slogan: '', republique: '', email_contact: '', bp: ''
  });
  const [facultyInfo, setFacultyInfo] = useState({
    nom: '', email: ''
  });
  const [loading, setLoading] = useState(true);
  const [univLogo, setUnivLogo] = useState(null);
  const [facLogo, setFacLogo] = useState(null);

  useEffect(() => {
    fetchInfo();
  }, []);

  const fetchInfo = async () => {
    try {
      const [u, f] = await Promise.all([
        authService.getUniversityInfo(),
        userFaculty ? facultyService.getById(userFaculty.id) : Promise.resolve({ data: null })
      ]);
      setUnivInfo(u.data);
      if (f.data) setFacultyInfo(f.data);
    } catch (err) {
      console.error("Erreur chargement settings", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUniv = async (e) => {
    e.preventDefault();
    // Normalement on aurait un service updateUniv. Pour l'instant on simule ou on utilise l'admin.
    // Mais on peut implémenter une vue partiale si besoin.
    alert("Fonctionnalité de mise à jour Université via API à implémenter (Admin Django recommandé pour la sécurité globale).");
  };

  const handleSaveFaculty = async (e) => {
    e.preventDefault();
    try {
        const formData = new FormData();
        formData.append('nom', facultyInfo.nom);
        formData.append('email', facultyInfo.email);
        if (facLogo) formData.append('logo', facLogo);
        
        await facultyService.update(userFaculty.id, formData);
        alert("Faculté mise à jour avec succès !");
        window.location.reload(); // Recharger pour voir le nouveau logo partout
    } catch (err) {
        alert("Erreur lors de la mise à jour.");
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Chargement...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <SettingsIcon size={32} /> Paramètres
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Configurez les informations institutionnelles.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '32px' }}>
        
        {/* Paramètres Université (Superuser uniquement) */}
        {user?.is_superuser && (
          <section className="glass-morphism" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Globe size={20} color="var(--primary)" /> Configuration de l'Université
          </h3>
          <form onSubmit={handleSaveUniv}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label className="label">Nom complet</label>
                <input type="text" value={univInfo.nom} readOnly={!user.is_superuser} />
              </div>
              <div>
                <label className="label">Sigle</label>
                <input type="text" value={univInfo.sigle} readOnly={!user.is_superuser} />
              </div>
              <div>
                <label className="label">République</label>
                <input type="text" value={univInfo.republique} readOnly={!user.is_superuser} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label className="label">Slogan</label>
                <input type="text" value={univInfo.slogan} readOnly={!user.is_superuser} />
              </div>
              <div>
                <label className="label">Email Contact</label>
                <input type="email" value={univInfo.email_contact} readOnly={!user.is_superuser} />
              </div>
              <div>
                <label className="label">Boîte Postale</label>
                <input type="text" value={univInfo.bp} readOnly={!user.is_superuser} />
              </div>
            </div>
            {user.is_superuser && (
              <button type="submit" className="btn btn-primary" style={{ marginTop: '24px', width: '100%' }}>
                <Save size={18} /> Enregistrer l'Université
              </button>
            )}
            {!user.is_superuser && (
                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>
                    <Info size={14} /> Seul l'administrateur central peut modifier ces informations.
                </div>
            )}
          </form>
        </section>
        )}

        {/* Paramètres Faculté */}
        {!user?.is_superuser && userFaculty && (
        <section className="glass-morphism" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <School size={20} color="#a855f7" /> Ma Faculté
          </h3>
          <form onSubmit={handleSaveFaculty}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
                 <div style={{ width: '80px', height: '80px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {facLogo ? (
                        <img src={URL.createObjectURL(facLogo)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : facultyInfo.logo ? (
                        <img src={getImageUrl(facultyInfo.logo)} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <Camera size={24} color="var(--text-muted)" />
                    )}
                 </div>
                 <div style={{ flex: 1 }}>
                    <label className="label">Logo de la Faculté</label>
                    <input type="file" accept="image/*" onChange={(e) => setFacLogo(e.target.files[0])} />
                 </div>
              </div>
              <div>
                <label className="label">Nom de la Faculté</label>
                <input 
                    type="text" 
                    value={facultyInfo.nom} 
                    onChange={(e) => setFacultyInfo({...facultyInfo, nom: e.target.value})}
                />
              </div>
              <div>
                <label className="label">Email de Contact</label>
                <input 
                    type="email" 
                    value={facultyInfo.email} 
                    onChange={(e) => setFacultyInfo({...facultyInfo, email: e.target.value})}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '24px', width: '100%', background: '#a855f7', borderColor: '#a855f7' }}>
              <Save size={18} /> Mettre à jour ma Faculté
            </button>
          </form>
        </section>
        )}

      </div>
    </motion.div>
  );
};

export default Settings;
