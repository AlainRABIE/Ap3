import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

// Définition des types
interface Commande {
  id: number;
  user_id: number;
  fournisseur_id: number;
  produit_id: number;
  quantite: number;
  statut: string;
  etat: string;
}

interface Medicament {
  id: number;
  name: string;
}

interface Fournisseur {
  id: number;
  name: string;
}

const CommandesPage = () => {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [newCommande, setNewCommande] = useState<Commande>({
    id: 0,
    user_id: 1, // Exemple
    fournisseur_id: 0,
    produit_id: 0,
    quantite: 0,
    statut: "En attente",
    etat: "En attente",
  });

  // Fonction pour récupérer les médicaments
  const fetchMedicaments = async () => {
    const { data, error } = await supabase.from("medicaments").select("*");
    if (error) {
      console.error("Erreur lors de la récupération des médicaments :", error.message);
    } else {
      setMedicaments(data);
    }
  };

  // Fonction pour récupérer les fournisseurs
  const fetchFournisseurs = async () => {
    const { data, error } = await supabase.from("fournisseur").select("*");
    if (error) {
      console.error("Erreur lors de la récupération des fournisseurs :", error.message);
    } else {
      setFournisseurs(data);
    }
  };

  // Fonction pour récupérer les commandes
  const fetchCommandes = async () => {
    const { data, error } = await supabase.from("commandes").select("*");
    if (error) {
      console.error("Erreur lors de la récupération des commandes :", error.message);
    } else {
      setCommandes(data);
    }
  };

  // Hook pour récupérer les données au chargement
  useEffect(() => {
    fetchCommandes();
    fetchMedicaments();
    fetchFournisseurs();
  }, []);

  // Fonction pour ajouter une commande
  const handleAddCommande = async () => {
    const { data, error } = await supabase.from("commandes").insert([newCommande]);
    if (error) {
      console.error("Erreur lors de l'ajout de la commande :", error.message);
    } else {
      fetchCommandes();
      setIsFormVisible(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Liste des commandes</h2>
      <table className="min-w-full table-auto mb-4">
        <thead>
          <tr>
            <th className="px-4 py-2 border">Nom du Médicament</th>
            <th className="px-4 py-2 border">Nom du Fournisseur</th>
            <th className="px-4 py-2 border">Quantité</th>
            <th className="px-4 py-2 border">État</th>
            <th className="px-4 py-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {commandes.map((commande) => {
            const medicament = medicaments.find(
              (med) => med.id === commande.produit_id
            );
            const fournisseur = fournisseurs.find(
              (fourn) => fourn.id === commande.fournisseur_id
            );

            return (
              <tr key={commande.id}>
                <td className="px-4 py-2 border">
                  {medicament ? medicament.name : "Médicament non trouvé"}
                </td>
                <td className="px-4 py-2 border">
                  {fournisseur ? fournisseur.name : "Fournisseur non trouvé"}
                </td>
                <td className="px-4 py-2 border">{commande.quantite}</td>
                <td className="px-4 py-2 border">{commande.etat}</td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => console.log("Action pour la commande", commande.id)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Action
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button
        onClick={() => setIsFormVisible(true)}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Ajouter une commande
      </button>

      {isFormVisible && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg w-96">
            <h3 className="text-2xl font-semibold mb-4 text-center">Ajouter une nouvelle commande</h3>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div>
                <label htmlFor="medicament" className="block text-sm font-medium text-gray-700">Médicament</label>
                <select
                  id="medicament"
                  value={newCommande.produit_id}
                  onChange={(e) => setNewCommande({ ...newCommande, produit_id: Number(e.target.value) })}
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
                  onChange={(e) => setNewCommande({ ...newCommande, fournisseur_id: Number(e.target.value) })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un fournisseur</option>
                  {fournisseurs.map((fourn) => (
                    <option key={fourn.id} value={fourn.id}>
                      {fourn.name}
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
                  placeholder="Quantité"
                />
              </div>

              <div>
                <label htmlFor="etat" className="block text-sm font-medium text-gray-700">État</label>
                <select
                  id="etat"
                  value={newCommande.etat}
                  onChange={(e) => setNewCommande({ ...newCommande, etat: e.target.value })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="En attente">En attente</option>
                  <option value="Terminé">Terminé</option>
                  <option value="Annulé">Annulé</option>
                </select>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsFormVisible(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  onClick={handleAddCommande}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommandesPage;
