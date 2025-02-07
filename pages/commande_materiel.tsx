import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import MenubarRe from "../components/ui/MenuBarRe";
import { ShoppingCart, X } from "lucide-react";
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
  const [orders, setOrders] = useState<any[]>([]);  // Ajouter un état pour les commandes

  useEffect(() => {
    const initialize = async () => {
      await checkSession();
      await fetchStockMaterials();
      if (isAdmin) {
        await fetchOrders();  // Si l'utilisateur est Admin, on récupère les commandes
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

  // Fonction pour récupérer les commandes si l'utilisateur est Admin
  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('commande_materiel')
      .select('id_stock_materiel, quantite, date_commande, etat')
      .order('date_commande', { ascending: false });

    if (error) {
      console.error("❌ Erreur lors de la récupération des commandes:", error);
      return;
    }

    setOrders(data || []);
  };

  // Fonction pour vérifier la session et récupérer le rôle
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

  // Fonction pour récupérer les matériaux du stock
  const fetchStockMaterials = async () => {
    const { data, error } = await supabase
      .from("stock_materiel")
      .select(`
        materiel_id,
        quantite,
        materiels: materiels ( id_materiel, nom, description )
      `)
      .order("materiel_id", { ascending: true });

    console.log("🔍 Résultat Supabase stock_materiel:", data, error);

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

      console.log("✅ Matériaux formatés SANS DOUBLONS:", formattedData);
      setStockMaterials(formattedData);
    } else {
      console.warn("⚠️ Aucune donnée reçue de Supabase.");
      setStockMaterials([]);
    }
  };

  // Fonction pour passer la commande
  const handleOrder = async () => {
    if (cart.length === 0) {
      alert("Votre panier est vide.");
      return;
    }

    try {
      const commandePromises = cart.map(async (item) => {
        await supabase.from('commande_materiel').insert({
          id_stock_materiel: item.materielId,
          quantite: item.quantity,
          date_commande: new Date().toISOString(),
          etat: 'en attente'
        });
      });

      await Promise.all(commandePromises);

      // Mise à jour du stock
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
      setCart([]); // Vide le panier après la commande
      fetchStockMaterials(); // Recharge les matériaux
    } catch (error) {
      console.error("Erreur lors de la commande:", error);
      alert(error instanceof Error ? error.message : "Une erreur est survenue.");
    }
  };

  // Ajouter un article au panier
  const addToCart = (item: CartItem) => {
    setCart(prevCart => [...prevCart, item]);
  };

  // Modifier la quantité d'un matériel
  const handleQuantityChange = (materielId: number, quantity: string) => {
    setQuantities(prev => ({
      ...prev,
      [materielId]: Math.max(1, Math.min(Number(quantity), 100)),
    }));
  };

  // Retirer un article du panier
  const removeFromCart = (materielId: number) => {
    setCart(prevCart => prevCart.filter(item => item.materielId !== materielId));
  };

  // Masquer ou afficher les sections selon le rôle
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
      <MenubarRe />
      <main className="flex-1 p-8 overflow-auto">
        <div className="w-full max-w-7xl mx-auto">
          {isAdmin ? renderAdminView() : renderCatalogue()}
        </div>
      </main>
    </div>
  );
};

export default CataloguePage;
