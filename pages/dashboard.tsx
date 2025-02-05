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

// Enregistrer les composants nécessaires de Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [commandes, setCommandes] = useState<any[]>([]);
  const [materiels, setMateriels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // Variable de chargement
  const [visites, setVisites] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      // Récupérer toutes les commandes de la table commande_médicaments
      const { data: commandesData, error: commandesError } = await supabase
        .from('commande_médicaments')
        .select('*');

      // Récupérer toutes les données de la table stock_materiel
      const { data: materielsData, error: materielsError } = await supabase
        .from('stock_materiel')
        .select('*');

      if (commandesError || materielsError) {
        console.error(commandesError || materielsError);
        setLoading(false);
        return;
      }

      console.log("Commandes récupérées:", commandesData); 
      console.log("Matériels récupérés:", materielsData); 
      setCommandes(commandesData || []);
      setMateriels(materielsData || []);
      setLoading(false);
    };

    fetchData();

    // Gérer le compteur de visites dans le localStorage
    const visitesActuelles = parseInt(localStorage.getItem('visites') || '0', 10) + 1;
    localStorage.setItem('visites', visitesActuelles.toString());
    setVisites(visitesActuelles);

  }, []);

  if (loading) {
    return <div>Chargement...</div>; // Message de chargement
  }

  if (commandes.length === 0 || materiels.length === 0) {
    return <div>Aucune donnée trouvée.</div>; // Message si aucune donnée
  }

  // Préparer les données pour le graphique des médicaments
  const chartDataMedicaments = {
    labels: commandes.map((commande: any) => `Médicament ${commande.id_stock_medicament}`),
    datasets: [
      {
        label: 'Médicaments',
        data: commandes.map(() => 1),  // Chaque médicament obtient une valeur 1
        backgroundColor: commandes.map(() => 'rgba(54, 162, 235, 0.6)'),  // Couleur des médicaments (bleu clair)
        borderColor: 'rgba(54, 162, 235, 1)', // Bordure bleu
        borderWidth: 2,
      },
      {
        label: 'Quantités',
        data: commandes.map((commande: any) => commande.quantite),  // Quantités commandées
        backgroundColor: commandes.map(() => 'rgba(255, 99, 132, 0.6)'),  // Couleur des quantités (rose)
        borderColor: 'rgba(255, 99, 132, 1)', // Bordure rose
        borderWidth: 2,
      },
    ],
  };

  // Préparer les données pour le graphique des matériels
  const chartDataMateriels = {
    labels: materiels.map((materiel: any) => `Matériel ${materiel.materiel_id}`),
    datasets: [
      {
        label: 'Matériels',
        data: materiels.map(() => 1),  // Chaque matériel obtient une valeur 1
        backgroundColor: materiels.map(() => 'rgba(75, 192, 192, 0.6)'),  // Couleur des matériels (vert clair)
        borderColor: 'rgba(75, 192, 192, 1)', // Bordure vert
        borderWidth: 2,
      },
      {
        label: 'Quantités',
        data: materiels.map((materiel: any) => materiel.quantite),  // Quantités de matériels
        backgroundColor: materiels.map(() => 'rgba(153, 102, 255, 0.6)'),  // Couleur des quantités de matériels (violet)
        borderColor: 'rgba(153, 102, 255, 1)', // Bordure violet
        borderWidth: 2,
      },
    ],
  };

  // Données pour le graphique des visites
  const chartDataVisites = {
    labels: ['Visites'],
    datasets: [
      {
        label: 'Visites',
        data: [visites],
        backgroundColor: ['rgba(255, 159, 64, 0.6)'],
        borderColor: ['rgba(255, 159, 64, 1)'],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="relative flex h-screen bg-gray-800">
      <div className="animated-background"></div>
      <div className="waves"></div>
      <MenubarRe />
      <main className="main-content flex-1 p-8 overflow-auto">
        <h1 className="text-4xl font-bold mb-6 text-white">Graphiques des Commandes et Matériels et des Visites du Site</h1>
        <div className="flex space-x-8">
          {/* Graphique des commandes (Médicaments) */}
          <div className="bg-gray-700 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-white">Quantité Commandée par Médicament</h2>
            <div style={{ width: '300px', height: '300px' }}> {/* Taille ajustée */}
              <Pie data={chartDataMedicaments} options={{
                responsive: true,
                plugins: {
                  title: {
                    display: true,
                    text: 'Quantité de Médicaments Commandés',
                    color: '#fff',
                  },
                  tooltip: {
                    backgroundColor: '#333',
                  },
                }
              }} />
            </div>
          </div>

          {/* Graphique des matériels */}
          <div className="bg-gray-700 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-white">Quantité de Matériels en Stock</h2>
            <div style={{ width: '300px', height: '300px' }}> {/* Taille ajustée */}
              <Pie data={chartDataMateriels} options={{
                responsive: true,
                plugins: {
                  title: {
                    display: true,
                    text: 'Quantité de Matériels en Stock',
                    color: '#fff',
                  },
                  tooltip: {
                    backgroundColor: '#333',
                  },
                }
              }} />
            </div>
          </div>

          
          <div className="bg-gray-700 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 text-white">Nombre de visite du site</h2>
            <div style={{ width: '300px', height: '300px' }}> {/* Taille ajustée */}
              <Pie data={chartDataVisites} options={{
                responsive: true,
                plugins: {
                  title: {
                    display: true,
                    text: 'Visites sur la plateforme',
                    color: '#fff',
                  },
                  tooltip: {
                    backgroundColor: '#333',
                    
                  },
                }
              }} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;