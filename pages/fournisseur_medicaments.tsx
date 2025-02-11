import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import MenubarRe from "../components/ui/MenuBarRe";

type FournisseurMedicament = {
  fournisseur_id: number;
  nom: string;
  adresse: string;
  email: string;
  telephone: string;
  site_web: string;
};

const fetchFournisseursMedicament = async (): Promise<FournisseurMedicament[]> => {
  const { data, error } = await supabase.from("fournisseur_medicament").select("*");
  if (error) {
    console.error("Erreur lors de la récupération des fournisseurs:", error.message);
    return [];
  }
  return data || [];
};

const addFournisseurMedicament = async (fournisseur: Omit<FournisseurMedicament, "fournisseur_id">) => {
  const { data, error } = await supabase.from("fournisseur_medicament").insert([fournisseur]);
  if (error) {
    console.error("Erreur détaillée:", error);
    return false;
  }
  return true;
};

const updateFournisseurMedicament = async (fournisseur: FournisseurMedicament) => {
  const { data, error } = await supabase.from("fournisseur_medicament").update(fournisseur).eq("fournisseur_id", fournisseur.fournisseur_id);
  if (error) {
    console.error("Erreur lors de la mise à jour du fournisseur:", error);
    return false;
  }
  return true;
};

const deleteFournisseurMedicament = async (fournisseur_id: number) => {
  const { error } = await supabase.from("fournisseur_medicament").delete().eq("fournisseur_id", fournisseur_id);
  if (error) {
    console.error("Erreur lors de la suppression:", error.message);
    return false;
  }
  return true;
};

const FournisseurMedicamentPage = () => {
  const [fournisseurs, setFournisseurs] = useState<FournisseurMedicament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newFournisseur, setNewFournisseur] = useState<Omit<FournisseurMedicament, "fournisseur_id">>({
    nom: "",
    adresse: "",
    email: "",
    telephone: "",
    site_web: ""
  });

  const [editingFournisseur, setEditingFournisseur] = useState<FournisseurMedicament | null>(null);

  // Etat pour gérer l'affichage du modal pour ajouter un fournisseur
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Etat pour gérer l'affichage du modal de modification
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const fetchedFournisseurs = await fetchFournisseursMedicament();
      setFournisseurs(fetchedFournisseurs);
      setIsLoading(false);
    };

    initialize();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingFournisseur) {
      if (await updateFournisseurMedicament({ ...editingFournisseur, ...newFournisseur })) {
        setFournisseurs(await fetchFournisseursMedicament());
        setEditingFournisseur(null);
        setNewFournisseur({
          nom: "",
          adresse: "",
          email: "",
          telephone: "",
          site_web: ""
        });
        setIsEditModalOpen(false); // Fermer le modal après la modification
      }
    } else {
      if (await addFournisseurMedicament(newFournisseur)) {
        const updatedFournisseurs = await fetchFournisseursMedicament();
        setFournisseurs(updatedFournisseurs);
        setNewFournisseur({
          nom: "",
          adresse: "",
          email: "",
          telephone: "",
          site_web: ""
        });
        setIsModalOpen(false); // Fermer le modal après l'ajout
      }
    }
  };

  const handleEdit = (fournisseur: FournisseurMedicament) => {
    setEditingFournisseur(fournisseur);
    setNewFournisseur({
      nom: fournisseur.nom,
      adresse: fournisseur.adresse,
      email: fournisseur.email,
      telephone: fournisseur.telephone,
      site_web: fournisseur.site_web
    });
    setIsEditModalOpen(true); // Ouvrir le modal de modification
  };

  const handleDelete = async (fournisseur_id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce fournisseur ?")) {
      if (await deleteFournisseurMedicament(fournisseur_id)) {
        setFournisseurs(fournisseurs.filter(f => f.fournisseur_id !== fournisseur_id));
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewFournisseur(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="relative flex h-screen bg-opacity-40 backdrop-blur-md">
      <div className="animated-background"></div>
      <div className="waves"></div>
      <MenubarRe />

      <div className="content p-6 w-full">
        {isLoading ? (
          <p className="text-white">Chargement...</p>
        ) : (
          <div className="space-y-6">
            <h1 className="text-white text-2xl font-bold">Gestion des Fournisseurs de Médicaments</h1>

            {/* Bouton Ajouter */}
            <button
              onClick={() => setIsModalOpen(true)} // Ouvrir le modal pour ajouter
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
            >
              Ajouter un fournisseur
            </button>

            {/* Modal pour Ajouter un fournisseur */}
            {isModalOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50">
                <div className="bg-gray-800 p-6 rounded-lg w-96">
                  <h2 className="text-white text-xl font-semibold mb-4">Ajouter un Fournisseur</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-white mb-2">Nom</label>
                      <input
                        type="text"
                        name="nom"
                        value={newFournisseur.nom}
                        onChange={handleInputChange}
                        className="w-full p-2 rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2">Adresse</label>
                      <input
                        type="text"
                        name="adresse"
                        value={newFournisseur.adresse}
                        onChange={handleInputChange}
                        className="w-full p-2 rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={newFournisseur.email}
                        onChange={handleInputChange}
                        className="w-full p-2 rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2">Téléphone</label>
                      <input
                        type="tel"
                        name="telephone"
                        value={newFournisseur.telephone}
                        onChange={handleInputChange}
                        className="w-full p-2 rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2">Site web</label>
                      <input
                        type="url"
                        name="site_web"
                        value={newFournisseur.site_web}
                        onChange={handleInputChange}
                        className="w-full p-2 rounded"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition"
                    >
                      Ajouter le fournisseur
                    </button>
                  </form>
                  <button
                    onClick={() => setIsModalOpen(false)} // Fermer le modal
                    className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}

            {/* Modal pour Modifier un fournisseur */}
            {isEditModalOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50">
                <div className="bg-gray-800 p-6 rounded-lg w-96">
                  <h2 className="text-white text-xl font-semibold mb-4">Modifier un Fournisseur</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-white mb-2">Nom</label>
                      <input
                        type="text"
                        name="nom"
                        value={newFournisseur.nom}
                        onChange={handleInputChange}
                        className="w-full p-2 rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2">Adresse</label>
                      <input
                        type="text"
                        name="adresse"
                        value={newFournisseur.adresse}
                        onChange={handleInputChange}
                        className="w-full p-2 rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={newFournisseur.email}
                        onChange={handleInputChange}
                        className="w-full p-2 rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2">Téléphone</label>
                      <input
                        type="tel"
                        name="telephone"
                        value={newFournisseur.telephone}
                        onChange={handleInputChange}
                        className="w-full p-2 rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2">Site web</label>
                      <input
                        type="url"
                        name="site_web"
                        value={newFournisseur.site_web}
                        onChange={handleInputChange}
                        className="w-full p-2 rounded"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition"
                    >
                      Modifier le fournisseur
                    </button>
                  </form>
                  <button
                    onClick={() => setIsEditModalOpen(false)} // Fermer le modal de modification
                    className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}

            {/* Liste des fournisseurs */}
            <ul className="space-y-4">
              {fournisseurs.map(fournisseur => (
                <li key={fournisseur.fournisseur_id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-white">{fournisseur.nom}</p>
                    <p className="text-gray-400">{fournisseur.adresse}</p>
                    <p className="text-gray-400">{fournisseur.email}</p>
                  </div>
                  <div>
                    <button
                      onClick={() => handleEdit(fournisseur)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(fournisseur.fournisseur_id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition ml-2"
                    >
                      Supprimer
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default FournisseurMedicamentPage;
