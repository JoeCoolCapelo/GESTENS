import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/api';
import { User, Mail, School, Camera, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:8000${url}`;
};

const Profile = () => {
    const { user, faculty, updateUserData } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [profileData, setProfileData] = useState({
        email: '',
        photo: null,
        photo_url: null
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await profileService.get();
            const data = response.data;
            setProfileData({
                email: data.email || '',
                photo_url: data.profile?.photo || null,
                photo: null
            });
        } catch (err) {
            console.error("Erreur chargement profil", err);
            setMessage({ type: 'error', text: 'Impossible de charger les données du profil.' });
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileData({
                ...profileData,
                photo: file,
                photo_url: URL.createObjectURL(file)
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        const formData = new FormData();
        formData.append('email', profileData.email);
        if (profileData.photo) {
            formData.append('photo', profileData.photo);
        }

        try {
            const response = await profileService.update(formData);
            const updatedUser = response.data;

            // Mettre à jour le contexte global ET le localStorage
            updateUserData(updatedUser);

            // Rafraîchir la photo affichée depuis la réponse du serveur
            const newPhotoUrl = updatedUser.profile?.photo || null;
            setProfileData(prev => ({
                ...prev,
                photo: null,
                photo_url: newPhotoUrl
            }));

            setMessage({ type: 'success', text: 'Profil mis à jour avec succès ! La photo sera visible partout après reconnexion.' });
        } catch (err) {
            console.error("Erreur mise à jour profil", err);
            setMessage({ type: 'error', text: 'Erreur lors de la mise à jour.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <Loader2 className="animate-spin" size={40} color="var(--primary)" />
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ maxWidth: '800px', margin: '0 auto' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                <button 
                    onClick={() => navigate(-1)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                    <ArrowLeft size={24} />
                </button>
                <h2 style={{ fontSize: '28px', fontWeight: '600' }}>Mon Profil</h2>
            </div>

            <div className="glass-morphism" style={{ padding: '40px', position: 'relative' }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{ 
                                width: '120px', 
                                height: '120px', 
                                borderRadius: '30px', 
                                overflow: 'hidden',
                                background: 'linear-gradient(135deg, var(--primary) 0%, #a855f7 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)',
                                border: '4px solid white'
                            }}>
                                {profileData.photo_url ? (
                                    <img 
                                        src={getImageUrl(profileData.photo_url)} 
                                        alt="Profil" 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                ) : (
                                    <span style={{ fontSize: '48px', color: 'white', fontWeight: 'bold' }}>
                                        {user?.username?.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <label 
                                htmlFor="photo-upload"
                                style={{ 
                                    position: 'absolute', 
                                    bottom: '-10px', 
                                    right: '-10px',
                                    padding: '10px',
                                    background: 'var(--bg-card)',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                                    display: 'flex',
                                    color: 'var(--primary)',
                                    border: '1px solid var(--border)'
                                }}
                            >
                                <Camera size={20} />
                                <input 
                                    id="photo-upload" 
                                    type="file" 
                                    hidden 
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                        <h3 style={{ marginTop: '20px', fontSize: '20px', fontWeight: '600' }}>{user?.username}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                            {user?.is_superuser ? 'Administrateur Global' : 'Gestionnaire de Faculté'}
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '30px' }}>
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-muted)' }}>
                                <Mail size={16} /> Email
                            </label>
                            <input 
                                type="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-muted)' }}
                            />
                        </div>
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-muted)' }}>
                                <School size={16} /> Faculté d'attachement
                            </label>
                            <div style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.05)', color: 'var(--text-muted)' }}>
                                {faculty?.nom || 'Administration Centrale'}
                            </div>
                        </div>
                    </div>

                    {message.text && (
                        <div style={{ 
                            padding: '12px', 
                            borderRadius: '10px', 
                            marginBottom: '24px',
                            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: message.type === 'success' ? '#10b981' : '#ef4444',
                            textAlign: 'center',
                            fontSize: '14px'
                        }}>
                            {message.text}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button 
                            type="submit" 
                            disabled={saving}
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px',
                                padding: '12px 30px',
                                background: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: '600',
                                cursor: saving ? 'not-allowed' : 'pointer',
                                opacity: saving ? 0.7 : 1
                            }}
                        >
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            Sauvegarder les modifications
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default Profile;
