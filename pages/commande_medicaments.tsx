import { useEffect, useState } from 'react';
import { createClient, User } from '@supabase/supabase-js';
import MenubarRe from '../components/ui/MenuBarRe';
import { getUserRole } from './api/role';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type CommandeMedicament = {
  id_commande: number;
  id_user: number;
  id_stock_med: number;
  quantite: number;
  date_commande: string;
  etat: string;
  medicament_nom: string; 
};

export default function CommandeMedicaments() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [commandes, setCommandes] = useState<CommandeMedicament[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newCommande, setNewCommande] = useState<Partial<CommandeMedicament>>({
    quantite: 0,
    etat: 'en attente'
  });

  useEffect(() => {
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
      }
    };

    checkSession();
    loadCommandes();

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
          loadCommandes();
        }
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const loadCommandes = async () => {
    const { data, error } = await supabase
      .from('commande_médicaments')
      .select(`
        id_commande,
        id_user,
        id_stock_medicament,
        quantite,
        date_commande,
        etat,
        medicaments (nom)
      `)
      .order('date_commande', { ascending: false });
  
    if (!error && data) {
      const formattedData = data.map((commande) => ({
        id_commande: commande.id_commande,
        id_user: commande.id_user,
        id_stock_med: commande.id_stock_medicament,
        quantite: commande.quantite,
        date_commande: commande.date_commande,
        etat: commande.etat,
        medicament_nom: commande.medicaments[0]?.nom || 'Nom non disponible'
      }));
      setCommandes(formattedData);
    }
  };

  const handleAddCommande = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('commande_médicaments')
      .insert([{
        id_user: user.id,
        id_stock_med: newCommande.id_stock_med,
        quantite: newCommande.quantite,
        etat: 'en attente',
        date_commande: new Date().toISOString()
      }]);

    if (!error) {
      setShowModal(false);
      setNewCommande({ quantite: 0, etat: 'en attente' });
      loadCommandes();
    }
  };

  const handleUpdateState = async (id_commande: number, nouvelEtat: string) => {
    if (!isAdmin) return;

    const { error } = await supabase
      .from('commande_médicaments')
      .update({ etat: nouvelEtat })
      .eq('id_commande', id_commande);

    if (!error) {
      loadCommandes();
    }
  };

  return (
    <div className="relative flex h-screen bg-black bg-opacity-40 backdrop-blur-md">
      <div className="animated-background"></div>
      <div className="waves"></div>
      <MenubarRe />
      
      <main className="main-content flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-white">
            {isAdmin ? "Gestion des Commandes" : "Mes Commandes"}
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
          >
            Nouvelle Commande
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Médicament</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">État</th>
                {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {commandes.map((commande) => (
                <tr key={commande.id_commande}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(commande.date_commande).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{commande.id_stock_med}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{commande.quantite}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${commande.etat === 'acceptée' ? 'bg-green-100 text-green-800' : 
                        commande.etat === 'refusée' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {commande.etat}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded mr-2"
                        onClick={() => handleUpdateState(commande.id_commande, 'acceptée')}
                      >
                        Accepter
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        onClick={() => handleUpdateState(commande.id_commande, 'refusée')}
                      >
                        Refuser
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Nouvelle Commande</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ID Stock Médicament
                </label>
                <input
                  type="nom"
                  value={newCommande.id_stock_med || ''}
                  onChange={(e) => setNewCommande({
                    ...newCommande,
                    id_stock_med: parseInt(e.target.value)
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Quantité
                </label>
                <input
                  type="number"
                  value={newCommande.quantite || ''}
                  onChange={(e) => setNewCommande({
                    ...newCommande,
                    quantite: parseInt(e.target.value)
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddCommande}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Commander
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}