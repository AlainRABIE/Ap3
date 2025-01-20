import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import MenubarRe from '../components/ui/MenuBarRe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const Page = () => {
  const [data, setData] = useState<any[]>([]);
  const [medicaments, setMedicaments] = useState<any[]>([]);
  const [fournisseurs, setFournisseurs] = useState<any[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [newCommande, setNewCommande] = useState({
    produit_id: '',
    fournisseur_id: '',
    quantite: 0,
  });

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

    const fetchMedicaments = async () => {
      const { data, error } = await supabase.from("medicaments").select("*");
      if (error) {
        console.error("Erreur lors de la récupération des médicaments :", error.message);
      } else {
        setMedicaments(data);
      }
    };

    const fetchFournisseurs = async () => {
      const { data, error } = await supabase.from("fournisseur").select("*");
      if (error) {
        console.error("Erreur lors de la récupération des fournisseurs :", error.message);
      } else {
        setFournisseurs(data);
      }
    };

    fetchData();
    fetchMedicaments();
    fetchFournisseurs();
  }, []);

  const handleAddCommande = async () => {
    const { data, error } = await supabase
      .from('commandes')
      .insert([newCommande]);

    if (error) {
      console.error('Erreur lors de l\'ajout de la commande:', error);
    } else {
      // setData([...data, ...data]);
      setIsFormVisible(false);
      setNewCommande({
        produit_id: '',
        fournisseur_id: '',
        quantite: 0,
      });
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

        <button
          onClick={() => setIsFormVisible(true)}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Ajouter une commande
        </button>

        {isFormVisible && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-lg w-96">
              <h3 className="text-2xl font-semibold mb-4 text-center">Ajouter une nouvelle commande</h3>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div>
                  <label htmlFor="medicament" className="block text-sm font-medium text-gray-700">Médicament</label>
                  <select
                    id="medicament"
                    value={newCommande.produit_id}
                    // onChange={(e) => setNewCommande({ ...newCommande, produit_id: Number(e.target.value) })}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un médicament</option>
                    {medicaments.map((med) => (
                      <option key={med.id} value={med.id}>
                        {med.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="fournisseur" className="block text-sm font-medium text-gray-700">Fournisseur</label>
                  <select
                    id="fournisseur"
                    value={newCommande.fournisseur_id}
                    // onChange={(e) => setNewCommande({ ...newCommande, fournisseur_id: Number(e.target.value) })}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un fournisseur</option>
                    {fournisseurs.map((fourn) => (
                      <option key={fourn.id} value={fourn.id}>
                        {fourn.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="quantite" className="block text-sm font-medium text-gray-700">Quantité</label>
                  <input
                    id="quantite"
                    type="number"
                    value={newCommande.quantite}
                    onChange={(e) => setNewCommande({ ...newCommande, quantite: Number(e.target.value) })}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddCommande}
                  className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Ajouter
                </button>
                <button
                  type="button"
                  onClick={() => setIsFormVisible(false)}
                  className="w-full py-2 mt-4 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Annuler
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Page;