import React, { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabaseClient";
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale } from 'chart.js';
import MenubarRe from '../components/ui/MenuBarRe';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

interface MedicamentStockData {
  nom_medicament: string;
  quantite_en_stock: number;
}

const Dashboard = () => {
  const [medicamentsData, setMedicamentsData] = useState<MedicamentStockData[]>([]);

  useEffect(() => {
    const fetchMedicamentsStock = async () => {
      // Récupérer les médicaments et leurs quantités en stock
      const { data, error } = await supabase
        .from('stock_medicaments') // Table des stocks de médicaments
        .select('id_medicament, quantite_en_stock'); // Sélectionner les colonnes nécessaires

      if (error) {
        console.error(error);
      } else {
        // Récupérer les informations des médicaments depuis la table "medicaments"
        const medicamentsIds = data?.map(item => item.id_medicament);
        const { data: medicaments, error: medicamentsError } = await supabase
          .from('medicaments') // Table des médicaments
          .select('id, name')
          .in('id', medicamentsIds); // Filtrer par les IDs des médicaments ayant du stock

        if (medicamentsError) {
          console.error(medicamentsError);
        } else {
          // Fusionner les données des stocks et des médicaments
          const mergedData = medicaments.map((medicament: any) => {
            const stockItem = data?.find((stock: any) => stock.id_medicament === medicament.id);
            return {
              nom_medicament: medicament.name,
              quantite_en_stock: stockItem?.quantite_en_stock || 0,
            };
          });

          setMedicamentsData(mergedData);
        }
      }
    };

    fetchMedicamentsStock();
  }, []);

  // Préparer les données pour le graphique circulaire (camembert)
  const chartData = {
    labels: medicamentsData.map(item => item.nom_medicament),
    datasets: [
      {
        label: 'Médicaments en stock',
        data: medicamentsData.map(item => item.quantite_en_stock),
        backgroundColor: medicamentsData.map(() => `#${Math.floor(Math.random() * 16777215).toString(16)}`), // Couleurs aléatoires
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
        <div className="grid grid-cols-1 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-white">Camembert des Médicaments en Stock</h2>
            <div className="bg-gray-700 p-6 rounded-lg">
              <Pie data={chartData} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
