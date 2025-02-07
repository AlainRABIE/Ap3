import React, { useState, useEffect } from "react";
import { createClient, User } from '@supabase/supabase-js';
import MenubarRe from '../components/ui/MenuBarRe';
import { ShoppingCart, X } from "lucide-react";
import { getUserRole } from './api/role';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Medicament {
  id_stock: number;
  medicament_id: number;
  quantite: number;
  nom: string;
  description: string;
}

interface CartItem {
  id_stock: number;
  medicament_id: number;
  quantity: number;
  nom: string;
}

interface Quantities {
  [key: number]: number;
}

interface Commande {
  id: number;
  id_user: string;
  id_stock_medicament: number;
  quantite: number;
  date_commande: string;
  etat: string;
}

const CommandeMedicaments = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quantities, setQuantities] = useState<Quantities>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stockMedicaments, setStockMedicaments] = useState<Medicament[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newCommande, setNewCommande] = useState<Partial<Commande>>({
    quantite: 0,
    etat: 'en attente'
  });

  useEffect(() => {
    const initialize = async () => {
      await checkSession();
      await fetchStockMedicaments();
      await fetchCommandes();
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
          await fetchCommandes();
        }
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

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
    }
  };

  const fetchStockMedicaments = async () => {
    const { data, error } = await supabase
      .from("stock_medicaments")
      .select(`
        id_stock,
        medicament_id,
        quantite,
        medicaments ( id, name, description )
      `)
      .order("id_stock", { ascending: true });

    if (error) {
      console.error("❌ Erreur Supabase:", error);
      return;
    }

    if (data && data.length > 0) {
      const formattedData: Medicament[] = data.map(item => {
        const medicamentInfo = Array.isArray(item.medicaments) ? item.medicaments[0] : item.medicaments;
        return {
          id_stock: item.id_stock,
          medicament_id: item.medicament_id,
          quantite: item.quantite,
          nom: medicamentInfo?.name || "Nom inconnu",
          description: medicamentInfo?.description || "Pas de description"
        };
      });

      setStockMedicaments(formattedData);
    } else {
      setStockMedicaments([]);
    }
  };

  const fetchCommandes = async () => {
    const { data, error } = await supabase
      .from("commande_médicaments")
      .select("*")
      .order("date_commande", { ascending: false });

    if (error) {
      console.error("❌ Erreur Supabase:", error);
      return;
    }

    console.log("Commandes récupérées:", data); // Vérifier les données retournées

    setCommandes(data || []);
  };


  const handleOrder = async () => {
    if (cart.length === 0) {
      alert("Votre panier est vide.");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("Utilisateur non connecté");
      }

      const userId = session.user.id;

      for (const item of cart) {
        const commandeData = {
          id_user: userId,
          id_stock_medicament: item.id_stock,
          quantite: item.quantity,
          date_commande: new Date().toISOString(),
          etat: 'en attente'
        };

        const { data: stockCheck, error: stockError } = await supabase
          .from('stock_medicaments')
          .select('id_stock, quantite')
          .eq('id_stock', commandeData.id_stock_medicament)
          .single();

        if (stockError || !stockCheck) {
          throw new Error("Stock introuvable");
        }

        if (stockCheck.quantite < commandeData.quantite) {
          throw new Error(`Stock insuffisant pour ${item.nom}`);
        }

        const { data: insertData, error: insertError } = await supabase
          .from('commande_médicaments')
          .insert(commandeData)
          .select();

        if (insertError) {
          throw new Error(`Erreur d'insertion: ${insertError.message}`);
        }

        const newQuantity = stockCheck.quantite - commandeData.quantite;
        const { error: updateError } = await supabase
          .from('stock_medicaments')
          .update({ quantite: newQuantity })
          .eq('id_stock', commandeData.id_stock_medicament);

        if (updateError) {
          throw new Error("Erreur lors de la mise à jour du stock");
        }
      }

      alert("Commande passée avec succès !");
      setCart([]);
      await fetchStockMedicaments();
      await fetchCommandes();

    } catch (error) {
      alert(error instanceof Error ? error.message : "Une erreur est survenue");
    }
  };

  const addToCart = (item: CartItem) => {
    setCart(prevCart => [...prevCart, item]);
  };

  const handleQuantityChange = (medicament_id: number, quantity: string) => {
    setQuantities(prev => ({
      ...prev,
      [medicament_id]: Math.max(1, Math.min(Number(quantity), 100)),
    }));
  };

  const removeFromCart = (medicament_id: number) => {
    setCart(prevCart => prevCart.filter(item => item.medicament_id !== medicament_id));
  };

  const handleAddCommande = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('commande_médicaments')
      .insert([{
        id_user: user.id,
        id_stock_medicament: newCommande.id_stock_medicament,
        quantite: newCommande.quantite,
        etat: 'en attente',
        date_commande: new Date().toISOString()
      }]);


    if (!error) {
      setShowModal(false);
      setNewCommande({ quantite: 0, etat: 'en attente' });
      await fetchCommandes();
    }
  };
  const handleUpdateState = async (id_commande: number, nouvelEtat: string) => {
  if (!id_commande) {
    console.error("ID de commande manquant");
    alert("Erreur: ID de commande manquant");
    return;
  }

  // Vérifie si le nouvel état est valide
  if (!nouvelEtat) {
    console.error("Nouvel état manquant");
    alert("Erreur: Nouvel état manquant");
    return;
  }

  try {
    // Mise à jour de l'état de la commande en utilisant 'id_commande' comme clé
    const { data, error } = await supabase
      .from('commande_medicaments')
      .update({ etat: nouvelEtat })
      .eq('id_commande', id_commande);  // Utiliser 'id_commande' au lieu de 'id'

    if (error) {
      console.error("Erreur lors de la mise à jour de l'état:", error);
      alert(`Erreur lors de la mise à jour de l'état: ${error.message}`);
      return;
    }

    // Si la mise à jour est réussie, affiche les données retournées
    console.log("Commande mise à jour:", data);

    // Rafraîchir la liste des commandes après mise à jour
    await fetchCommandes();
  } catch (error: unknown) {
    // Vérifie si l'erreur est une instance d'Error
    if (error instanceof Error) {
      console.error("Erreur interne lors de la mise à jour de l'état:", error.message);
      alert(`Erreur interne: ${error.message}`);
    } else {
      console.error("Erreur inconnue:", error);
      alert("Une erreur inconnue est survenue.");
    }
  }
};



  return (
    <div className="relative flex h-screen bg-opacity-40 backdrop-blur-md">
      <MenubarRe />
      <main className="flex-1 p-8 overflow-auto">
        <div className="w-full max-w-7xl mx-auto">
          {isAdmin ? (
            <div>
              <h1 className="text-2xl font-bold text-white">Liste des Commandes</h1>
              <div className="grid grid-cols-1 gap-6 mt-4">
                {commandes.map((commande) => {
                  console.log("Commande ID:", commande.id);  // Vérifier si chaque commande a un ID
                  return (
                    <div key={commande.id} className="bg-white rounded-lg shadow-lg p-6">
                      <h2 className="text-xl font-bold mb-2">Commande #{commande.id}</h2>
                      <p className="text-sm text-gray-700 mb-4">Utilisateur: {commande.id_user}</p>
                      <p className="text-sm text-gray-700 mb-4">ID Stock Médicament: {commande.id_stock_medicament}</p>
                      <p className="text-sm text-gray-700 mb-4">Quantité: {commande.quantite}</p>
                      <p className="text-sm text-gray-700 mb-4">Date de commande: {new Date(commande.date_commande).toLocaleString()}</p>
                      <p className="text-sm text-gray-700 mb-4">État: {commande.etat}</p>
                      {isAdmin && (
                        <div className="flex space-x-2">
                          <button
                            className="bg-green-500 text-white px-3 py-1 rounded"
                            onClick={() => handleUpdateState(commande.id, 'acceptée')}
                          >
                            Accepter
                          </button>
                          <button
                            className="bg-red-500 text-white px-3 py-1 rounded"
                            onClick={() => handleUpdateState(commande.id, 'refusée')}
                          >
                            Refuser
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}


              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-white">Catalogue des Médicaments</h1>
                <div className="relative">
                  <button
                    onClick={() => setIsCartOpen(!isCartOpen)}
                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>{cart.length} articles</span>
                  </button>
                  {isCartOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg p-4 rounded-lg">
                      <h2 className="text-lg font-bold">Panier</h2>
                      {cart.map((item) => (
                        <div key={item.medicament_id} className="border-b py-2 flex justify-between items-center">
                          <p>{item.nom} x {item.quantity}</p>
                          <button
                            onClick={() => removeFromCart(item.medicament_id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={handleOrder}
                        className="w-full bg-green-500 text-white px-4 py-2 rounded-lg mt-4 hover:bg-green-600"
                      >
                        Commander
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {stockMedicaments.length > 0 ? (
                  stockMedicaments.map((medicament) => (
                    <div key={medicament.id_stock} className="bg-white rounded-lg shadow-lg p-6">
                      <h2 className="text-xl font-bold mb-2">{medicament.nom}</h2>
                      {medicament.description && (
                        <div className="text-sm text-gray-600 mb-4">{medicament.description}</div>
                      )}
                      <div className="text-sm text-gray-700 mb-4">
                        Quantité disponible: {medicament.quantite}
                      </div>
                      <input
                        type="number"
                        min="1"
                        max={medicament.quantite}
                        value={quantities[medicament.medicament_id] || 1}
                        onChange={(e) => handleQuantityChange(medicament.medicament_id, e.target.value)}
                        className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <button
                        onClick={() => addToCart({
                          id_stock: medicament.id_stock,
                          medicament_id: medicament.medicament_id,
                          nom: medicament.nom,
                          quantity: quantities[medicament.medicament_id] || 1
                        })}
                        className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg mt-4 hover:bg-blue-600"
                        disabled={medicament.quantite === 0}
                      >
                        {medicament.quantite === 0 ? "Rupture de stock" : "Ajouter au panier"}
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-white">❌ Aucun médicament disponible.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Nouvelle Commande</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ID Stock Médicament</label>
                <input
                  type="text"
                  value={newCommande.id_stock_medicament || ''}
                  onChange={(e) => setNewCommande({ ...newCommande, id_stock_medicament: parseInt(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantité</label>
                <input
                  type="number"
                  value={newCommande.quantite || ''}
                  onChange={(e) => setNewCommande({ ...newCommande, quantite: parseInt(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddCommande}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Commander
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommandeMedicaments;
