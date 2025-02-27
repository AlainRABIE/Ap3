import React, { useState, useEffect, useCallback } from "react";
import { createClient, User } from '@supabase/supabase-js';
import MenubarRe from '../components/ui/MenuBarRe';
import { getUserRole } from './api/role';
import jsPDF from 'jspdf';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Commande {
  id_commande: number;
  id_user: string;
  id_medicament: number;
  quantite: number;
  date_commande: string;
  etat: string;
  medicaments?: {
    id: number;
    name: string;
  };
}

const MesCommandes = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('en attente');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const checkSession = useCallback(async () => {
    try {
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
          setIsAdmin(role === "administrateur");
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error("Erreur lors de la vérification de la session:", err);
      return false;
    }
  }, []);

  const fetchCommandes = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }

      console.log(`Fetching commandes with filter: ${filter}`);
    
      const { data, error } = await supabase
        .from("commande_médicaments")
        .select(`
          *,
          medicaments:id_medicament(id, name)
        `)
        .eq('etat', filter)
        .order("date_commande", { ascending: false });
    
      if (error) {
        console.error("❌ Erreur lors de la récupération des commandes:", error);
        setError(error.message);
        setLoading(false);
        return;
      }
    
      console.log("Commandes récupérées:", data);
      setCommandes(data || []);
      setLoading(false);
    } catch (err) {
      console.error("Erreur lors de la récupération des commandes:", err);
      setError("Une erreur est survenue lors du chargement des commandes.");
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const initialize = async () => {
      const sessionValid = await checkSession();
      if (sessionValid) {
        await fetchCommandes();
      } else {
        setLoading(false);
      }
    };
    
    initialize();
  }, []); 

  useEffect(() => {
    if (user) {
      fetchCommandes();
    }
  }, [filter, fetchCommandes, user]);

  useEffect(() => {
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
          setIsAdmin(role === "administrateur");
          await fetchCommandes();
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        setCommandes([]);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [fetchCommandes, checkSession]);

  const handleUpdateState = async (id_commande: number, nouvelEtat: string) => {
    if (!id_commande) {
      console.error("ID de commande manquant");
      alert("Erreur: ID de commande manquant");
      return;
    }

    try {
      const { data: commandeData, error: commandeError } = await supabase
        .from('commande_médicaments')
        .select('*')
        .eq('id_commande', id_commande)
        .single();

      if (commandeError || !commandeData) {
        throw new Error("Erreur lors de la récupération de la commande");
      }

      if (!commandeData.id_medicament) {
        throw new Error("ID du médicament manquant ou invalide");
      }

      const { data, error } = await supabase
        .from('commande_médicaments')
        .update({ etat: nouvelEtat })
        .eq('id_commande', id_commande)
        .select();

      if (error) {
        throw new Error(`Erreur lors de la mise à jour de l'état: ${error.message}`);
      }

      const adjustStock = async (adjustment: number) => {
        const { data: stockData, error: stockError } = await supabase
          .from('medicaments')
          .select('quantite')
          .eq('id', commandeData.id_medicament)
          .single();

        if (stockError || !stockData) {
          throw new Error("Erreur lors de la récupération du stock");
        }

        const newQuantity = stockData.quantite + adjustment;

        const { error: updateError } = await supabase
          .from('medicaments')
          .update({ quantite: newQuantity })
          .eq('id', commandeData.id_medicament);

        if (updateError) {
          throw new Error("Erreur lors de la mise à jour du stock");
        }
      };

      if (nouvelEtat === 'acceptée') {
        await adjustStock(-commandeData.quantite);
      } else if (nouvelEtat === 'refusée') {
        await adjustStock(commandeData.quantite);
      }

      console.log("Commande mise à jour:", data);
      await fetchCommandes();

    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Erreur interne:", error.message);
        alert(`Erreur: ${error.message}`);
      } else {
        console.error("Erreur inconnue:", error);
        alert("Une erreur inconnue est survenue.");
      }
    }
  };

  const handleDownloadPDF = (commande: Commande) => {
    const doc = new jsPDF();
    doc.text(`Commande #${commande.id_commande}`, 10, 10);
    doc.text(`Médicament: ${commande.medicaments?.name || "Nom non disponible"}`, 10, 20);
    doc.text(`Quantité: ${commande.quantite}`, 10, 30);
    doc.text(`Date de commande: ${new Date(commande.date_commande).toLocaleString()}`, 10, 40);
    doc.text(`État: ${commande.etat}`, 10, 50);
    doc.save(`commande_${commande.id_commande}.pdf`);
  };

  const filteredCommandes = commandes.filter((commande) =>
    commande.id_commande.toString().includes(search)
  );

  return (
    <div className="relative flex h-screen bg-opacity-40 backdrop-blur-md">
      <MenubarRe />
      <main className="flex-1 p-8 overflow-auto">
        <div className="w-full max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-8">
            {isAdmin ? "Liste des Commandes" : "Mes Commandes De Médicaments"}
          </h1>
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex space-x-4 mb-4">
            <button
              className={`px-4 py-2 rounded ${filter === 'en attente' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setFilter('en attente')}
            >
              En attente
            </button>
            <button
              className={`px-4 py-2 rounded ${filter === 'acceptée' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setFilter('acceptée')}
            >
              Acceptée
            </button>
            <button
              className={`px-4 py-2 rounded ${filter === 'refusée' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setFilter('refusée')}
            >
              Refusée
            </button>
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Rechercher par numéro de commande"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 rounded w-full"
            />
          </div>
          
          {loading ? (
            <div className="text-white text-center py-8">Chargement des commandes...</div>
          ) : filteredCommandes.length === 0 ? (
            <div className="text-white text-center py-8">Aucune commande {filter} trouvée</div>
          ) : (
            <div className="grid grid-cols-1 gap-6 mt-4">
              {filteredCommandes.map((commande) => (
                <div key={commande.id_commande} className="bg-transparent border border-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-bold mb-2 text-white">
                    Commande #{commande.id_commande}
                  </h2>
                  <p className="text-sm text-white mb-4">
                    Médicament: {commande.medicaments?.name || "Nom non disponible"}
                  </p>
                  <p className="text-sm text-white mb-4">
                    Quantité: {commande.quantite}
                  </p>
                  <p className="text-sm text-white mb-4">
                    Date de commande: {new Date(commande.date_commande).toLocaleString()}
                  </p>
                  <p className="text-sm text-white mb-4">
                    État: {commande.etat}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                      onClick={() => handleDownloadPDF(commande)}
                    >
                      Télécharger PDF
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          className="bg-green-500 text-white px-3 py-1 rounded"
                          onClick={() => handleUpdateState(commande.id_commande, 'acceptée')}
                        >
                          Accepter
                        </button>
                        <button
                          className="bg-red-500 text-white px-3 py-1 rounded"
                          onClick={() => handleUpdateState(commande.id_commande, 'refusée')}
                        >
                          Refuser
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MesCommandes;