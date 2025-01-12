import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale } from 'chart.js';
import { supabase } from "@/lib/supabaseClient";

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
}
  export default Dashboard;
