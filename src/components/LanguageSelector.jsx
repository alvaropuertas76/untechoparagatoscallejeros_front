import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import flagIconsBase64 from '../utils/flagIcons';

const LanguageSelector = () => {
  const { language, changeLanguage } = useLanguage();

  return (
    <div className="flex space-x-2 items-center">
      {Object.entries(flagIconsBase64).map(([lang, icon]) => (
        <button
          key={lang}
          onClick={() => changeLanguage(lang)}
          className={`w-8 h-6 rounded overflow-hidden transition-all duration-200 ${
            language === lang 
              ? 'ring-2 ring-indigo-500 scale-110' 
              : 'opacity-70 hover:opacity-100'
          }`}
          title={lang === 'es' ? 'Español' : lang === 'en' ? 'English' : 'Deutsch'}
        >
          <img 
            src={icon} 
            alt={lang === 'es' ? 'Español' : lang === 'en' ? 'English' : 'Deutsch'}
            className="w-full h-full object-cover"
          />
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
