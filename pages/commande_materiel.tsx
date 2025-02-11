import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Menubar from "../components/ui/MenuBarRe";
import { ShoppingCart, X } from 'lucide-react';
import { getUserRole } from './api/role';

interface Materiel {
  materiel_id: number;
  quantite: number;
  nom: string;
  description: string;
}

interface CartItem {
  materielId: number;
  quantity: number;
  nom: string;
}

interface Quantities {
  [key: number]: number;
}

interface User {
  id: string;
  email: string;
}

const CataloguePage = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quantities, setQuantities] = useState<Quantities>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [stockMaterials, setStockMaterials] = useState<Materiel[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const initialize = async () => {
      await checkSession();
      await fetchMateriels();  // Utiliser fetchMateriels au lieu de fetchStockMaterials
      if (isAdmin) {
        await fetchOrders();
      }
    };
    initialize();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
        });

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
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [isAdmin]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('commande_materiel')
      .select('id_commande, id_stock_materiel, quantite, date_commande, etat')
      .order('date_commande', { ascending: false });

    if (error) {
      console.error("❌ Erreur lors de la récupération des commandes:", error);
      return;
    }

    setOrders(data || []);
  };

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email || "",
      });

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

  // Modification ici pour interroger la table "materiels" au lieu de "stock_materiel"
  const fetchMateriels = async () => {
    const { data, error } = await supabase
      .from("materiels")  // Changement de 'stock_materiel' à 'materiels'
      .select("id_materiel, nom, description, quantite") // Sélectionner les colonnes adéquates
      .order("id_materiel", { ascending: true });

    if (error) {
      console.error("❌ Erreur Supabase:", error);
      return;
    }

    if (data && data.length > 0) {
      const formattedData: Materiel[] = data.map(item => ({
        materiel_id: item.id_materiel,
        quantite: item.quantite,
        nom: item.nom || "Nom inconnu",
        description: item.description || "Pas de description",
      }));
      setStockMaterials(formattedData);  // Mettre à jour l'état avec les nouveaux matériaux
    }
  };
  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const { data, error } = await supabase
        .from('commande_materiel')
        .update({ etat: newStatus })
        .eq('id_commande', orderId);

      if (error) {
        throw error;
      }

      // Re-fetch orders after updating the status
      fetchOrders();

      alert(`La commande a été ${newStatus === 'acceptée' ? 'acceptée' : 'refusée'}.`);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'état de la commande:", error);
      alert("Une erreur est survenue lors de la mise à jour de la commande.");
    }
  };

  const handleOrder = async () => {
    if (cart.length === 0) {
      alert("Votre panier est vide.");
      return;
    }

    try {
      const { data: userData } = await supabase
        .from('User')
        .select('id')
        .eq('email', user?.email)
        .single();

      if (!userData) {
        alert("Utilisateur non trouvé.");
        return;
      }

      const commandePromises = cart.map(async (item) => {
        await supabase.from('commande_materiel').insert({
          id_user: userData.id,
          id_stock_materiel: item.materielId,
          quantite: item.quantity,
          etat: 'en attente',
        });
      });

      await Promise.all(commandePromises);

      const updateStockPromises = cart.map(async (item) => {
        const currentStock = stockMaterials.find(
          (material) => material.materiel_id === item.materielId
        );

        if (currentStock) {
          const newQuantity = currentStock.quantite - item.quantity;

          if (newQuantity < 0) {
            throw new Error(`Stock insuffisant pour ${item.nom}`);
          }

          await supabase
            .from('materiels')  // Mise à jour dans la table 'materiels'
            .update({ quantite: newQuantity })
            .eq('id_materiel', item.materielId);
        }
      });

      await Promise.all(updateStockPromises);

      alert("Commande passée avec succès !");
      setCart([]);
      fetchMateriels();  // Recharger les données de la table 'materiels'
    } catch (error) {
      console.error("Erreur lors de la commande:", error);
      alert(error instanceof Error ? error.message : "Une erreur est survenue.");
    }
  };

  const addToCart = (item: CartItem) => {
    const material = stockMaterials.find(material => material.materiel_id === item.materielId);
  
    if (material && item.quantity > material.quantite) {
      alert(`La quantité demandée pour ${item.nom} dépasse le stock disponible.`);
      return;
    }
  
    setCart(prevCart => [...prevCart, item]);
  };
  

  const handleQuantityChange = (materielId: number, quantity: string) => {
    setQuantities(prev => ({
      ...prev,
      [materielId]: Math.max(1, Math.min(Number(quantity), 100)),
    }));
  };

  const removeFromCart = (materielId: number) => {
    setCart(prevCart => prevCart.filter(item => item.materielId !== materielId));
  };

  const renderAdminView = () => {
    return (
      <div className="bg-transparent border border-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-white">Commandes</h2>
        {orders.length > 0 ? (
          <div>
            {orders.map((order, index) => (
              <div key={index} className="border-b py-4">
                <p className="text-white"><strong>Quantité:</strong> {order.quantite}</p>
                <p className="text-white"><strong>Date:</strong> {new Date(order.date_commande).toLocaleDateString()}</p>
                <p className="text-white"><strong>État:</strong> {order.etat}</p>
                <button onClick={() => updateOrderStatus(order.id_commande, 'acceptée')} className="bg-green-500 text-white px-4 py-2 rounded-lg mt-4 hover:bg-green-600">Accepter</button>
                <button onClick={() => updateOrderStatus(order.id_commande, 'refusée')} className="bg-red-500 text-white px-4 py-2 rounded-lg mt-4 hover:bg-red-600 ml-2">Refuser</button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white">Aucune commande en attente.</p>
        )}
      </div>
    );
  };

  const renderCatalogue = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {stockMaterials.length > 0 ? (
          stockMaterials.map((material) => (
            <div key={material.materiel_id} className="bg-transparent border border-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-2 text-white">{material.nom}</h2>
              {material.description && (
                <div className="text-sm text-gray-300 mb-4">{material.description}</div>
              )}
              <div className="text-sm text-gray-300 mb-4">
                Quantité disponible: {material.quantite}
              </div>
              <input
                type="number"
                min="1"
                max={material.quantite}
                value={quantities[material.materiel_id] || 1}
                onChange={(e) => handleQuantityChange(material.materiel_id, e.target.value)}
                className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={() => addToCart({
                  materielId: material.materiel_id,
                  nom: material.nom,
                  quantity: quantities[material.materiel_id] || 1
                })}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4 hover:bg-blue-600 w-full"
              >
                Ajouter au panier
              </button>
            </div>
          ))
        ) : (
          <p className="text-white">Chargement des matériaux...</p>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      <Menubar />
      <div className="max-w-7xl mx-auto py-8 px-6">
        <h1 className="text-3xl font-bold text-white mb-6">Catalogue</h1>
        {isAdmin ? renderAdminView() : renderCatalogue()}
      </div>
    </div>
  );
};

export default CataloguePage;
