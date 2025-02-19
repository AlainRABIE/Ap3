// import React, { useState, useEffect } from 'react';
// import MenubarRe from '../components/ui/MenuBarRe';

// const SettingsPage = () => {
//   const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
//   const [language, setLanguage] = useState<string>('fr');
//   const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);

//   useEffect(() => {
//     if (isDarkMode) {
//       document.body.classList.add('dark');
//     } else {
//       document.body.classList.remove('dark');
//     }
//   }, [isDarkMode]); 

//   const toggleTheme = () => {
//     setIsDarkMode(!isDarkMode);
//   };

//   const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     setLanguage(e.target.value);
//   };

//   const toggleNotifications = () => {
//     const newStatus = notificationsEnabled ? 'disabled' : 'enabled';
//     setNotificationsEnabled(!notificationsEnabled);
//     if (typeof window !== 'undefined') {
//       localStorage.setItem('notifications', newStatus);
//     }
//   };

//   return (
// <div className="relative flex h-screen bg-opacity-40 backdrop-blur-md">
// <div className="animated-background"></div>
//       <MenubarRe />
//       <main className="main-content flex-1 p-8 overflow-auto">
//         <div className="settings-page p-4">
//           <h1 className="text-2xl font-bold mb-4 text-white">Paramètres de l'application</h1>

//           {/* Thème */}
//           <div className="settings-group mb-4">
//             <h2 className="text-xl font-semibold mb-2 text-white">Thème</h2>
//             <button
//               className="py-2 px-4 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
//               onClick={toggleTheme}
//             >
//               {isDarkMode ? "Mode Clair" : "Mode Sombre"}
//             </button>
//           </div>

//           {/* Langue */}
//           <div className="settings-group mb-4">
//             <h2 className="text-xl font-semibold mb-2 text-white">Langue</h2>
//             <select value={language} onChange={handleLanguageChange} className="py-2 px-4 border rounded-md">
//               <option value="fr">Français</option>
//               <option value="en">Anglais</option>
//               <option value="es">Espagnol</option>
//               <option value="de">Allemand</option>
//             </select>
//           </div>

//           {/* Notifications */}
//           <div className="settings-group mb-4">
//             <h2 className="text-xl font-semibold mb-2 text-white">Notifications</h2>
//             <button
//               className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
//               onClick={toggleNotifications}
//             >
//               {notificationsEnabled ? "Désactiver les notifications" : "Activer les notifications"}
//             </button>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default SettingsPage;
