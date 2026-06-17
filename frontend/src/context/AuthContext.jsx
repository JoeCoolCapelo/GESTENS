import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService, academicYearService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [faculty, setFaculty] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [academicYear, setAcademicYear] = useState(null);

  const fetchAcademicYear = async () => {
    try {
      const res = await academicYearService.getCurrent();
      setAcademicYear(res.data);
    } catch (err) {
      setAcademicYear(null);
    }
  };

  useEffect(() => {
    if (token) {
      // Restaurer les infos sauvegardées
      const savedUser = localStorage.getItem('user');
      const savedFaculty = localStorage.getItem('faculty');
      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedFaculty) setFaculty(JSON.parse(savedFaculty));
      fetchAcademicYear();
    } else {
      setAcademicYear(null);
    }
    setLoading(false);
  }, [token]);

  const login = async (username, password, faculty_id) => {
    try {
      const response = await authService.login({ username, password, faculty_id });
      const { access, user: userData, faculty: facultyData } = response.data;
      localStorage.setItem('token', access);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('faculty', JSON.stringify(facultyData));
      setToken(access);
      setUser(userData);
      setFaculty(facultyData);
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      let message = 'Identifiants invalides ou faculté incorrecte';
      if (!error.response) {
        message = 'Le serveur ne répond pas.';
      } else if (error.response?.data?.detail) {
        message = error.response.data.detail;
      } else if (error.response?.data) {
        message = Object.values(error.response.data).flat().join(' ');
      }
      return { success: false, error: message };
    }
  };

  const signup = async (formData) => {
    try {
      await authService.signup(formData);
      return { success: true };
    } catch (error) {
      console.error("Signup error:", error);
      let message = "Erreur lors de l'inscription";
      if (!error.response) {
        message = 'Connexion au serveur échouée.';
      } else if (error.response.data) {
        // Extraire les messages d'erreur du backend (ex: {username: ["déjà pris"]})
        message = Object.entries(error.response.data)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(' | ');
      }
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('faculty');
    setToken(null);
    setUser(null);
    setFaculty(null);
  };

  const updateUserData = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const updateFaculty = (facultyData) => {
    localStorage.setItem('faculty', JSON.stringify(facultyData));
    setFaculty(facultyData);
  };

  const isTeacher = !!user?.profile?.enseignant;

  return (
    <AuthContext.Provider value={{ 
        user, faculty, token, login, signup, logout, updateUserData, updateFaculty,
        loading, academicYear, refreshAcademicYear: fetchAcademicYear,
        isTeacher
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
