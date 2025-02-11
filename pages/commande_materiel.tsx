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
      await fetchStockMaterials();
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

  const fetchStockMaterials = async () => {
    const { data, error } = await supabase
      .from("stock_materiel")
      .select("materiel_id, quantite, materiels(id_materiel, nom, description)")
      .order("materiel_id", { ascending: true });

    if (error) {
      console.error("❌ Erreur Supabase:", error);
      return;
    }

    if (data && data.length > 0) {
      const formattedData: Materiel[] = data.map(item => {
        const materielInfo = Array.isArray(item.materiels) ? item.materiels[0] : item.materiels;
        return {
          materiel_id: item.materiel_id,
          quantite: item.quantite,
          nom: materielInfo?.nom || "Nom inconnu",
          description: materielInfo?.description || "Pas de description"
        };
      });
      setStockMaterials(formattedData);
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
            .from('stock_materiel')
            .update({ quantite: newQuantity })
            .eq('materiel_id', item.materielId);
        }
      });

      await Promise.all(updateStockPromises);

      alert("Commande passée avec succès !");
      setCart([]);
      fetchStockMaterials();
    } catch (error) {
      console.error("Erreur lors de la commande:", error);
      alert(error instanceof Error ? error.message : "Une erreur est survenue.");
    }
  };

  const addToCart = (item: CartItem) => {
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

  const updateOrderStatus = async (id_commande: number, newStatus: string) => {
    try {
      // Récupère les informations de la commande actuelle pour vérifier son état et les détails de la commande
      const { data: currentOrder, error: fetchError } = await supabase
        .from('commande_materiel')
        .select('id_stock_materiel, quantite, etat')
        .eq('id_commande', id_commande)
        .single();
  
      if (fetchError) {
        console.error('Erreur lors de la récupération de la commande:', fetchError);
        alert('Erreur lors de la récupération de la commande');
        return;
      }
  
      if (!currentOrder) {
        console.error('Commande introuvable');
        alert('Commande introuvable');
        return;
      }
  
      // Si l'état de la commande est déjà celui que l'on veut, on l'annule
      if (currentOrder.etat === newStatus) {
        alert(`La commande est déjà dans cet état (${newStatus}).`);
        return;
      }
  
      // Met à jour l'état de la commande dans la base de données
      const { error: updateError } = await supabase
        .from('commande_materiel')
        .update({ etat: newStatus })
        .eq('id_commande', id_commande);
  
      if (updateError) {
        console.error('Erreur lors de la mise à jour du statut:', updateError);
        alert('Erreur lors de la mise à jour du statut');
        return;
      }
  
      if (newStatus === 'acceptée') {
        // Mettre à jour le stock si la commande est acceptée
        await updateStockOnAccept(currentOrder.id_stock_materiel, currentOrder.quantite);
        alert('Commande acceptée et stock mis à jour avec succès.');
      } else if (newStatus === 'refusée') {
        // Remettre le stock à l'état précédent si la commande est refusée
        await restoreStockOnReject(currentOrder.id_stock_materiel, currentOrder.quantite);
        alert('Commande refusée et stock restauré.');
      }
  
      // Rafraîchit la liste des commandes pour que l'interface reflète les modifications
      fetchOrders();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue');
    }
  };
  
  const updateStockOnAccept = async (materielId: number, quantity: number) => {
    const { data: currentStock, error } = await supabase
      .from('stock_materiel')
      .select('quantite')
      .eq('materiel_id', materielId)
      .single();
  
    if (error) {
      console.error('Erreur lors de la récupération du stock:', error);
      alert('Erreur lors de la récupération du stock');
      return;
    }
  
    if (!currentStock) {
      alert('Stock introuvable');
      return;
    }
  
    const newQuantity = currentStock.quantite - quantity;
  
    if (newQuantity < 0) {
      alert('Stock insuffisant pour traiter la commande');
      return;
    }
  
    // Mise à jour du stock
    const { error: updateError } = await supabase
      .from('stock_materiel')
      .update({ quantite: newQuantity })
      .eq('materiel_id', materielId);
  
    if (updateError) {
      console.error('Erreur lors de la mise à jour du stock:', updateError);
      alert('Erreur lors de la mise à jour du stock');
    }
  };
  
  // Fonction pour restaurer le stock si la commande est refusée
  const restoreStockOnReject = async (materielId: number, quantity: number) => {
    const { data: currentStock, error } = await supabase
      .from('stock_materiel')
      .select('quantite')
      .eq('materiel_id', materielId)
      .single();
  
    if (error) {
      console.error('Erreur lors de la récupération du stock:', error);
      alert('Erreur lors de la récupération du stock');
      return;
    }
  
    if (!currentStock) {
      alert('Stock introuvable');
      return;
    }
  
    const newQuantity = currentStock.quantite + quantity;
  
    const { error: updateError } = await supabase
      .from('stock_materiel')
      .update({ quantite: newQuantity })
      .eq('materiel_id', materielId);
  
    if (updateError) {
      console.error('Erreur lors de la restauration du stock:', updateError);
      alert('Erreur lors de la restauration du stock');
    }
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
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg mt-4 hover:bg-blue-600"
                disabled={material.quantite === 0}
              >
                {material.quantite === 0 ? "Rupture de stock" : "Ajouter au panier"}
              </button>
            </div>
          ))
        ) : (
          <p className="text-white">❌ Aucun matériel disponible.</p>
        )}
      </div>
    );
  };

  return (
    <div className="relative flex h-screen bg-opacity-40 backdrop-blur-md">
      <Menubar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="w-full max-w-7xl mx-auto">
          {isAdmin ? renderAdminView() : renderCatalogue()}
        </div>
      </main>

      <div className="fixed top-4 right-4 z-10">
        <button
          className="relative p-3 bg-blue-500 rounded-full"
          onClick={() => setIsCartOpen(!isCartOpen)}
        >
          <ShoppingCart className="text-white" size={24} />
          {cart.length > 0 && (
            <span className="absolute top-0 right-0 text-white bg-red-600 rounded-full text-xs w-5 h-5 flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </button>

        <div className={`fixed top-0 right-0 w-96 bg-white shadow-xl transition-transform duration-500 ease-in-out ${isCartOpen ? 'transform translate-x-0' : 'transform translate-x-full'}`}>
          <div className="p-4 flex justify-between items-center">
            <h2 className="text-lg font-bold">Mon Panier</h2>
            <button onClick={() => setIsCartOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="p-4">
            {cart.length > 0 ? (
              <div>
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between items-center mb-4">
                    <p>{item.nom}</p>
                    <span>{item.quantity} x {item.nom}</span>
                    <button className="text-red-600" onClick={() => removeFromCart(item.materielId)}>
                      Supprimer
                    </button>
                  </div>
                ))}
                <button onClick={handleOrder} className="w-full bg-green-500 text-white py-2 rounded-lg mt-4">
                  Passer la commande
                </button>
              </div>
            ) : (
              <p>Votre panier est vide.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CataloguePage;
