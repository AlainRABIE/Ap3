import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import MenubarRe from '../components/ui/MenuBarRe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const Page = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('commandes') 
        .select('*');

      if (error) {
        console.error('Erreur lors de la récupération des données:', error);
      } else {
        setData(data);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="relative flex h-screen bg-gray-800">
      <div className="animated-background"></div>
      <div className="waves"></div>
      <MenubarRe />
      <main className="main-content flex-1 p-8 overflow-auto">
        <h1 className="text-4xl font-bold mb-6 text-white">Liste des Commandes</h1>
        <table className="min-w-full table-auto mb-4">
          <thead>
            <tr>
              <th className="px-4 py-2 border">ID Commande</th>
              <th className="px-4 py-2 border">ID Utilisateur</th>
              <th className="px-4 py-2 border">ID Produit</th>
              <th className="px-4 py-2 border">Quantité</th>
              <th className="px-4 py-2 border">État</th>
              <th className="px-4 py-2 border">Date de Création</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-2 border">{item.id}</td>
                <td className="px-4 py-2 border">{item.user_id}</td>
                <td className="px-4 py-2 border">{item.produit_id}</td>
                <td className="px-4 py-2 border">{item.quantite}</td>
                <td className="px-4 py-2 border">{item.etat}</td>
                <td className="px-4 py-2 border">{new Date(item.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default Page;