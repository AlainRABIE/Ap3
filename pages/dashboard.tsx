// import React, { useState, useEffect } from 'react';
// import { supabase } from "@/lib/supabaseClient";
// import { Pie } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   ArcElement,
//   Tooltip,
//   Legend,
// } from 'chart.js';
// import MenubarRe from '../components/ui/MenuBarRe';

// ChartJS.register(
//   ArcElement,
//   Tooltip,
//   Legend
// );

// interface Commande {
//   id_stock_medicament: number;
//   quantite: number;
// }

// interface Materiel {
//   materiel_id: number;
//   quantite: number;
// }

// const Dashboard = () => {
//   const [commandes, setCommandes] = useState<Commande[]>([]);
//   const [materiels, setMateriels] = useState<Materiel[]>([]);
//   const [loading, setLoading] = useState(true); 
//   const [visites, setVisites] = useState<number>(0);

//   useEffect(() => {
//     const fetchData = async () => {
//       const { data: commandesData, error: commandesError } = await supabase
//         .from('commande_médicaments')
//         .select<Commande[]>('*');

//       const { data: materielsData, error: materielsError } = await supabase
//         .from('stock_materiel')
//         .select<Materiel[]>('*');

//       if (commandesError || materielsError) {
//         console.error(commandesError || materielsError);
//         setLoading(false);
//         return;
//       }

//       console.log("Commandes récupérées:", commandesData); 
//       console.log("Matériels récupérés:", materielsData); 
//       setCommandes(commandesData || []);
//       setMateriels(materielsData || []);
//       setLoading(false);
//     };

//     fetchData();

//     const visitesActuelles = parseInt(localStorage.getItem('visites') || '0', 10) + 1;
//     localStorage.setItem('visites', visitesActuelles.toString());
//     setVisites(visitesActuelles);

//   }, []);

//   if (loading) {
//     return <div>Chargement...</div>;  
//   }

//   if (commandes.length === 0 || materiels.length === 0) {
//     return <div>Aucune donnée trouvée.</div>; 
//   }

//   const chartDataMedicaments = {
//     labels: commandes.map((commande: Commande) => `Médicament ${commande.id_stock_medicament}`),
//     datasets: [
//       {
//         label: 'Médicaments',
//         data: commandes.map(() => 1),  
//         backgroundColor: commandes.map(() => 'rgba(54, 162, 235, 0.6)'),  
//         borderColor: 'rgba(54, 162, 235, 1)',
//         borderWidth: 2,
//       },
//       {
//         label: 'Quantités',
//         data: commandes.map((commande: Commande) => commande.quantite),  
//         backgroundColor: commandes.map(() => 'rgba(255, 99, 132, 0.6)'),  
//         borderColor: 'rgba(255, 99, 132, 1)', 
//         borderWidth: 2,
//       },
//     ],
//   };

//   const chartDataMateriels = {
//     labels: materiels.map((materiel: Materiel) => `Matériel ${materiel.materiel_id}`),
//     datasets: [
//       {
//         label: 'Matériels',
//         data: materiels.map(() => 1),  
//         backgroundColor: materiels.map(() => 'rgba(75, 192, 192, 0.6)'),  
//         borderColor: 'rgba(75, 192, 192, 1)', 
//         borderWidth: 2,
//       },
//       {
//         label: 'Quantités',
//         data: materiels.map((materiel: Materiel) => materiel.quantite), 
//         backgroundColor: materiels.map(() => 'rgba(153, 102, 255, 0.6)'), 
//         borderColor: 'rgba(153, 102, 255, 1)', 
//         borderWidth: 2,
//       },
//     ],
//   };

//   const chartDataVisites = {
//     labels: ['Visites'],
//     datasets: [
//       {
//         label: 'Visites',
//         data: [visites],
//         backgroundColor: ['rgba(255, 159, 64, 0.6)'],
//         borderColor: ['rgba(255, 159, 64, 1)'],
//         borderWidth: 2,
//       },
//     ],
//   };

//   return (
//     <div className="relative flex h-screen bg-gray-800">
//       <div className="animated-background"></div>
//       <div className="waves"></div>
//       <MenubarRe />
//       <main className="main-content flex-1 p-8 overflow-auto">
//         <h1 className="text-4xl font-bold mb-6 text-white">Graphiques des Commandes et Matériels et des Visites du Site</h1>
//         <div className="flex space-x-8">
//           <div className="bg-gray-700 p-6 rounded-lg">
//             <h2 className="text-2xl font-semibold mb-4 text-white">Quantité Commandée par Médicament</h2>
//             <div style={{ width: '300px', height: '300px' }}> 
//               <Pie data={chartDataMedicaments} options={{
//                 responsive: true,
//                 plugins: {
//                   title: {
//                     display: true,
//                     text: 'Quantité de Médicaments Commandés',
//                     color: '#fff',
//                   },
//                   tooltip: {
//                     backgroundColor: '#333',
//                   },
//                 }
//               }} />
//             </div>
//           </div>

//           <div className="bg-gray-700 p-6 rounded-lg">
//             <h2 className="text-2xl font-semibold mb-4 text-white">Quantité de Matériels en Stock</h2>
//             <div style={{ width: '300px', height: '300px' }}> 
//               <Pie data={chartDataMateriels} options={{
//                 responsive: true,
//                 plugins: {
//                   title: {
//                     display: true,
//                     text: 'Quantité de Matériels en Stock',
//                     color: '#fff',
//                   },
//                   tooltip: {
//                     backgroundColor: '#333',
//                   },
//                 }
//               }} />
//             </div>
//           </div>

//           <div className="bg-gray-700 p-6 rounded-lg">
//             <h2 className="text-2xl font-semibold mb-4 text-white">Nombre de visite du site</h2>
//             <div style={{ width: '300px', height: '300px' }}>
//               <Pie data={chartDataVisites} options={{
//                 responsive: true,
//                 plugins: {
//                   title: {
//                     display: true,
//                     text: 'Visites sur la plateforme',
//                     color: '#fff',
//                   },
//                   tooltip: {
//                     backgroundColor: '#333',
//                   },
//                 }
//               }} />
//             </div>
//           </div>
//         </div>
//         <div className="mt-8">
//           <h2 className="text-2xl font-semibold mb-4 text-white">Tableau des Matériels</h2>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Dashboard;