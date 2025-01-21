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
  medicament_id: number;
};

const fetchFournisseurs = async (): Promise<Fournisseur[]> => {
  const { data, error } = await supabase.from("fournisseur").select("*");
  if (error) {
    console.error("Erreur lors de la récupération des fournisseurs :", error.message);
    return [];
  }
  return data || [];
};

const Fournisseur = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      // Récupérer l'ID numérique de l'utilisateur depuis la table User
      const { data: userData } = await supabase
        .from('User')
        .select('id')
        .eq('email', session.user.email)
        .single();

      if (userData) {
        const role = await getUserRole(userData.id);
        setUserRole(role);
        setIsAdmin(role === "administrateur"); // Changé de "admin" à "administrateur"
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
        // Récupérer l'ID numérique de l'utilisateur depuis la table User
        const { data: userData } = await supabase
          .from('User')
          .select('id')
          .eq('email', session.user.email)
          .single();

        if (userData) {
          const role = await getUserRole(userData.id);
          setUserRole(role);
          setIsAdmin(role === "administrateur"); // Changé de "admin" à "administrateur"
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

  return (
    <div className="relative flex h-screen bg-gray-800">
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
                    <p><strong>Médicament ID:</strong> {fournisseur.medicament_id}</p>
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

export default Fournisseur;