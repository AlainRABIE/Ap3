import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import MenubarRe from "../components/ui/MenuBarRe";
import { ShoppingCart, X } from "lucide-react";

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
  const [stockMaterials, setStockMaterials] = useState<Materiel[]>([]);

  useEffect(() => {
    const initialize = async () => {
      await checkSession();
      await fetchStockMaterials();
    };
    initialize();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email || "",
      });
    }
  };
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
      // 🔥 Définir le type explicitement pour éviter le "never"
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
  
  const handleOrder = async () => {
    if (cart.length === 0) {
      alert("Votre panier est vide.");
      return;
    }
  
    try {
      // Insertion de la commande sans l'utilisateur
      const commandePromises = cart.map(async (item) => {
        await supabase.from('commande_materiel').insert({
          id_stock_materiel: item.materielId,  // Assure-toi que `medicamentId` est bien `id_stock_materiel`
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

  return (
    <div className="relative flex h-screen bg-opacity-40 backdrop-blur-md">
      <MenubarRe />
      <main className="flex-1 p-8 overflow-auto">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-white">Catalogue des Matériels</h1>
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
                    <div key={item.materielId} className="border-b py-2 flex justify-between items-center">
                      <p>{item.nom} x {item.quantity}</p>
                      <button
                        onClick={() => removeFromCart(item.materielId)}
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
            {stockMaterials.length > 0 ? (
              stockMaterials.map((material) => (
                <div key={material.materiel_id} className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-bold mb-2">{material.nom}</h2>
                  {material.description && (
                    <div className="text-sm text-gray-600 mb-4">{material.description}</div>
                  )}
                  <div className="text-sm text-gray-700 mb-4">
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
        </div>
      </main>
    </div>
  );
};

export default CataloguePage;
