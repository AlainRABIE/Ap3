"use client"; 

import { useState, useEffect, ChangeEvent } from "react";

const SettingsPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState("fr");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedLanguage = localStorage.getItem('language');
    const savedNotifications = localStorage.getItem('notifications');

    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
    if (savedNotifications) {
      setNotificationsEnabled(savedNotifications === 'enabled');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
    localStorage.setItem('language', e.target.value);
  };

  const toggleNotifications = () => {
    const newStatus = notificationsEnabled ? 'disabled' : 'enabled';
    setNotificationsEnabled(!notificationsEnabled);
    localStorage.setItem('notifications', newStatus);
  };

  return (
    <div className="settings-page p-4">
      <h1 className="text-2xl font-bold mb-4">Paramètres de l'application</h1>

      <div className="settings-group mb-4">
        <h2 className="text-xl font-semibold mb-2">Thème</h2>
        <button
          className="py-2 px-4 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
          onClick={toggleTheme}
        >
          {isDarkMode ? "Mode Clair" : "Mode Sombre"}
        </button>
      </div>

      <div className="settings-group mb-4">
        <h2 className="text-xl font-semibold mb-2">Langue</h2>
        <select value={language} onChange={handleLanguageChange} className="py-2 px-4 border rounded-md">
          <option value="fr">Français</option>
          <option value="en">Anglais</option>
          <option value="es">Espagnol</option>
          <option value="de">Allemand</option>
        </select>
      </div>

      <div className="settings-group mb-4">
        <h2 className="text-xl font-semibold mb-2">Notifications</h2>
        <button
          className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          onClick={toggleNotifications}
        >
          {notificationsEnabled ? "Désactiver les notifications" : "Activer les notifications"}
        </button>
      </div>

    </div>
  );
};

export default SettingsPage;
