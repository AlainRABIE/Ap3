import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import MenubarRe from '../components/ui/MenuBarRe';

const FournisseurPage = () => {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [fournisseurs, setFournisseurs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFournisseurs = async () => {
    const { data, error } = await supabase.from('fournisseurs').select('*');
    if (error) {
      console.error('Erreur lors de la récupération des fournisseurs', error);
      return [];
    }
    return data;
  };

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const userRole = await getUserRole(session.user.id);
        setUserRole(userRole);
        setIsAdmin(userRole === 'admin');
      } else {
        setUser(null);
        setUserRole(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de la session", error);
      setUser(null);
      setUserRole(null);
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
        const userRole = await getUserRole(session.user.id); // Passer l'ID de l'utilisateur en string
        setUserRole(userRole);
        setIsAdmin(userRole === 'admin');
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
      <main className="main-content flex-1 p-8 overflow-auto">
        <h1 className="text-4xl font-bold mb-6 text-white">Liste des Fournisseurs</h1>
        {isLoading ? (
          <p className="text-white">Chargement...</p>
        ) : (
          <table className="min-w-full table-auto mb-4">
            <thead>
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Nom</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Téléphone</th>
              </tr>
            </thead>
            <tbody>
              {fournisseurs.map((fournisseur) => (
                <tr key={fournisseur.id}>
                  <td className="px-4 py-2 border">{fournisseur.id}</td>
                  <td className="px-4 py-2 border">{fournisseur.nom}</td>
                  <td className="px-4 py-2 border">{fournisseur.email}</td>
                  <td className="px-4 py-2 border">{fournisseur.telephone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
};

export default FournisseurPage;