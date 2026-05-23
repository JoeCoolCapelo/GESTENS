import React, { useState, useEffect } from 'react';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `http://localhost:8000${url}`;
};

const PrintLayout = ({ children, title = "DOCUMENT OFFICIEL", departmentName = "" }) => {
  const [univ, setUniv] = useState(null);
  const { faculty } = useAuth();

  useEffect(() => {
    authService.getUniversityInfo()
      .then(res => setUniv(res.data))
      .catch(err => console.error("Error loading univ info for print", err));
  }, []);

  if (!univ) return null;

  return (
    <div className="print-content" style={{ color: 'black', background: 'white', padding: '0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '20px' }}>
        <div style={{ width: '100px' }}>
          {univ.logo && <img src={getImageUrl(univ.logo)} alt="Logo" style={{ width: '100%', objectFit: 'contain' }} />}
        </div>
        
        <div style={{ textAlign: 'center', flex: 1 }}>
          <h2 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 4px' }}>{univ.republique}</h2>
          <h1 style={{ fontSize: '13px', fontWeight: 'bold', margin: '0 0 10px' }}>{univ.nom.toUpperCase()}</h1>
          <div style={{ fontSize: '11px', margin: '0 0 2px' }}>Email : {univ.email_contact}</div>
          <div style={{ fontSize: '11px' }}>{univ.bp}</div>
        </div>

        <div style={{ width: '100px' }}></div> {/* Spacer to center the middle part */}
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '15px' }}>{title}</h2>
        <div style={{ textAlign: 'left', fontSize: '14px' }}>
          <p style={{ margin: '4px 0' }}>• COMPOSANTES (FACULTE/INSTITUT/CENTRE) : <strong>{faculty?.nom || '___________________'}</strong></p>
          <p style={{ margin: '4px 0' }}>• DEPARTEMENT : <strong>{departmentName || '___________________'}</strong></p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ minHeight: '400px' }}>
        {children}
      </div>

      {/* Footer / Signatures */}
      <div style={{ marginTop: '60px' }}>
        <div style={{ textAlign: 'right', marginBottom: '40px', fontSize: '14px' }}>
           Conakry, le ......../......../ 202........
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
          <div>
            <p>Le Chef de Département</p>
            <div style={{ marginTop: '60px', borderTop: '1px dashed #777', width: '80%', margin: '60px auto 0' }}></div>
          </div>
          <div>
            <p>Le DGA-Etude/VD-Etude</p>
            <div style={{ marginTop: '60px', borderTop: '1px dashed #777', width: '80%', margin: '60px auto 0' }}></div>
          </div>
          <div>
            <p>Le Directeur Général/Doyen</p>
            <div style={{ marginTop: '60px', borderTop: '1px dashed #777', width: '80%', margin: '60px auto 0' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintLayout;
