import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { getUserRole } from "./api/role";
import MenubarRe from "../components/ui/MenuBarRe";

type Fournisseur = {
  fournisseur_id: number;
  medicament_id: number;
  nom: string;
  adresse: string;
  email: string;
  telephone: string;
  site_web: string;
};

const fetchFournisseurs = async (): Promise<Fournisseur[]> => {
  const { data, error } = await supabase
    .from("fournisseur_medicament")
    .select("*");

  if (error) {
    console.error("Erreur lors de la récupération des fournisseurs :", error.message);
    return [];
  }

  return data || [];
};

const addFournisseur = async (fournisseur: Omit<Fournisseur, 'fournisseur_id'>) => {
  const { data, error } = await supabase
    .from("fournisseur_medicament")
    .insert([fournisseur]);

  if (error) {
    console.error("Erreur lors de l'ajout du fournisseur :", error.message);
    return null;
  }
  return data;
};


const updateFournisseur = async (id: number, updatedFournisseur: Partial<Fournisseur>) => {
  const { data, error } = await supabase
    .from("fournisseur_medicament")
    .update(updatedFournisseur)
    .eq("fournisseur_id", id);

  if (error) {
    console.error("Erreur lors de la mise à jour du fournisseur :", error.message);
    return null;
  }
  return data;
};

const deleteFournisseur = async (id: number) => {
  const { data, error } = await supabase
    .from("fournisseur_medicament")
    .delete()
    .eq("fournisseur_id", id);

  if (error) {
    console.error("Erreur lors de la suppression du fournisseur :", error.message);
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
  const [showModal, setShowModal] = useState(false);
  const [newFournisseur, setNewFournisseur] = useState<Fournisseur>({
    fournisseur_id: 0,
    medicament_id: 0,
    nom: "",
    adresse: "",
    email: "",
    telephone: "",
    site_web: "",
  });

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
      setFournisseurs(fournisseurs.filter(fournisseur => fournisseur.fournisseur_id !== id));
    }
  };

  const handleUpdate = async (id: number, updatedFournisseur: Partial<Fournisseur>) => {
    const updatedData = await updateFournisseur(id, updatedFournisseur);
    if (updatedData) {
      setFournisseurs(fournisseurs.map(fournisseur => fournisseur.fournisseur_id === id ? { ...fournisseur, ...updatedFournisseur } : fournisseur));
      setEditingFournisseur(null);
    }
  };

  const handleAddFournisseur = async () => {
    const addedFournisseur = await addFournisseur(newFournisseur);
    if (addedFournisseur) {
      setFournisseurs((prevFournisseurs) => [
        ...prevFournisseurs,
        ...addedFournisseur,  // Assurez-vous de déstructurer la réponse si nécessaire
      ]);
      setShowModal(false);
      setNewFournisseur({
        fournisseur_id: 0,
        medicament_id: 0,
        nom: "",
        adresse: "",
        email: "",
        telephone: "",
        site_web: "",
      });
    }
  };
  

  return (
    <div className="relative flex h-screen bg-black bg-opacity-40 backdrop-blur-md-opacity-40 backdrop-blur-md">
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
              <button
                className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
                onClick={() => setShowModal(true)}
              >
                Ajouter un fournisseur
              </button>
            )}
            <ul>
              {fournisseurs.map((fournisseur) => (
                <li key={fournisseur.fournisseur_id} className="text-white mb-4">
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
                          onClick={() => handleDelete(fournisseur.fournisseur_id)}
                        >
                          Supprimer
                        </button>
                        <button
                          className="px-4 py-2 bg-yellow-500 text-white rounded"
                          onClick={() => handleUpdate(fournisseur.fournisseur_id, { nom: "Updated Name" })}
                        >
                          Modifier
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Modal pour ajouter un fournisseur */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Ajouter un fournisseur</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <input
                    type="text"
                    value={newFournisseur.nom}
                    onChange={(e) => setNewFournisseur({ ...newFournisseur, nom: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Adresse</label>
                  <input
                    type="text"
                    value={newFournisseur.adresse}
                    onChange={(e) => setNewFournisseur({ ...newFournisseur, adresse: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={newFournisseur.email}
                    onChange={(e) => setNewFournisseur({ ...newFournisseur, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                  <input
                    type="text"
                    value={newFournisseur.telephone}
                    onChange={(e) => setNewFournisseur({ ...newFournisseur, telephone: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Site web</label>
                  <input
                    type="text"
                    value={newFournisseur.site_web}
                    onChange={(e) => setNewFournisseur({ ...newFournisseur, site_web: e.target.value })}
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
                    onClick={handleAddFournisseur}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Ajouter
                  </button>

                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Fournisseur;
