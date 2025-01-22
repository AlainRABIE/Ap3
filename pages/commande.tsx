import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import MenubarRe from '../components/ui/MenuBarRe';
import { getUserRole } from './api/role'; // Assumption: getUserRole function is defined in this file

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const Page = () => {
  const [data, setData] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userId = parseInt(session.user.id, 10); // Ensure userId is a number
        const role = await getUserRole(userId); // Use the getUserRole function to get the user's role
        setIsAdmin(role === "administrateur");
      }
    };

    const fetchData = async () => {
      const { data, error } = await supabase
        .from('commande') 
        .select('*');

      if (error) {
        console.error('Erreur lors de la récupération des données:', error);
        setError(error.message);
      } else {
        setData(data);
      }
    };

    checkUserRole();
    fetchData();
  }, []);

  const handleUpdateState = async (id_commande: number, newState: string) => {
    const { error } = await supabase
      .from('commande')
      .update({ etat: newState })
      .eq('id_commande', id_commande);

    if (error) {
      console.error('Erreur lors de la mise à jour de l\'état:', error);
      setError(error.message);
    } else {
      // Mettre à jour localement l'état de la commande
      setData(data.map(item => item.id_commande === id_commande ? { ...item, etat: newState } : item));
    }
  };

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
              {isAdmin && <th className="px-4 py-2 border">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id_commande}>
                <td className="px-4 py-2 border">{item.id_commande}</td>
                <td className="px-4 py-2 border">{item.id_user}</td>
                <td className="px-4 py-2 border">{item.id_medicament || item.id_materiel || item.id_mouvement}</td>
                <td className="px-4 py-2 border">{item.quantite}</td>
                <td className="px-4 py-2 border">{item.etat}</td>
                <td className="px-4 py-2 border">{new Date(item.date_commande).toLocaleString()}</td>
                {isAdmin && (
                  <td className="px-4 py-2 border">
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                      onClick={() => handleUpdateState(item.id_commande, 'Acceptée')}
                    >
                      Accepter
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => handleUpdateState(item.id_commande, 'Refusée')}
                    >
                      Refuser
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default Page;