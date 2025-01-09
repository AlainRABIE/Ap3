import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import "../src/app/globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";

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
  const [user, setUser] = useState<any>(null);

  const fetchFournisseurs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from("fournisseur").select("*");
      if (error) throw error;
      setFournisseurs(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des fournisseurs", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfAdmin = async (userId: string) => {
    const { data: roleData, error: roleError } = await supabase
      .from("role")
      .select("roleid")
      .eq("id", userId)
      .single();

    if (roleError) {
      console.error("Erreur lors de la récupération du rôle", roleError);
      return;
    }

    // Vérifier si le rôle est 'admin'
    if (roleData?.roleid === "admin") {
      setIsAdmin(true);
    }
  };

  // Fonction de gestion de la session
  const checkSession = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user) {
      setUser(sessionData.session.user);
      checkIfAdmin(sessionData.session.user.id); // Vérifier le rôle de l'utilisateur après la connexion
    } else {
      console.log("Aucun utilisateur connecté");
      setUser(null);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    fetchFournisseurs();
    checkSession(); // Vérifie la session au moment du rendu
  }, []);


  const addFournisseur = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("fournisseur").insert([{
        nom: formData.nom,
        adresse: formData.adresse,
        email: formData.email,
        telephone: formData.telephone,
        site_web: formData.site_web,
      }]);
      if (error) throw error;
      fetchFournisseurs(); // Rafraîchit la liste après ajout
      setShowForm(false); // Masque le formulaire après l'ajout
    } catch (error) {
      console.error("Erreur lors de l'ajout du fournisseur", error);
    }
  };

  const updateFournisseur = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("fournisseur")
        .update({
          nom: formData.nom,
          adresse: formData.adresse,
          email: formData.email,
          telephone: formData.telephone,
          site_web: formData.site_web,
        })
        .eq("id", formData.id);
      if (error) throw error;
      fetchFournisseurs(); // Rafraîchit la liste après modification
      setShowForm(false); // Masque le formulaire après modification
    } catch (error) {
      console.error("Erreur lors de la mise à jour du fournisseur", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const deleteFournisseur = async (id: number) => {
    try {
      const { error } = await supabase.from("fournisseur").delete().eq("id", id);
      if (error) throw error;
      fetchFournisseurs(); // Rafraîchit la liste après suppression
    } catch (error) {
      console.error("Erreur lors de la suppression du fournisseur", error);
    }
  };

  const editFournisseur = (fournisseur: Fournisseur) => {
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
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors mb-6"
            >
              Ajouter un Fournisseur
            </button>
          )}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <form
                onSubmit={formData.id ? updateFournisseur : addFournisseur}
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
            <p>Chargement...</p>
          ) : (
            <table className="table-auto w-full bg-gray-800 text-white border border-gray-600">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b border-gray-300">Nom</th>
                  <th className="px-6 py-3 border-b border-gray-300">Adresse</th>
                  <th className="px-6 py-3 border-b border-gray-300">Email</th>
                  <th className="px-6 py-3 border-b border-gray-300">Téléphone</th>
                  <th className="px-6 py-3 border-b border-gray-300">Site Web</th>
                  <th className="px-6 py-3 border-b border-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fournisseurs.map((fournisseur) => (
                  <tr key={fournisseur.id} className="bg-gray-700 text-white">
                    <td className="px-6 py-3">{fournisseur.nom}</td>
                    <td className="px-6 py-3">{fournisseur.adresse}</td>
                    <td className="px-6 py-3">{fournisseur.email}</td>
                    <td className="px-6 py-3">{fournisseur.telephone}</td>
                    <td className="px-6 py-3">{fournisseur.site_web}</td>
                    <td className="px-6 py-3 flex gap-2">
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => editFournisseur(fournisseur)}
                            className="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => deleteFournisseur(fournisseur.id)}
                            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
                          >
                            Supprimer
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default FournisseursPage;
