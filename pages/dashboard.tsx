import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale } from 'chart.js';
import { supabase } from "@/lib/supabaseClient";
import MenubarRe from '../components/ui/MenuBarRe';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

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
    const fetchMedicaments = async () => {
      const { data, error } = await supabase
        .rpc('count_medicaments');  
      
      if (error) console.error(error);
      else setMedicamentsData(data as MedicamentData[]);
    };

    const fetchMateriels = async () => {
      const { data, error } = await supabase
        .rpc('count_materiels');  
      
      if (error) console.error(error);
      else setMaterielsData(data as MaterielData[]);
    };

    fetchMedicaments();
    fetchMateriels();
  }, []);

  const medicamentsChartData: ChartData = {
    labels: medicamentsData.map((item) => item.nom_medicament),
    datasets: [
      {
        data: medicamentsData.map((item) => item.count),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
      },
    ],
  };

  const materielsChartData: ChartData = {
    labels: materielsData.map((item) => item.nom_materiel),
    datasets: [
      {
        data: materielsData.map((item) => item.count),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
      },
    ],
  };

  return (
    <div className="relative flex h-screen bg-gray-800">
      <div className="animated-background"></div>
      <div className="waves"></div>
      <MenubarRe />
      <main className="main-content flex-1 p-8 overflow-auto">
        <h1 className="text-4xl font-bold mb-6 text-white">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-white">Répartition des Médicaments</h2>
            <Pie data={medicamentsChartData} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-white">Répartition des Matériels</h2>
            <Pie data={materielsChartData} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;