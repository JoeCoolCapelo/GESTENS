import React from 'react';

const TeacherListPrint = ({ teachers }) => {
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse', 
        marginTop: '10px',
        fontSize: '11px', // Smaller font for many columns
        fontFamily: 'Arial, sans-serif'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6' }}>
            <th style={cellStyle}>Matricule</th>
            <th style={cellStyle}>Prénom & Nom</th>
            <th style={cellStyle}>Spécialité</th>
            <th style={cellStyle}>Grade</th>
            <th style={cellStyle}>Dernier Diplôme</th>
            <th style={cellStyle}>Téléphone</th>
            <th style={cellStyle}>Email</th>
            <th style={cellStyle}>Fonction</th>
            <th style={cellStyle}>Département</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((t, index) => (
            <tr key={t.id || index}>
              <td style={cellStyle}>{t.matricule}</td>
              <td style={{ ...cellStyle, fontWeight: 'bold' }}>{t.prenom} {t.nom}</td>
              <td style={cellStyle}>{t.specialite || 'N/A'}</td>
              <td style={cellStyle}>{t.grade_academique}</td>
              <td style={cellStyle}>{t.dernier_diplome || 'N/A'}</td>
              <td style={cellStyle}>{t.telephone || 'N/A'}</td>
              <td style={cellStyle}>{t.email}</td>
              <td style={cellStyle}>{t.fonction || 'N/A'}</td>
              <td style={cellStyle}>{t.departement_details?.nom || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div style={{ marginTop: '20px', fontSize: '10px', fontStyle: 'italic', color: '#666' }}>
        Nombre total d'enseignants : {teachers.length}
      </div>
    </div>
  );
};

const cellStyle = {
  border: '1px solid #000',
  padding: '6px 4px',
  textAlign: 'left'
};

export default TeacherListPrint;
