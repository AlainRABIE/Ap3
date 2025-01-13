import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import "../src/app/globals.css";
import { SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/ui/app-sidebar";
import { User } from "@supabase/supabase-js";

interface Fournisseur {
  id: number;
  nom: string;
  adresse: string;
  email: string;
  telephone: string;
  site_web: string;
}

interface UserRole {
  id: string;
  roleid: number;
  role?: {
    name: string;
  };
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

  const fetchFournisseurs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("fournisseur")
        .select("*")
        .order('nom', { ascending: true });
      
      if (error) throw error;
      setFournisseurs(data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des fournisseurs", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfAdmin = async (userId: string) => {
    try {
      const { data: userData, error } = await supabase
        .from("user")
        .select(`
          id,
          role:roleid (
            name
          )
        `)
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Erreur lors de la récupération de l'utilisateur", error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(userData?.role?.name === "admin");
    } catch (error) {
      console.error("Erreur lors de la vérification du rôle administrateur", error);
      setIsAdmin(false);
    }
  };

  const checkSession = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData?.session?.user) {
        setUser(sessionData.session.user);
        await checkIfAdmin(sessionData.session.user.id);
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
      await fetchFournisseurs();
    };

    initialize();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await checkIfAdmin(session.user.id);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
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
      
      await fetchFournisseurs();
      setShowForm(false);
      setFormData({
        id: null,
        nom: "",
        adresse: "",
        email: "",
        telephone: "",
        site_web: "",
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout du fournisseur", error);
    }
  };

  const updateFournisseur = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.id) throw new Error("ID du fournisseur manquant");

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
      
      await fetchFournisseurs();
      setShowForm(false);
      setFormData({
        id: null,
        nom: "",
        adresse: "",
        email: "",
        telephone: "",
        site_web: "",
      });
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
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce fournisseur ?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("fournisseur")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      await fetchFournisseurs();
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
            <div className="flex justify-center items-center h-64">
              <p className="text-xl">Chargement...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-auto w-full bg-gray-800 text-white border border-gray-600">
                <thead>
                  <tr>
                    <th className="px-6 py-3 border-b border-gray-300">Nom</th>
                    <th className="px-6 py-3 border-b border-gray-300">Adresse</th>
                    <th className="px-6 py-3 border-b border-gray-300">Email</th>
                    <th className="px-6 py-3 border-b border-gray-300">Téléphone</th>
                    <th className="px-6 py-3 border-b border-gray-300">Site Web</th>
                    {isAdmin && (
                      <th className="px-6 py-3 border-b border-gray-300">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {fournisseurs.map((fournisseur) => (
                    <tr key={fournisseur.id} className="hover:bg-gray-700">
                      <td className="px-6 py-3 border-b border-gray-600">{fournisseur.nom}</td>
                      <td className="px-6 py-3 border-b border-gray-600">{fournisseur.adresse}</td>
                      <td className="px-6 py-3 border-b border-gray-600">
                        <a href={`mailto:${fournisseur.email}`} className="text-blue-400 hover:text-blue-300">
                          {fournisseur.email}
                        </a>
                      </td>
                      <td className="px-6 py-3 border-b border-gray-600">
                        <a href={`tel:${fournisseur.telephone}`} className="text-blue-400 hover:text-blue-300">
                          {fournisseur.telephone}
                        </a>
                      </td>
                      <td className="px-6 py-3 border-b border-gray-600">
                        <a href={fournisseur.site_web} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                          {fournisseur.site_web}
                        </a>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-3 border-b border-gray-600">
                          <div className="flex gap-2">
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
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default FournisseursPage;