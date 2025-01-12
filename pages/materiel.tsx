// import React, { useState, useEffect } from "react";

// import { createClient } from "@supabase/supabase-js";

// const supabase = createClient(
//   "https://yoounvoicycbdpqdwyxa.supabase.co", // Remplacer par votre URL Supabase
//   "YOUR_ANON_KEY" // Remplacer par votre clé publique (anon key)
// );

// const MaterielPage = () => {
//   const [materiels, setMateriels] = useState<any[]>([]); // État pour stocker les matériels récupérés
//   const [nom, setNom] = useState("");
//   const [description, setDescription] = useState("");
//   const [quantite, setQuantite] = useState("");
//   const [numeroSerie, setNumeroSerie] = useState("");
//   const [etat, setEtat] = useState("neuf");
//   const [dateExpiration, setDateExpiration] = useState("");
//   const [showModal, setShowModal] = useState(false);

//   // Fonction pour récupérer les matériels depuis Supabase
//   const fetchMateriels = async () => {
//     const { data, error } = await supabase
//       .from("materiels") // Nom de la table dans Supabase
//       .select("*"); // Sélectionner toutes les colonnes

//     if (error) {
//       console.error("Erreur lors de la récupération des matériels:", error);
//       return;
//     }

//     setMateriels(data); // Mettre à jour l'état avec les données récupérées
//   };

//   useEffect(() => {
//     fetchMateriels(); // Appeler la fonction de récupération des données au montage du composant
//   }, []);

//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();

//     // Vérification et ajustement de la date d'expiration
//     const expirationDate = dateExpiration.trim() === "" ? null : dateExpiration;

//     const materielData = {
//       nom,
//       description,
//       quantite,
//       numero_serie: numeroSerie,
//       etat,
//       date_expiration: expirationDate, // Utiliser null si la date est vide
//     };

//     try {
//       const { data, error } = await supabase
//         .from("materiels")
//         .insert([materielData]);

//       if (error) {
//         throw new Error(`Erreur lors de l'ajout du matériel: ${error.message}`);
//       }

//       // Si l'ajout est réussi, on ferme le modal et recharge les matériels
//       setShowModal(false);
//       fetchMateriels(); // Recharger les matériels après ajout
//       setNom("");
//       setDescription("");
//       setQuantite("");
//       setNumeroSerie("");
//       setEtat("neuf");
//       setDateExpiration("");
//     } catch (error: any) {
//       console.error("Erreur lors de l'ajout du matériel:", error);
//       alert(`Erreur: ${error.message}`);
//     }
//   };

//   return (
//     <div>
//       {/* Bouton pour ouvrir le modal */}
//       <button onClick={() => setShowModal(true)}>Ajouter un matériel</button>

//       {/* Liste des matériels */}
//       <div className="my-4">
//         <h2 className="text-xl font-bold mb-4">Liste des matériels</h2>
//         <table className="min-w-full border border-gray-300">
//           <thead>
//             <tr>
//               <th className="px-4 py-2 border">Nom</th>
//               <th className="px-4 py-2 border">Description</th>
//               <th className="px-4 py-2 border">Quantité</th>
//               <th className="px-4 py-2 border">Numéro de série</th>
//               <th className="px-4 py-2 border">État</th>
//               <th className="px-4 py-2 border">Date d'expiration</th>
//               <th className="px-4 py-2 border">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {materiels.map((materiel) => (
//               <tr key={materiel.id_materiel}>
//                 <td className="px-4 py-2 border">{materiel.nom}</td>
//                 <td className="px-4 py-2 border">{materiel.description}</td>
//                 <td className="px-4 py-2 border">{materiel.quantite}</td>
//                 <td className="px-4 py-2 border">{materiel.numero_serie}</td>
//                 <td className="px-4 py-2 border">{materiel.etat}</td>
//                 <td className="px-4 py-2 border">{materiel.date_expiration}</td>
//                 <td className="px-4 py-2 border">
//                   <button className="bg-blue-500 text-white px-4 py-2 rounded">Modifier</button>
//                   <button className="bg-red-500 text-white px-4 py-2 rounded ml-2">Supprimer</button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Modal pour ajouter un matériel */}
//       {showModal && (
//         <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50">
//           <div className="bg-white p-6 rounded-lg">
//             <h2 className="text-xl font-bold mb-4">Ajouter un matériel</h2>
//             <form onSubmit={handleSubmit}>
//               <div className="mb-4">
//                 <label className="block text-gray-700" htmlFor="nom">
//                   Nom
//                 </label>
//                 <input
//                   type="text"
//                   id="nom"
//                   value={nom}
//                   onChange={(e) => setNom(e.target.value)}
//                   className="w-full p-2 border border-gray-300 rounded"
//                   required
//                 />
//               </div>
//               <div className="mb-4">
//                 <label className="block text-gray-700" htmlFor="description">
//                   Description
//                 </label>
//                 <input
//                   type="text"
//                   id="description"
//                   value={description}
//                   onChange={(e) => setDescription(e.target.value)}
//                   className="w-full p-2 border border-gray-300 rounded"
//                 />
//               </div>
//               <div className="mb-4">
//                 <label className="block text-gray-700" htmlFor="quantite">
//                   Quantité
//                 </label>
//                 <input
//                   type="number"
//                   id="quantite"
//                   value={quantite}
//                   onChange={(e) => setQuantite(e.target.value)}
//                   className="w-full p-2 border border-gray-300 rounded"
//                   required
//                 />
//               </div>
//               <div className="mb-4">
//                 <label className="block text-gray-700" htmlFor="numero_serie">
//                   Numéro de série
//                 </label>
//                 <input
//                   type="text"
//                   id="numero_serie"
//                   value={numeroSerie}
//                   onChange={(e) => setNumeroSerie(e.target.value)}
//                   className="w-full p-2 border border-gray-300 rounded"
//                   required
//                 />
//               </div>
//               <div className="mb-4">
//                 <label className="block text-gray-700" htmlFor="etat">
//                   État
//                 </label>
//                 <select
//                   id="etat"
//                   value={etat}
//                   onChange={(e) => setEtat(e.target.value)}
//                   className="w-full p-2 border border-gray-300 rounded"
//                 >
//                   <option value="neuf">Neuf</option>
//                   <option value="usagé">Usagé</option>
//                   <option value="endommagé">Endommagé</option>
//                 </select>
//               </div>
//               <div className="mb-4">
//                 <label className="block text-gray-700" htmlFor="date_expiration">
//                   Date d'expiration
//                 </label>
//                 <input
//                   type="date"
//                   id="date_expiration"
//                   value={dateExpiration}
//                   onChange={(e) => setDateExpiration(e.target.value)}
//                   className="w-full p-2 border border-gray-300 rounded"
//                 />
//               </div>
//               <div className="flex justify-between">
//                 <button
//                   type="button"
//                   onClick={() => setShowModal(false)}
//                   className="px-4 py-2 bg-red-500 text-gray-300 rounded"
//                 >
//                   Annuler
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 bg-blue-600 text-white rounded"
//                 >
//                   Ajouter
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MaterielPage;
