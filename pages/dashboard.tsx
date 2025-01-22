import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, TooltipItem } from 'chart.js';
import { supabase } from "@/lib/supabaseClient";
import MenubarRe from '../components/ui/MenuBarRe';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

interface MedicamentData {
  nom_medicament: string;
  count: number;
}

interface MaterielData {
  nom_materiel: string;
  count: number;
}

interface OrderData {
  type: string;
  count: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
  }[];
}

const Dashboard = () => {
  const [medicamentsData, setMedicamentsData] = useState<MedicamentData[]>([]);
  const [materielsData, setMaterielsData] = useState<MaterielData[]>([]);
  const [ordersData, setOrdersData] = useState<OrderData[]>([]);

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

    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('type');
      
      if (error) console.error(error);
      else {
        const groupedData = data.reduce((acc: { [key: string]: number }, order) => {
          const type = order.type;
          if (!acc[type]) {
            acc[type] = 0;
          }
          acc[type]++;
          return acc;
        }, {});

        const formattedData = Object.keys(groupedData).map((type) => ({
          type,
          count: groupedData[type],
        }));

        setOrdersData(formattedData as OrderData[]);
      }
    };

    fetchMedicaments();
    fetchMateriels();
    fetchOrders();
  }, []);

  const chartData: ChartData = {
    labels: ['Médicaments', 'Matériels', 'Commandes'],
    datasets: [
      {
        label: 'Médicaments',
        data: [medicamentsData.reduce((sum, item) => sum + item.count, 0)],
        backgroundColor: ['#FF6384'],
      },
      {
        label: 'Matériels',
        data: [materielsData.reduce((sum, item) => sum + item.count, 0)],
        backgroundColor: ['#36A2EB'],
      },
      {
        label: 'Commandes',
        data: [ordersData.reduce((sum, item) => sum + item.count, 0)],
        backgroundColor: ['#FFCE56'],
      },
    ],
  };

  const chartOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<'bar'>) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.raw !== null) {
              label += context.raw;
            }
            return label;
          },
        },
      },
    },
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
            <h2 className="text-2xl font-semibold mb-4 text-white">Diagramme de commande</h2>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;