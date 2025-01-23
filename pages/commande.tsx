import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import MenubarRe from '../components/ui/MenuBarRe';
import { getUserRole } from './api/role'; 
import { User } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const Page = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newCommande, setNewCommande] = useState<string>('');
  const [showModal, setShowModal] = useState(false);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      const { data: userData } = await supabase
        .from('User')
        .select('id')
        .eq('email', session.user.email)
        .single();

      if (userData) {
        const role = await getUserRole(userData.id);
        setUserRole(role);
        setIsAdmin(role === "administrateur");
      }
    } else {
      setUser(null);
      setUserRole(null);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await checkSession();
      const fetchData = async () => {
        const { data, error } = await supabase
          .from('commande')
          .select('*');

        if (error) {
          console.error('Erreur lors de la récupération des données:', error);
          setError(error.message);
        } else {
          setData(data || []);
        }
      };
      fetchData();
    };

    initialize();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const { data: userData } = await supabase
          .from('User')
          .select('id')
          .eq('email', session.user.email)
          .single();

        if (userData) {
          const role = await getUserRole(userData.id);
          setUserRole(role);
          setIsAdmin(role === "administrateur");
        }
      } else {
        setUser(null);
        setUserRole(null);
        setIsAdmin(false);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
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
      setData(data.map(item => item.id_commande === id_commande ? { ...item, etat: newState } : item));
    }
  };

  const handleAddCommande = async () => {
    const { data: newData, error } = await supabase
      .from('commande')
      .insert([{ description: newCommande }]);

    if (error) {
      console.error('Erreur lors de l\'ajout de la commande:', error);
      setError(error.message);
    } else {
      if (newData) {
        setData([...data, ...newData]);
      }
      setNewCommande('');
      setShowModal(false);
    }
  };

  return (
    <div className="relative flex h-screen bg-gray-800">
      <div className="animated-background"></div>
      <div className="waves"></div>
      <MenubarRe />
      <main className="main-content flex-1 p-8 overflow-auto">
        <h1 className="text-4xl font-bold mb-6 text-white">Liste des Commandes</h1>
        {isAdmin && (
          <div className="mb-4">
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Ajouter
            </button>
          </div>
        )}
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
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded shadow-lg">
            <h2 className="text-2xl mb-4">Ajouter une nouvelle commande</h2>
            <input
              type="text"
              value={newCommande}
              onChange={(e) => setNewCommande(e.target.value)}
              placeholder="Nouvelle commande"
              className="px-4 py-2 border rounded mb-4 w-full"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
              >
                Annuler
              </button>
              <button
                onClick={handleAddCommande}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;