import React, { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabaseClient";
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import MenubarRe from '../components/ui/MenuBarRe';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface Commande {
  id_commande: number;
  id_user: string;
  id_medicament: number;
  quantite: number;
  date_commande: string;
  etat: string;
}

const CommandesPage = () => {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: commandesData, error: commandesError } = await supabase
        .from('commande_médicaments')
        .select('*');

      if (commandesError) {
        console.error(commandesError);
        setLoading(false);
        return;
      }

      setCommandes(commandesData || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Chargement...</div>;
  }

  const chartData = {
    labels: commandes.map((commande) => `Commande ${commande.id_commande}`),
    datasets: [
      {
        label: 'Quantité',
        data: commandes.map((commande) => commande.quantite),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="relative flex h-screen bg-gray-800">
      <div className="animated-background"></div>
      <div className="waves"></div>
      <MenubarRe />
      <main className="main-content flex-1 p-8 overflow-auto">
        <h1 className="text-4xl font-bold mb-6 text-white">Graphique des Commandes</h1>
        <div className="bg-gray-700 p-6 rounded-lg">
          <Pie data={chartData} options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  color: 'white'
                }
              },
              tooltip: {
                backgroundColor: '#333',
                titleColor: '#fff',
                bodyColor: '#fff',
              },
            }
          }} />
        </div>
      </main>
    </div>
  );
};

export default CommandesPage;