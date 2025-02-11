import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import MenubarRe from "../components/ui/MenuBarRe";

type FournisseurMateriel = {
  id: number;
  nom: string;
  adresse: string;
  email: string;
  telephone: string;
  site_web: string;
};

const fetchFournisseursMateriel = async (): Promise<FournisseurMateriel[]> => {
  const { data, error } = await supabase.from("fournisseur_materiel").select("*");
  if (error) {
    console.error("Erreur lors de la récupération des fournisseurs:", error.message);
    return [];
  }
  return data || [];
};

const addFournisseurMateriel = async (fournisseur: Omit<FournisseurMateriel, "id">) => {
  const { data, error } = await supabase.from("fournisseur_materiel").insert([fournisseur]);
  if (error) {
    console.error("Erreur détaillée:", error);
    return false;
  }
  return true;
};

const updateFournisseurMateriel = async (fournisseur: FournisseurMateriel) => {
  const { data, error } = await supabase.from("fournisseur_materiel").update(fournisseur).eq("id", fournisseur.id);
  if (error) {
    console.error("Erreur lors de la mise à jour du fournisseur:", error);
    return false;
  }
  return true;
};

const deleteFournisseurMateriel = async (id: number) => {
  const { error } = await supabase.from("fournisseur_materiel").delete().eq("id", id);
  if (error) {
    console.error("Erreur lors de la suppression:", error.message);
    return false;
  }
  return true;
};

const FournisseurMaterielPage = () => {
  const [fournisseurs, setFournisseurs] = useState<FournisseurMateriel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newFournisseur, setNewFournisseur] = useState<Omit<FournisseurMateriel, "id">>({
    nom: "",
    adresse: "",
    email: "",
    telephone: "",
    site_web: "",
  });

  const [editingFournisseur, setEditingFournisseur] = useState<FournisseurMateriel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const fetchedFournisseurs = await fetchFournisseursMateriel();
      setFournisseurs(fetchedFournisseurs);
      setIsLoading(false);
    };

    initialize();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingFournisseur) {
      if (await updateFournisseurMateriel({ ...editingFournisseur, ...newFournisseur })) {
        setFournisseurs(await fetchFournisseursMateriel());
        setEditingFournisseur(null);
        setNewFournisseur({
          nom: "",
          adresse: "",
          email: "",
          telephone: "",
          site_web: "",
        });
        setIsEditModalOpen(false);
      }
    } else {
      if (await addFournisseurMateriel(newFournisseur)) {
        setFournisseurs(await fetchFournisseursMateriel());
        setNewFournisseur({
          nom: "",
          adresse: "",
          email: "",
          telephone: "",
          site_web: "",
        });
        setIsModalOpen(false);
      }
    }
  };

  const handleEdit = (fournisseur: FournisseurMateriel) => {
    setEditingFournisseur(fournisseur);
    setNewFournisseur({
      nom: fournisseur.nom,
      adresse: fournisseur.adresse,
      email: fournisseur.email,
      telephone: fournisseur.telephone,
      site_web: fournisseur.site_web,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce fournisseur ?")) {
      if (await deleteFournisseurMateriel(id)) {
        setFournisseurs(fournisseurs.filter(f => f.id !== id));
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
            <h1 className="text-white text-2xl font-bold">Gestion des Fournisseurs</h1>

            {/* Bouton Ajouter */}
            <button
              onClick={() => setIsModalOpen(true)}
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
                    onClick={() => setIsModalOpen(false)}
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
                    onClick={() => setIsEditModalOpen(false)}
                    className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}

            {/* Liste des fournisseurs */}
            <table className="table-auto w-full text-white">
              <thead>
                <tr>
                  <th className="px-4 py-2">Nom</th>
                  <th className="px-4 py-2">Adresse</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Téléphone</th>
                  <th className="px-4 py-2">Site Web</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fournisseurs.map(f => (
                  <tr key={f.id}>
                    <td className="px-4 py-2">{f.nom}</td>
                    <td className="px-4 py-2">{f.adresse}</td>
                    <td className="px-4 py-2">{f.email}</td>
                    <td className="px-4 py-2">{f.telephone}</td>
                    <td className="px-4 py-2">{f.site_web}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleEdit(f)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(f.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FournisseurMaterielPage;
