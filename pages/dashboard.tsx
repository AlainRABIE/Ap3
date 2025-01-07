import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import "../src/app/globals.css";

interface Order {
  id: number;
  user_id: number;
  produit_id: number;
  quantite: number;
  statut: string;
  etat: string;
}

const Dashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('commandes')
        .select('*');
      if (error) {
        console.error('Erreur de récupération des commandes:', error);
      } else {
        setOrders(data as Order[]);
      }
    };

    fetchOrders();
  }, []);

  return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1">
          <main className="p-8 overflow-auto bg-white shadow-lg rounded-xl mx-6 my-8">
            <div className="wave-container">
              <div className="wave"></div>
            </div>
            <div className="space-y-12 mt-8">
              <section>
                <h1 className="text-3xl font-bold mb-4">Commandes Passées</h1>
                <table className="min-w-full bg-white shadow-lg rounded-xl">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b">ID</th>
                      <th className="py-2 px-4 border-b">Utilisateur ID</th>
                      <th className="py-2 px-4 border-b">Produit ID</th>
                      <th className="py-2 px-4 border-b">Quantité</th>
                      <th className="py-2 px-4 border-b">Statut</th>
                      <th className="py-2 px-4 border-b">État</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td className="py-2 px-4 border-b">{order.id}</td>
                        <td className="py-2 px-4 border-b">{order.user_id}</td>
                        <td className="py-2 px-4 border-b">{order.produit_id}</td>
                        <td className="py-2 px-4 border-b">{order.quantite}</td>
                        <td className="py-2 px-4 border-b">{order.statut}</td>
                        <td className="py-2 px-4 border-b">{order.etat}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </div>
          </main>
        </div>
      </div>
  );
};
export default Dashboard;
