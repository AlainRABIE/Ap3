import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import MenubarRe from '../components/ui/MenuBarRe';
import { ShoppingCart } from 'lucide-react';
import { getUserRole } from './api/role';

interface Medicament {
  id: number;
  name: string;
  description: string;
  posologie: string;
  quantite: number;
}

interface CartItem {
  medicamentId: number;
  quantity: number;
  name: string;
}

interface User {
  id: string;
  email: string;
}

const CataloguePage: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const initialize = async () => {
      await checkSession();
      await fetchMedicaments();
    };
    initialize();
  }, []);

  const checkSession = async (): Promise<void> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser({ id: session.user.id, email: session.user.email || '' });
      const { data: userData } = await supabase
        .from('User')
        .select('id')
        .eq('email', session.user.email)
        .single();
      
      if (userData) {
        const role = await getUserRole(userData.id);
        setUserRole(role);
        setIsAdmin(role === 'administrateur');
      }
    }
  };

  const fetchMedicaments = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('medicaments')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      if (data) {
        setMedicaments(data);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des médicaments:', error);
      alert('Erreur lors du chargement des médicaments');
    }
  };

  const verifyStock = async (cartItems: CartItem[]): Promise<boolean> => {
    for (const item of cartItems) {
      const { data, error } = await supabase
        .from('medicaments')
        .select('quantite')
        .eq('id', item.medicamentId)
        .single();

      if (error || !data) {
        throw new Error(`Erreur de vérification du stock pour ${item.name}`);
      }

      if (data.quantite < item.quantity) {
        throw new Error(`Stock insuffisant pour ${item.name}. Quantité disponible: ${data.quantite}`);
      }
    }
    return true;
  };


  const updateStock = async (cartItems: CartItem[]): Promise<void> => {
    for (const item of cartItems) {
      // Récupérer le médicament actuel
      const { data: medicament, error: fetchError } = await supabase
        .from('medicaments')
        .select('quantite')
        .eq('id', item.medicamentId)
        .single();
  
      if (fetchError || !medicament) {
        throw new Error(`Erreur lors de la récupération du médicament ${item.name}`);
      }
  
      // Calculer la nouvelle quantité
      const newQuantite = medicament.quantite - item.quantity;
  
      if (newQuantite < 0) {
        throw new Error(`Stock insuffisant pour ${item.name}`);
      }
  
      // Mettre à jour le stock
      const { error: updateError } = await supabase
        .from('medicaments')
        .update({ quantite: newQuantite })
        .eq('id', item.medicamentId);
  
      if (updateError) {
        throw new Error(`Erreur lors de la mise à jour du stock pour ${item.name}`);
      }
    }
  };

  const fetchValidFournisseurId = async (): Promise<number | null> => {
    try {
      const { data, error } = await supabase
        .from('fournisseur_medicament')
        .select('fournisseur_id')
        .limit(1)
        .single();
    
      if (error) throw error;
      return data?.fournisseur_id || null;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du fournisseur:', error);
      return null;
    }
  };

  const handleOrder = async (): Promise<void> => {
    if (cart.length === 0) {
      alert('Votre panier est vide.');
      return;
    }
  
    setIsLoading(true);
  
    try {
      // Vérifier le stock d'abord
      await verifyStock(cart);
  
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('id')
        .eq('email', user?.email)
        .single();
  
      if (userError || !userData) {
        throw new Error('Utilisateur non trouvé.');
      }
  
      const fournisseurId = await fetchValidFournisseurId();
      if (!fournisseurId) {
        throw new Error('Aucun fournisseur valide trouvé.');
      }
  
      // Mettre à jour le stock
      await updateStock(cart);
  
      // Créer la commande
      const commandes = cart.map((item) => ({
        id_user: userData.id,
        id_medicament: item.medicamentId,
        quantite: item.quantity,
        date_commande: new Date().toISOString(),
        etat: 'en attente',
        id_fournisseur: fournisseurId,
      }));
  
      // Insérer la commande
      const { error: commandeError } = await supabase
        .from('commande_médicaments')
        .insert(commandes);
  
      if (commandeError) {
        throw new Error(`Erreur lors de la création de la commande: ${commandeError.message}`);
      }
  
      await fetchMedicaments();
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

  const addToCart = (medicament: Medicament): void => {
    setCart((prevCart) => [
      ...prevCart,
      {
        medicamentId: medicament.id,
        name: medicament.name,
        quantity: 1,
      }
    ]);
  };

  const removeFromCart = (medicamentId: number): void => {
    setCart((prevCart) => prevCart.filter(item => item.medicamentId !== medicamentId));
  };

  return (
    <div className="relative flex h-screen bg-opacity-40 backdrop-blur-md">
      <MenubarRe />
      <main className="flex-1 p-8 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medicaments.map((medicament) => (
            <div key={medicament.id} className="bg-transparent border border-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-2 text-white">{medicament.name}</h2>
              <p className="text-sm text-gray-300 mb-4">{medicament.description}</p>
              <p className="text-sm text-gray-300 mb-4">
                Quantité disponible: {medicament.quantite}
              </p>
              <button
                onClick={() => addToCart(medicament)}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg mt-4 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={medicament.quantite === 0 || isLoading}
              >
                {medicament.quantite === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
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
                    <p className="font-medium">{item.name}</p>
                    <span className="mx-2">Qté: {item.quantity}</span>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => removeFromCart(item.medicamentId)}
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