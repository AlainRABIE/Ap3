import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Menubar from "../components/ui/MenuBarRe";
import { ShoppingCart } from 'lucide-react';
import { getUserRole } from './api/role';

interface Materiel {
  id_materiel: number;
  nom: string;
  description: string;
  quantite: number;
  date_ajout: string;
  numero_serie: string;
  etat: string;
  date_expiration: string;
}

interface CartItem {
  materielId: number;
  quantity: number;
  nom: string;
}

interface User {
  id: string;
  email: string;
}

const CataloguePage = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [materiels, setMateriels] = useState<Materiel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    const initialize = async () => {
      await checkSession();
      await fetchMateriels();
    };
    initialize();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser({ id: session.user.id, email: session.user.email || '' });
      const { data: userData } = await supabase
        .from('User')
        .select('id')
        .eq('email', session.user.email)
        .single();

      if (userData) {
        await getUserRole(userData.id);
      }
    }
  };

  const fetchMateriels = async () => {
    try {
      const { data, error } = await supabase
        .from('materiels')
        .select('id_materiel, nom, description, quantite, date_ajout, numero_serie, etat, date_expiration')
        .order('id_materiel', { ascending: true });

      if (error) throw error;

      if (data) {
        setMateriels(data);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des matériels:', error);
      alert('Erreur lors du chargement des matériels');
    }
  };

  const verifyStock = async (cartItems: CartItem[]): Promise<boolean> => {
    for (const item of cartItems) {
      const { data, error } = await supabase
        .from('materiels')
        .select('quantite')
        .eq('id_materiel', item.materielId)
        .single();

      if (error || !data) {
        throw new Error(`Erreur de vérification du stock pour ${item.nom}`);
      }

      if (data.quantite < item.quantity) {
        throw new Error(`Stock insuffisant pour ${item.nom}. Quantité disponible: ${data.quantite}`);
      }
    }
    return true;
  };

  const updateStock = async (cartItems: CartItem[]): Promise<void> => {
    for (const item of cartItems) {
      const { data: materiel, error: fetchError } = await supabase
        .from('materiels')
        .select('quantite')
        .eq('id_materiel', item.materielId)
        .single();

      if (fetchError || !materiel) {
        throw new Error(`Erreur lors de la récupération du matériel ${item.nom}`);
      }

      const newQuantite = materiel.quantite - item.quantity;

      if (newQuantite < 0) {
        throw new Error(`Stock insuffisant pour ${item.nom}`);
      }

      const { error: updateError } = await supabase
        .from('materiels')
        .update({ quantite: newQuantite })
        .eq('id_materiel', item.materielId);

      if (updateError) {
        throw new Error(`Erreur lors de la mise à jour du stock pour ${item.nom}`);
      }
    }
  };

  const handleOrder = async () => {
    if (cart.length === 0) {
      alert('Votre panier est vide.');
      return;
    }

    setIsLoading(true);

    try {
      await verifyStock(cart);

      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('id')
        .eq('email', user?.email)
        .single();

      if (userError || !userData) {
        throw new Error('Utilisateur non trouvé.');
      }

      await updateStock(cart);

      const commandes = cart.map((item) => ({
        id_user: userData.id,
        id_materiel: item.materielId,
        quantite: item.quantity,
        date_commande: new Date().toISOString(),
        etat: 'en attente'
      }));

      const { error: commandeError } = await supabase
        .from('commande_materiel')
        .insert(commandes);

      if (commandeError) {
        throw new Error('Erreur lors de la création de la commande');
      }

      await fetchMateriels();
      setCart([]);
      setIsCartOpen(false);
      alert('Commande passée avec succès !');

    } catch (error) {
      console.error('Erreur lors de la commande:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (materielId: number, quantity: number) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [materielId]: quantity,
    }));
  };

  const addToCart = (materiel: Materiel) => {
    const quantity = quantities[materiel.id_materiel] || 1;

    const existingItemIndex = cart.findIndex(item => item.materielId === materiel.id_materiel);

    if (existingItemIndex >= 0) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity = quantity;
      setCart(updatedCart);
    } else {
      setCart((prevCart) => [
        ...prevCart,
        {
          materielId: materiel.id_materiel,
          nom: materiel.nom,
          quantity: quantity,
        }
      ]);
    }
  };

  const removeFromCart = (materielId: number) => {
    setCart((prevCart) => prevCart.filter(item => item.materielId !== materielId));
  };

  return (
    <div className="relative flex h-screen bg-opacity-40 backdrop-blur-md">
      <Menubar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materiels.map((materiel) => (
            <div key={materiel.id_materiel} className="bg-transparent border border-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-2 card-text">{materiel.nom}</h2>
              <p className="text-sm mb-4 card-text">{materiel.description}</p>
              <p className="text-sm mb-4 card-text">
                Quantité disponible: {materiel.quantite}
              </p>

              <input
                type="number"
                min="1"
                max={materiel.quantite}
                value={quantities[materiel.id_materiel] || 1}
                onChange={(e) => handleQuantityChange(
                  materiel.id_materiel,
                  Math.max(1, Math.min(materiel.quantite, Number(e.target.value)))
                )}
                className="w-full mb-4 p-2 border rounded card-text"
                style={{ color: 'black' }}
              />


              <button
                onClick={() => addToCart(materiel)}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg mt-4 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={materiel.quantite === 0 || isLoading}
              >
                {materiel.quantite === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
              </button>
            </div>

          ))}
        </div>
      </main>

      <div className="fixed top-4 right-4 z-10">
        <button
          className="relative p-3 bg-blue-500 rounded-full"
          onClick={() => setIsCartOpen(!isCartOpen)}
          disabled={isLoading}
        >
          <ShoppingCart className="text-white" size={24} />
          {cart.length > 0 && (
            <span className="absolute top-0 right-0 text-white bg-red-600 rounded-full text-xs w-5 h-5 flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </button>

        {isCartOpen && (
          <div className="fixed top-0 right-0 w-96 bg-white shadow-xl p-4 rounded-lg">
            <h2 className="text-lg font-bold mb-4">Mon Panier</h2>
            {cart.length > 0 ? (
              <div>
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between items-center mb-4 p-2 bg-gray-50 rounded">
                    <p className="font-medium">{item.nom}</p>
                    <span className="mx-2">Qté: {item.quantity}</span>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => removeFromCart(item.materielId)}
                      disabled={isLoading}
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleOrder}
                  className="w-full bg-green-500 text-white py-2 rounded-lg mt-4 hover:bg-green-600 disabled:bg-gray-400"
                  disabled={isLoading}
                >
                  {isLoading ? 'Traitement en cours...' : 'Passer la commande'}
                </button>
              </div>
            ) : (
              <p className="text-gray-500 text-center">Votre panier est vide.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CataloguePage;