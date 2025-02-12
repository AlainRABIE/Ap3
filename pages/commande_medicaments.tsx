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

const CataloguePage = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await checkSession();
      await fetchMedicaments();
    };
    initialize();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser({ id: session.user.id, email: session.user.email || '' });
      const { data: userData } = await supabase.from('User').select('id').eq('email', session.user.email).single();
      if (userData) {
        const role = await getUserRole(userData.id);
        setUserRole(role);
        setIsAdmin(role === 'administrateur');
      }
    }
  };

  const fetchMedicaments = async () => {
    const { data, error } = await supabase
      .from('medicaments')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('❌ Erreur Supabase:', error);
      return;
    }

    if (data && data.length > 0) {
      setMedicaments(data);
    }
  };

  const fetchValidFournisseurId = async () => {
    const { data, error } = await supabase
      .from('fournisseur_medicament')
      .select('fournisseur_id')
      .limit(1)
      .single();
  
    if (error) {
      console.error('❌ Erreur lors de la récupération du fournisseur:', error);
      return null;
    }

    return data?.fournisseur_id || null;
  };

  const handleOrder = async () => {
    if (cart.length === 0) {
      alert('Votre panier est vide.');
      return;
    }

    try {
      const { data: userData, error: userError } = await supabase
        .from('User')
        .select('id')
        .eq('email', user?.email)
        .single();

      if (userError || !userData) {
        console.error('Erreur récupération utilisateur:', userError);
        alert('Utilisateur non trouvé.');
        return;
      }

      const fournisseurId = await fetchValidFournisseurId();
      if (!fournisseurId) {
        alert('Aucun fournisseur valide trouvé.');
        return;
      }

      const commandes = cart.map((item) => ({
        id_user: userData.id,
        id_medicament: item.medicamentId,
        quantite: item.quantity,
        date_commande: new Date().toISOString(),
        etat: 'en attente',
        id_fournisseur: fournisseurId, // Utilise un ID fournisseur valide récupéré
      }));

      const { error } = await supabase.from('commande_médicaments').insert(commandes);

      if (error) {
        console.error('Erreur lors de l\'insertion:', error);
        alert('Erreur lors de la commande.');
        return;
      }

      setCart([]);
      fetchMedicaments();
      alert('Commande passée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la commande:', error);
    }
  };

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => [...prevCart, item]);
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
              <p className="text-sm text-gray-300 mb-4">Quantité disponible: {medicament.quantite}</p>
              <button
                onClick={() => addToCart({
                  medicamentId: medicament.id,
                  name: medicament.name,
                  quantity: 1,
                })}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg mt-4 hover:bg-blue-600"
                disabled={medicament.quantite === 0}
              >
                {medicament.quantite === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
              </button>
            </div>
          ))}
        </div>
      </main>

      <div className="fixed top-4 right-4 z-10">
        <button className="relative p-3 bg-blue-500 rounded-full" onClick={() => setIsCartOpen(!isCartOpen)}>
          <ShoppingCart className="text-white" size={24} />
          {cart.length > 0 && <span className="absolute top-0 right-0 text-white bg-red-600 rounded-full text-xs w-5 h-5 flex items-center justify-center">{cart.length}</span>}
        </button>

        {isCartOpen && (
          <div className="fixed top-0 right-0 w-96 bg-white shadow-xl p-4">
            <h2 className="text-lg font-bold">Mon Panier</h2>
            {cart.length > 0 ? (
              <div>
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between items-center mb-4">
                    <p>{item.name}</p>
                    <span>{item.quantity}</span>
                    <button className="text-red-600" onClick={() => setCart(cart.filter(c => c.medicamentId !== item.medicamentId))}>Supprimer</button>
                  </div>
                ))}
                <button onClick={handleOrder} className="w-full bg-green-500 text-white py-2 rounded-lg mt-4">Passer la commande</button>
              </div>
            ) : <p>Votre panier est vide.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default CataloguePage;
