import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import MenubarRe from "../components/ui/MenuBarRe";
import { ShoppingCart, X } from "lucide-react"; // Icône pour la croix
import { getUserRole } from "./api/role";

interface Medicament {
  id: number;
  name: string;
  description: string;
}

interface CartItem {
  medicamentId: number;
  quantity: number;
  name: string;
}

interface Material {
  materiel_id: number;
  quantite: number;
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
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quantities, setQuantities] = useState<Quantities>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stockMaterials, setStockMaterials] = useState<Material[]>([]);

  useEffect(() => {
    checkSession();
    fetchStockMaterials();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const userObj: User = {
        id: session.user.id,
        email: session.user.email || "",
      };
      setUser(userObj);

      const { data: userData } = await supabase
        .from("User")
        .select("id")
        .eq("email", session.user.email)
        .single();

      if (userData) {
        const role = await getUserRole(userData.id);
        setUserRole(role);
        setIsAdmin(role === "administrateur");
      }
    }
  };

  // Fonction de récupération des matériaux
  const fetchStockMaterials = async () => {
    const { data, error } = await supabase
      .from("stock_materiel")
      .select(`
        materiel_id,
        quantite,
        materiels (
          nom
        )
      `);

    if (error) {
      console.error("Erreur lors de la récupération des matériaux:", error);
      return;
    }

    if (data) {
      console.log(data); // Vérifier la structure des données dans la console

      // Formatage des données reçues
      // Formatage des données reçues
      const formattedData = data.map(item => ({
        materiel_id: item.materiel_id,
        quantite: item.quantite,
        // Accéder correctement au nom dans le tableau "materiels" (en prenant le nom directement si disponible)
        nom: item.materiels ? item.materiels[0]?.nom : "Nom non disponible", // S'assurer de vérifier que materiels[0] existe
      }));


      setStockMaterials(formattedData);
    }
  };

  const handleOrder = async () => {
    if (!user) {
      alert("Vous devez être connecté pour passer une commande.");
      return;
    }

    try {
      // Créer les entrées dans commande_materiel
      const commandePromises = cart.map(async (item) => {
        const { error } = await supabase
          .from('commande_materiel')
          .insert([{
            user_id: user.id,
            materiel_id: item.medicamentId,
            quantite: item.quantity,
            date_commande: new Date().toISOString(),
            status: 'en cours'
          }]);


        if (error) throw error;
      });

      await Promise.all(commandePromises);

      // Mettre à jour les quantités dans stock_materiel
      const updateStockPromises = cart.map(async (item) => {
        const currentStock = stockMaterials.find(
          (material) => material.materiel_id === item.medicamentId
        );

        if (currentStock) {
          const newQuantity = currentStock.quantite - item.quantity;

          if (newQuantity < 0) {
            throw new Error(`Stock insuffisant pour ${item.name}`);
          }

          const { error } = await supabase
            .from('stock_materiel')
            .update({ quantite: newQuantity })
            .eq('materiel_id', item.medicamentId);

          if (error) throw error;
        }
      });

      await Promise.all(updateStockPromises);

      alert("Commande passée avec succès !");
      setCart([]);
      fetchStockMaterials(); // Rafraîchir les stocks
    } catch (error) {
      console.error("Erreur lors de la commande:", error);
      alert(error instanceof Error ? error.message : "Une erreur est survenue lors de la commande.");
    }
  };

  // Fonction d'ajout au panier
  const addToCart = (item: CartItem) => {
    setCart((prevCart) => [...prevCart, item]);
  };

  // Fonction de gestion de la quantité
  const handleQuantityChange = (materielId: number, quantity: string) => {
    setQuantities({
      ...quantities,
      [materielId]: Math.max(1, Math.min(Number(quantity), 100)), // Limiter la quantité entre 1 et 100
    });
  };

  // Fonction de retrait du panier
  const removeFromCart = (medicamentId: number) => {
    setCart((prevCart) => prevCart.filter(item => item.medicamentId !== medicamentId));
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
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>{cart.length} articles</span>
              </button>
              {isCartOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg p-4 rounded-lg">
                  <h2 className="text-lg font-bold">Panier</h2>
                  {cart.map((item) => (
                    <div key={item.medicamentId} className="border-b py-2 flex justify-between items-center">
                      <p>{item.name} x {item.quantity}</p>
                      <button
                        onClick={() => removeFromCart(item.medicamentId)}
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
                      medicamentId: material.materiel_id,
                      name: material.nom,
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
              <p>Aucun matériel disponible.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CataloguePage;
