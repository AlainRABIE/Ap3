import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { fetchFournisseurs, checkIfAdmin, addFournisseur, updateFournisseur, deleteFournisseur } from "@/services/fournisseur/fournisseur"; // Assure-toi que le chemin est correct
import { SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/ui/app-sidebar";
import { supabase } from "@/lib/supabaseClient";

interface Fournisseur {
  id: number;
  nom: string;
  adresse: string;
  email: string;
  telephone: string;
  site_web: string;
}

const FournisseursPage = () => {
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState({
    id: null as number | null,
    nom: "",
    adresse: "",
    email: "",
    telephone: "",
    site_web: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const checkSession = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData?.session?.user) {
        setUser(sessionData.session.user);
        const isAdmin = await checkIfAdmin(sessionData.session.user.id);
        setIsAdmin(isAdmin);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de la session", error);
      setUser(null);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await checkSession();
      const fournisseurs = await fetchFournisseurs();
      setFournisseurs(fournisseurs);
      setIsLoading(false);
    };

    initialize();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const isAdmin = await checkIfAdmin(session.user.id);
        setIsAdmin(isAdmin);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleAddFournisseur = async (e: React.FormEvent) => {
    e.preventDefault();
    await addFournisseur(formData);
    const fournisseurs = await fetchFournisseurs();
    setFournisseurs(fournisseurs);
    setShowForm(false);
    setFormData({
      id: null,
      nom: "",
      adresse: "",
      email: "",
      telephone: "",
      site_web: "",
    });
  };

  const handleUpdateFournisseur = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateFournisseur(formData);
    const fournisseurs = await fetchFournisseurs();
    setFournisseurs(fournisseurs);
    setShowForm(false);
    setFormData({
      id: null,
      nom: "",
      adresse: "",
      email: "",
      telephone: "",
      site_web: "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDeleteFournisseur = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce fournisseur ?")) {
      return;
    }

    await deleteFournisseur(id);
    const fournisseurs = await fetchFournisseurs();
    setFournisseurs(fournisseurs);
  };

  const handleEditFournisseur = (fournisseur: Fournisseur) => {
    setFormData(fournisseur);
    setShowForm(true);
  };

  return (
    <SidebarProvider>
      <div className="flex">
        <AppSidebar />
        <div className="p-6 text-white flex-1">
          <h1 className="text-3xl font-semibold mb-6">Gestion des Fournisseurs</h1>
          {isAdmin && (
            <button
              onClick={() => {
                setFormData({
                  id: null,
                  nom: "",
                  adresse: "",
                  email: "",
                  telephone: "",
                  site_web: "",
                });
                setShowForm(true);
              }}
              className="bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors mb-6"
            >
              Ajouter un Fournisseur
            </button>
          )}

          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <form
                onSubmit={formData.id ? handleUpdateFournisseur : handleAddFournisseur}
                className="bg-gray-700 p-6 rounded-lg border-2 border-white text-gray-300 w-full max-w-md mx-auto mb-6"
              >
                <h2 className="text-2xl font-semibold mb-4">
                  {formData.id ? "Éditer un Fournisseur" : "Ajouter un Fournisseur"}
                </h2>
                <div className="mb-4">
                  <label className="block mb-2">Nom</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-600 text-gray-200 rounded-lg focus:outline-none"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Adresse</label>
                  <input
                    type="text"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-600 text-gray-200 rounded-lg focus:outline-none"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-600 text-gray-200 rounded-lg focus:outline-none"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Téléphone</label>
                  <input
                    type="text"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-600 text-gray-200 rounded-lg focus:outline-none"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Site Web</label>
                  <input
                    type="url"
                    name="site_web"
                    value={formData.site_web}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-600 text-gray-200 rounded-lg focus:outline-none"
                    required
                  />
                </div>
                <div className="flex justify-between">
                  <button
                    type="submit"
                    className="bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    {formData.id ? "Mettre à jour" : "Ajouter"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-xl">Chargement...</p>
            </div>
          ) : (
            <div>
              {fournisseurs.length === 0 ? (
                <p>Aucun fournisseur trouvé.</p>
              ) : (
                <table className="w-full text-gray-200">
                  <thead>
                    <tr>
                      <th className="border-b border-gray-500 p-3 text-left">Nom</th>
                      <th className="border-b border-gray-500 p-3 text-left">Adresse</th>
                      <th className="border-b border-gray-500 p-3 text-left">Email</th>
                      <th className="border-b border-gray-500 p-3 text-left">Téléphone</th>
                      <th className="border-b border-gray-500 p-3 text-left">Site Web</th>
                      {isAdmin && <th className="border-b border-gray-500 p-3 text-left">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {fournisseurs.map((fournisseur) => (
                      <tr key={fournisseur.id}>
                        <td className="border-b border-gray-500 p-3">{fournisseur.nom}</td>
                        <td className="border-b border-gray-500 p-3">{fournisseur.adresse}</td>
                        <td className="border-b border-gray-500 p-3">{fournisseur.email}</td>
                        <td className="border-b border-gray-500 p-3">{fournisseur.telephone}</td>
                        <td className="border-b border-gray-500 p-3">{fournisseur.site_web}</td>
                        {isAdmin && (
                          <td className="border-b border-gray-500 p-3 flex space-x-4">
                            <button
                              onClick={() => handleEditFournisseur(fournisseur)}
                              className="bg-yellow-500 text-white py-1 px-4 rounded-lg hover:bg-yellow-600 transition-colors"
                            >
                              Éditer
                            </button>
                            <button
                              onClick={() => handleDeleteFournisseur(fournisseur.id)}
                              className="bg-red-500 text-white py-1 px-4 rounded-lg hover:bg-red-600 transition-colors"
                            >
                              Supprimer
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default FournisseursPage;
