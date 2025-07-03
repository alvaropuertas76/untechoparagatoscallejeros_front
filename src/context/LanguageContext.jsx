import React, { createContext, useContext, useState, useEffect } from 'react';
import { es } from '../translations/es';
import { en } from '../translations/en';
import { de } from '../translations/de';

const translations = {
  es,
  en,
  de
};

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  // Intentar obtener el idioma guardado en localStorage o usar 'es' por defecto
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'es';
  });

  // Guardar el idioma en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  // Obtener las traducciones para el idioma actual
  const t = (key) => {
    if (!key) return ''; // Manejar el caso de clave vacía
    
    const keys = key.split('.');
    let translation = translations[language];
    
    if (!translation) return key; // Verificar que el idioma existe
    
    for (const k of keys) {
      if (!translation || !translation[k]) return key; // Verificación adicional para cada nivel
      translation = translation[k];
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
