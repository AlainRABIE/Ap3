import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { getUserRole } from "./api/role";
import MenubarRe from "../components/ui/MenuBarRe";

type Fournisseur = {
  id: number;
  nom: string;
  adresse: string;
  email: string;
  telephone: string;
  site_web: string;
};

const fetchFournisseurs = async (): Promise<Fournisseur[]> => {
  const { data, error } = await supabase.from("fournisseur").select("*");
  if (error) {
    console.error("Erreur lors de la récupération des fournisseurs :", error.message);
    return [];
  }
  return data || [];
};

const deleteFournisseur = async (id: number) => {
  const { data, error } = await supabase.from("fournisseur").delete().eq("id", id);
  if (error) {
    console.error("Erreur lors de la suppression du fournisseur :", error.message);
    return null;
  }
  return data;
};

const updateFournisseur = async (id: number, fournisseur: Partial<Fournisseur>) => {
  const { data, error } = await supabase.from("fournisseur").update(fournisseur).eq("id", id);
  if (error) {
    console.error("Erreur lors de la mise à jour du fournisseur :", error.message);
    return null;
  }
  return data;
};

const Fournisseur = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingFournisseur, setEditingFournisseur] = useState<Fournisseur | null>(null);

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
      const fetchedFournisseurs = await fetchFournisseurs();
      setFournisseurs(fetchedFournisseurs);
      setIsLoading(false);
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

  const handleDelete = async (id: number) => {
    const result = await deleteFournisseur(id);
    if (result) {
      setFournisseurs(fournisseurs.filter(fournisseur => fournisseur.id !== id));
    }
  };

  const handleUpdate = async (id: number, updatedFournisseur: Partial<Fournisseur>) => {
    console.log("Updating fournisseur with id:", id, "and data:", updatedFournisseur);
    const updatedData = await updateFournisseur(id, updatedFournisseur);
    if (updatedData) {
      setFournisseurs(fournisseurs.map(fournisseur => fournisseur.id === id ? { ...fournisseur, ...updatedFournisseur } : fournisseur));
      setEditingFournisseur(null);
    }
  };

  const handleEditClick = (fournisseur: Fournisseur) => {
    setEditingFournisseur(fournisseur);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingFournisseur) {
      setEditingFournisseur({
        ...editingFournisseur,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFournisseur) {
      await handleUpdate(editingFournisseur.id, editingFournisseur);
    }
  };

  return (
    <div className="relative flex h-screen bg-opacity-40 backdrop-blur-md">
      <div className="animated-background"></div>
      <div className="waves"></div>

      <MenubarRe />

      <div className="content">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div>
            <h1 className="text-white text-xl mb-4">Liste des Fournisseurs</h1>
            {isAdmin && (
              <button className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">
                Ajouter un fournisseur
              </button>
            )}
            <ul>
              {fournisseurs.map((fournisseur) => (
                <li key={fournisseur.id} className="text-white mb-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h2 className="text-lg font-bold">{fournisseur.nom}</h2>
                    <p><strong>Adresse:</strong> {fournisseur.adresse}</p>
                    <p><strong>Email:</strong> {fournisseur.email}</p>
                    <p><strong>Téléphone:</strong> {fournisseur.telephone}</p>
                    <p><strong>Site web:</strong> {fournisseur.site_web}</p>
                    {isAdmin && (
                      <div className="mt-4">
                        <button
                          className="mr-2 px-4 py-2 bg-red-500 text-white rounded"
                          onClick={() => handleDelete(fournisseur.id)}
                        >
                          Supprimer
                        </button>
                        <button
                          className="px-4 py-2 bg-yellow-500 text-white rounded"
                          onClick={() => handleEditClick(fournisseur)}
                        >
                          Modifier
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {editingFournisseur && (
              <form onSubmit={handleFormSubmit} className="bg-gray-700 p-4 rounded-lg mt-4">
                <h2 className="text-lg font-bold text-white mb-4">Modifier Fournisseur</h2>
                <div className="mb-4">
                  <label className="block text-white mb-2">Nom</label>
                  <input
                    type="text"
                    name="nom"
                    value={editingFournisseur.nom}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-white mb-2">Adresse</label>
                  <input
                    type="text"
                    name="adresse"
                    value={editingFournisseur.adresse}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-white mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editingFournisseur.email}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-white mb-2">Téléphone</label>
                  <input
                    type="text"
                    name="telephone"
                    value={editingFournisseur.telephone}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-white mb-2">Site web</label>
                  <input
                    type="text"
                    name="site_web"
                    value={editingFournisseur.site_web}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2"
                  />
                </div>
                <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded">
                  Enregistrer
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Fournisseur;