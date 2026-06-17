import React from 'react';

const SchedulePrintGrid = ({ schedules = [], days = [] }) => {
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
  const grid = {}; // structure : hour -> day -> { type, span, data }
  const slotsToSkip = {};

  // Group schedules by day for easier processing
  const scheduleByDay = days.reduce((acc, day) => {
    acc[day] = (schedules || []).filter(s => s.jour === day);
    return acc;
  }, {});

  // 1. Pré-calculer la grille pour chaque jour
  days.forEach(day => {
    const dayCourses = [...(scheduleByDay[day] || [])].sort((a, b) => 
      parseInt(a.heure_debut.split(':')[0]) - parseInt(b.heure_debut.split(':')[0])
    );
    
    let currentHour = 8;
    dayCourses.forEach(course => {
      const start = parseInt(course.heure_debut.split(':')[0]);
      const end = parseInt(course.heure_fin.split(':')[0]);
      
      // Creux avant le cours
      if (start > currentHour) {
        if (!grid[currentHour]) grid[currentHour] = {};
        grid[currentHour][day] = { type: 'empty', span: start - currentHour };
      }
      
      // Le cours
      if (!grid[start]) grid[start] = {};
      grid[start][day] = { type: 'course', span: end - start, data: course };
      
      currentHour = Math.max(currentHour, end);
    });
    
    // Creux après le dernier cours jusqu'à 18H
    if (currentHour < 18) {
      if (!grid[currentHour]) grid[currentHour] = {};
      grid[currentHour][day] = { type: 'empty', span: 18 - currentHour };
    }
  });

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid black', padding: '8px', background: '#f5f5f5', width: '80px' }}>Heure</th>
          {days.map(day => (
            <th key={day} style={{ border: '1px solid black', padding: '8px', background: '#f5f5f5' }}>{day}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {hours.map((hour) => (
          <tr key={hour}>
            <td style={{ 
              border: '1px solid black', 
              padding: '8px', 
              fontWeight: 'bold', 
              textAlign: 'center', 
              background: '#f0f0f0',
              whiteSpace: 'nowrap',
              width: '1%'
            }}>
              {hour}H - {hour + 1}H
            </td>
            {days.map((day) => {
              const slotKey = `${day}-${hour}`;
              if (slotsToSkip[slotKey]) return null;

              const info = grid[hour]?.[day];
              if (!info) return <td key={day} style={{ border: '1px solid black' }}></td>;

              // Marquer les slots futurs à sauter
              for (let i = 1; i < info.span; i++) {
                slotsToSkip[`${day}-${hour + i}`] = true;
              }

              if (info.type === 'course') {
                const course = info.data;
                return (
                  <td 
                    key={day} 
                    rowSpan={info.span} 
                    style={{ 
                      border: '1px solid black', 
                      padding: '10px', 
                      verticalAlign: 'middle', 
                      textAlign: 'center',
                      background: '#fff',
                      height: `${info.span * 40}px`,
                      minWidth: '120px'
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>
                      {course.enseignement_details?.matiere_details?.nom}
                    </div>
                    <div style={{ fontSize: '10px', color: '#333' }}>
                      <strong>M. {course.enseignement_details?.enseignant_details?.nom}</strong>
                    </div>
                    {course.enseignement_details?.enseignant_details?.telephone && (
                      <div style={{ fontSize: '9px', color: '#444' }}>
                        Tél: {course.enseignement_details?.enseignant_details?.telephone}
                      </div>
                    )}
                    <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>
                      {course.salle_details?.nom || 'Non assignée'}
                    </div>
                  </td>
                );
              } else {
                return (
                  <td 
                    key={day} 
                    rowSpan={info.span}
                    style={{ 
                      border: '1px solid black', 
                      padding: '8px', 
                      textAlign: 'center', 
                      color: '#aaa',
                      fontSize: '14px',
                      letterSpacing: '4px',
                      verticalAlign: 'middle'
                    }}
                  >
                    {Array(info.span).fill('///').join(' ')}
                  </td>
                );
              }
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SchedulePrintGrid;
