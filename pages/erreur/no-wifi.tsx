// "use client";

// import { useEffect, useState } from "react";

// export default function NoInternet() {
//   const [isOffline, setIsOffline] = useState(false);

//   useEffect(() => {
//     const updateOnlineStatus = () => {
//       setIsOffline(!navigator.onLine); // Vérifie si l'utilisateur est hors ligne
//     };

//     // Détecte les changements de statut réseau
//     window.addEventListener("online", updateOnlineStatus);
//     window.addEventListener("offline", updateOnlineStatus);

//     // Vérifie l'état initial
//     updateOnlineStatus();

//     return () => {
//       window.removeEventListener("online", updateOnlineStatus);
//       window.removeEventListener("offline", updateOnlineStatus);
//     };
//   }, []);

//   if (isOffline) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-black bg-opacity-40 backdrop-blur-md text-white text-center">
//         <div>
//           <h1 className="text-4xl font-bold mb-4">Pas de connexion Internet</h1>
//           <p className="text-lg mb-6">
//             Vous semblez être hors ligne. Vérifiez votre connexion réseau.
//           </p>
//           <button
//             onClick={() => window.location.reload()}
//             className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
//           >
//             Réessayer
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex items-center justify-center h-screen bg-black bg-opacity-40 backdrop-blur-md text-white text-center">
//       <h1 className="text-4xl font-bold">Bienvenue ! Vous êtes à nouveau en ligne.</h1>
//     </div>
//   );
// }