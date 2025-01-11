import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale } from 'chart.js';
import { supabase } from "@/lib/supabaseClient";

// Enregistrer les composants nécessaires pour Chart.js
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

// Définition des types pour les données des médicaments et des matériaux
interface MedicamentData {
  nom_medicament: string;
  count: number;
}

interface MaterielData {
  nom_materiel: string;
  count: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
  }[];
}

const Dashboard = () => {
  const [medicamentsData, setMedicamentsData] = useState<MedicamentData[]>([]);
  const [materielsData, setMaterielsData] = useState<MaterielData[]>([]);

  useEffect(() => {
    // Fonction pour récupérer les médicaments commandés
    const fetchMedicaments = async () => {
      const { data, error } = await supabase
        .rpc('count_medicaments');  // Appel de la fonction SQL 'count_medicaments'
      
      if (error) console.error(error);
      else setMedicamentsData(data as MedicamentData[]);
    };

    // Fonction pour récupérer les matériaux commandés
    const fetchMateriels = async () => {
      const { data, error } = await supabase
        .rpc('count_materiels');  // Appel de la fonction SQL 'count_materiels'
      
      if (error) console.error(error);
      else setMaterielsData(data as MaterielData[]);
    };

    fetchMedicaments();
    fetchMateriels();
  }, []);

  // // // Fonction pour transformer les données en format requis par Chart.js
  // // const transformData = (data: MedicamentData[] | MaterielData[]): ChartData => {
  // //   const labels = data.map(item => item.nom || item.nom_materiel || '');
  // //   const values = data.map(item => item.count);
    
  //   return {
  //     labels,
  //     datasets: [{
  //       data: values,
  //       backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#F39C12'], // Couleurs pour le graphique
  //     }],
  //   };
  };

  // return (
  //   <div className="p-8">
  //     <h1 className="text-2xl font-bold text-center mb-8">Dashboard</h1>

  //     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
  //       {/* Graphique des médicaments */}
  //       <div className="bg-white p-4 rounded shadow-md">
  //         <h2 className="text-xl mb-4">Médicaments Commandés</h2>
  //         <Pie data={transformData(medicamentsData)} />
  //       </div>

  //       <div className="bg-white p-4 rounded shadow-md">
  //         <h2 className="text-xl mb-4">Matériaux Commandés</h2>
  //         <Pie data={transformData(materielsData)} />
  //       </div>
  //     </div>
  //   </div>
  // );
export default Dashboard;
