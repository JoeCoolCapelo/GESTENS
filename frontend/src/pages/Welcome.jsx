import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { Building2, ArrowRight, Sun, Moon, Shield, Clock, BarChart2, Users, LayoutDashboard, Database, Globe, CheckCircle, GraduationCap, Calendar, ArrowUpRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `http://localhost:8000${url}`;
};

const Welcome = () => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await authService.getUniversitiesPublic();
        setUniversities(res.data);
      } catch (err) {
        console.error("Erreur chargement universités", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const features = [
    { icon: <Globe size={32} />, title: 'Réseau Multi-Institutions', desc: 'Accédez à toutes les facultés où vous enseignez depuis un compte unique.' },
    { icon: <Clock size={32} />, title: 'Emplois du Temps', desc: 'Consultez votre planning en temps réel et soyez alerté des modifications.' },
    { icon: <BarChart2 size={32} />, title: 'Suivi de vos Heures', desc: 'Tableaux de bord dynamiques pour suivre vos volumes horaires enseignés.' },
    { icon: <Shield size={32} />, title: 'Espace Sécurisé', desc: 'Gérez vos notes, vos syllabus et vos communications en toute confidentialité.' },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-gradient)',
      color: 'var(--text-main)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '"Inter", sans-serif'
    }}>
      {/* Navigation Top */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '20px 40px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '10px', 
            background: 'linear-gradient(135deg, var(--primary) 0%, #a855f7 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Database size={24} color="white" />
          </div>
          <span style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }} className="gradient-text">
            GESTENS
          </span>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="glass-morphism"
          style={{ 
            padding: '10px', 
            background: 'var(--glass)', 
            color: 'var(--primary)', 
            border: '1px solid var(--glass-border)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '12px',
            transition: 'all 0.3s'
          }}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        padding: '100px 20px 60px', 
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <motion.div
          animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          style={{
            position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px',
            background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
            opacity: 0.15, filter: 'blur(60px)', zIndex: 0
          }} 
        />
        <motion.div
          animate={{ y: [0, 40, 0], x: [0, -20, 0], scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 1 }}
          style={{
            position: 'absolute', bottom: '-10%', right: '-10%', width: '400px', height: '400px',
            background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)',
            opacity: 0.15, filter: 'blur(60px)', zIndex: 0
          }} 
        />

        <div style={{ 
          maxWidth: '1200px', width: '100%', margin: '0 auto', 
          position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column'
        }}>
          {/* Top Row: Text (Left) + Stats (Right) */}
          <div style={{ 
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '60px', marginBottom: '60px' 
          }}>
            {/* Left: Text */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              style={{ flex: '1 1 500px', textAlign: 'left' }}
            >
              <div style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '8px', 
                padding: '8px 16px', background: 'rgba(99, 102, 241, 0.1)', 
                color: 'var(--primary)', borderRadius: '100px', fontSize: '14px', fontWeight: '600', marginBottom: '24px'
              }}>
                <LayoutDashboard size={16} /> Portail Enseignants
              </div>
              
              <h1 style={{ fontSize: '46px', fontWeight: '900', lineHeight: '1.2', marginBottom: '20px', letterSpacing: '-1px' }}>
                Transformez la Gestion de <br />
                <span className="gradient-text">Vos Enseignements</span>
              </h1>
              
              <p style={{ fontSize: '18px', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0, maxWidth: '480px' }}>
                La plateforme centralisée pour les professeurs universitaires. Des emplois du temps à la gestion de vos classes, reprenez le contrôle de votre organisation.
              </p>
            </motion.div>

            {/* Right: Stats Grid */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ flex: '1 1 400px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}
            >
              {[
                { label: 'Universités', value: '12+' },
                { label: 'Facultés & Instituts', value: '45+' },
                { label: 'Professeurs Actifs', value: '15k+' },
                { label: 'Heures Dispensées', value: '2M+' }
              ].map((stat, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + (i * 0.15) }}
                  whileHover={{ y: -8, scale: 1.02, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                  className="glass-morphism" 
                  style={{ 
                    padding: '30px 20px', borderRadius: '24px', border: '1px solid var(--glass-border)',
                    background: 'var(--glass)', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
                  }}
                >
                  <motion.div 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 4, delay: i * 0.5, ease: "easeInOut" }}
                    className="gradient-text" 
                    style={{ fontSize: '40px', fontWeight: '900', marginBottom: '8px', display: 'inline-block' }}
                  >
                    {stat.value}
                  </motion.div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Bottom Row: CTA Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const section = document.getElementById('universities-section');
                section?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{ 
                padding: '16px 40px', background: 'linear-gradient(135deg, var(--primary) 0%, #a855f7 100%)',
                color: 'white', border: 'none', borderRadius: '100px', fontSize: '18px', fontWeight: 'bold',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)'
              }}
            >
              Voir les Universités <ArrowRight size={20} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '60px 20px', background: 'rgba(0,0,0,0.02)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>Pourquoi choisir GESTENS ?</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>Une architecture conçue pour répondre aux défis quotidiens des enseignants.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
            {features.map((feat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="glass-morphism"
                style={{ padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div style={{ 
                  width: '60px', height: '60px', borderRadius: '16px', 
                  background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px'
                }}>
                  {feat.icon}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>{feat.title}</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow / Comment ça marche */}
      <section style={{ padding: '80px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', borderRadius: '100px', fontSize: '14px', fontWeight: 'bold', marginBottom: '16px' }}>Prise en main Rapide</div>
            <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>Comment ça fonctionne ?</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>Une transition en douceur vers le numérique en seulement trois étapes clés pour chaque enseignant.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '24px', justifyContent: 'center' }}>
            {[
              { icon: <Users size={24} />, title: '1. Affiliation', desc: 'Créez votre profil et affiliez-vous instantanément à vos différentes facultés.' },
              { icon: <Calendar size={24} />, title: '2. Planification', desc: 'Visualisez vos emplois du temps consolidés et recevez des alertes en temps réel.' },
              { icon: <GraduationCap size={24} />, title: '3. Suivi des Classes', desc: 'Gérez vos cours, saisissez les notes et suivez vos volumes horaires.' }
            ].map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                style={{ flex: '1 1 300px', maxWidth: '350px', position: 'relative' }}
              >
                <div style={{ 
                  background: 'var(--bg-card)', padding: '32px', borderRadius: '24px', 
                  border: '1px solid var(--border)', height: '100%',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ 
                    width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px',
                    boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
                  }}>
                    {step.icon}
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>{step.title}</h3>
                  <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Universities Grid Section */}
      <section id="universities-section" style={{ padding: '80px 20px', position: 'relative', zIndex: 1, flex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
            <div>
              <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>Institutions Partenaires</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>Sélectionnez votre établissement pour accéder à votre espace.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '600' }}>
              <Building2 size={20} /> {universities.length} Réseaux
            </div>
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px' }}></div>
              <p style={{ color: 'var(--text-muted)' }}>Chargement du réseau universitaire...</p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
              gap: '32px' 
            }}>
              {universities.map((u, idx) => (
                <motion.div 
                  key={u.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)' }}
                  className="glass-morphism"
                  onClick={() => navigate(`/university/${u.id}`)}
                  style={{ 
                    padding: '32px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '24px'
                  }}
                >
                  <div style={{ 
                    width: '100px', 
                    height: '100px', 
                    background: 'white', 
                    borderRadius: '24px', 
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                  }}>
                    {u.logo ? (
                      <img 
                        src={getImageUrl(u.logo)} 
                        alt={u.sigle} 
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '12px' }} 
                      />
                    ) : (
                      <Building2 size={40} color="#1e293b" />
                    )}
                  </div>
                  <h4 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-main)' }}>{u.sigle}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', flex: 1 }}>{u.nom}</p>
                  
                  <div style={{ 
                    width: '100%', padding: '12px', background: 'rgba(99, 102, 241, 0.05)', 
                    borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', 
                    color: 'var(--primary)', fontWeight: '600', fontSize: '15px', transition: 'background 0.3s'
                  }} className="hover-bg-primary">
                    Accéder au portail <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                  </div>
                </motion.div>
              ))}
              {universities.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', background: 'rgba(0,0,0,0.02)', borderRadius: '24px' }}>
                  <Building2 size={48} color="var(--border)" style={{ margin: '0 auto 16px' }} />
                  <h3 style={{ fontSize: '20px', color: 'var(--text-muted)' }}>Aucune université partenaire pour le moment.</h3>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Final CTA Section */}
      <section style={{ padding: '40px 20px 80px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            style={{ 
              background: 'linear-gradient(135deg, var(--primary) 0%, #a855f7 100%)',
              borderRadius: '32px', padding: '60px 40px', textAlign: 'center', color: 'white',
              boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.4)', position: 'relative', overflow: 'hidden'
            }}
          >
            <div style={{
              position: 'absolute', top: 0, right: 0, width: '300px', height: '300px',
              background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
              filter: 'blur(30px)', zIndex: 0
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: '40px', fontWeight: '900', marginBottom: '20px', letterSpacing: '-1px' }}>Prêt à simplifier vos enseignements ?</h2>
              <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.6' }}>
                Rejoignez le réseau GESTENS et bénéficiez du meilleur outil pour organiser votre vie académique.
              </p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button style={{ 
                  padding: '16px 32px', background: 'white', color: 'var(--primary)', 
                  border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 'bold',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                }}>
                  Demander une démo <ArrowRight size={18} />
                </button>
                <button style={{ 
                  padding: '16px 32px', background: 'rgba(255,255,255,0.1)', color: 'white', 
                  border: '1px solid rgba(255,255,255,0.2)', borderRadius: '14px', fontSize: '16px', fontWeight: 'bold',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', backdropFilter: 'blur(10px)'
                }}>
                  Contacter l'équipe <ArrowUpRight size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        borderTop: '1px solid rgba(255,255,255,0.05)', 
        padding: '60px 20px 20px',
        background: 'var(--bg-card)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '60px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Database size={24} color="var(--primary)" />
              <span style={{ fontSize: '20px', fontWeight: 'bold' }}>GESTENS</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
              Système de gestion intégrée conçu pour la performance académique et administrative.
            </p>
          </div>
          
          <div>
            <h4 style={{ fontWeight: 'bold', marginBottom: '20px' }}>Plateforme</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-muted)', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }}>À propos</li>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Fonctionnalités</li>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Sécurité</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontWeight: 'bold', marginBottom: '20px' }}>Support</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-muted)', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Centre d'aide</li>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Documentation</li>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Contact technique</li>
            </ul>
          </div>
        </div>

        <div style={{ 
          maxWidth: '1200px', margin: '0 auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '13px'
        }}>
          <p>© {new Date().getFullYear()} GESTENS. Tous droits réservés.</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Conditions générales</span>
            <span>Politique de confidentialité</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
