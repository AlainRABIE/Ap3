import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import MenubarRe from "../components/ui/MenuBarRe";

interface Commande {
  id: number;
  user_id: number;
  fournisseur_id: number;
  produit_id: number;
  quantite: number;
  created_at: string;
}

interface Medicament {
  id: number;
  name: string;
}

interface Fournisseur {
  id: number;
  nom: string;
}

const CommandesPage = () => {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditFormVisible, setIsEditFormVisible] = useState(false);
  const [newCommande, setNewCommande] = useState<Commande>({
    id: 0,
    user_id: 1,
    fournisseur_id: 0,
    produit_id: 0,
    quantite: 0,
    created_at: new Date().toISOString(),
  });

  const [commandeToEdit, setCommandeToEdit] = useState<Commande | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

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

  const fetchCommandes = async () => {
    const { data, error } = await supabase.from("commandes").select("*");
    if (error) {
      console.error("Erreur lors de la récupération des commandes :", error.message);
    } else {
      setCommandes(data);
    }
  };

  const fetchUserRole = async () => {
    const user = await supabase.auth.getUser();
    if (user.data) {
      const { data, error } = await supabase
        .from("role")
        .select("roleid")
        .single();
      if (error) {
        console.error("Erreur lors de la récupération du rôle de l'utilisateur :", error.message);
      } else {
        setUserRole(data?.roleid || null);
      }
    }
  };

  useEffect(() => {
    fetchCommandes();
    fetchMedicaments();
    fetchFournisseurs();
    fetchUserRole();
  }, []);

  const handleAddCommande = async () => {
    const { data, error } = await supabase.from("commandes").insert([newCommande]);
    if (error) {
      console.error("Erreur lors de l'ajout de la commande :", error.message);
    } else {
      fetchCommandes();
      setIsFormVisible(false);
    }
  };

  const handleEditCommande = async () => {
    if (!commandeToEdit) return;

    const { data, error } = await supabase
      .from("commandes")
      .update({
        produit_id: commandeToEdit.produit_id,
        fournisseur_id: commandeToEdit.fournisseur_id,
        quantite: commandeToEdit.quantite,
      })
      .match({ id: commandeToEdit.id });

    if (error) {
      console.error("Erreur lors de la modification de la commande :", error.message);
    } else {
      fetchCommandes();
      setCommandeToEdit(null);
      setIsEditFormVisible(false);
    }
  };

  const canEditCommande = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffInHours = (now.getTime() - createdDate.getTime()) / (1000 * 3600);
    return diffInHours < 3;
  };

  return (
    <div className="relative flex h-screen bg-gray-800">
      <div className="animated-background"></div>
      <div className="waves"></div>
      <MenubarRe />
      <main className="main-content flex-1 p-8 overflow-auto">
        <div className="w-full max-w-4xl mx-auto">
          <h2 className="text-xl font-bold mb-4 text-white">Liste des commandes</h2>
          <table className="min-w-full table-auto mb-4">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Nom du Médicament</th>
                <th className="px-4 py-2 border">Nom du Fournisseur</th>
                <th className="px-4 py-2 border">Quantité</th>
                <th className="px-4 py-2 border">Date de Création</th>
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
                      {fournisseur ? fournisseur.nom : "Nom non spécifié"}
                    </td>
                    <td className="px-4 py-2 border">{commande.quantite}</td>
                    <td className="px-4 py-2 border">
                      {new Date(commande.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 border">
                      <button
                        onClick={() => setCommandeToEdit(commande)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Détails
                      </button>
                      {canEditCommande(commande.created_at) ? (
                        <button
                          onClick={() => {
                            setCommandeToEdit(commande);
                            setIsEditFormVisible(true);
                          }}
                          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 ml-2"
                        >
                          Modifier
                        </button>
                      ) : (
                        <button
                          disabled
                          className="px-4 py-2 bg-gray-500 text-white rounded cursor-not-allowed ml-2"
                        >
                          Modifier (délai dépassé)
                        </button>
                      )}
                      {userRole === "administrateur" && (
                        <>
                          <button
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-2"
                          >
                            Approuver
                          </button>
                          <button
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 ml-2"
                          >
                            Rejeter
                          </button>
                        </>
                      )}
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

          {isEditFormVisible && commandeToEdit && (
            <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-8 rounded-lg w-96">
                <h3 className="text-2xl font-semibold mb-4 text-center">Modifier la commande</h3>

                <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                  <div>
                    <label htmlFor="medicament" className="block text-sm font-medium text-gray-700">Médicament</label>
                    <select
                      id="medicament"
                      value={commandeToEdit.produit_id}
                      onChange={(e) => setCommandeToEdit({ ...commandeToEdit, produit_id: Number(e.target.value) })}
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
                      value={commandeToEdit.fournisseur_id}
                      onChange={(e) => setCommandeToEdit({ ...commandeToEdit, fournisseur_id: Number(e.target.value) })}
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
                      value={commandeToEdit.quantite}
                      onChange={(e) => setCommandeToEdit({ ...commandeToEdit, quantite: Number(e.target.value) })}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleEditCommande}
                    className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Sauvegarder les modifications
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditFormVisible(false)}
                    className="w-full py-2 mt-4 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Annuler
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CommandesPage;