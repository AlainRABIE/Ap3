import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import "../src/app/globals.css";
import MenubarRe from "../components/ui/MenuBarRe";
import { User } from "@supabase/supabase-js";
import { getUserRole } from "./api/role";

type StockMateriel = {
  id_stock: number;
  materiel_id: number;
  quantite: number;
  date_ajout: string;
};

const StockMaterielsPage = () => {
  const [stockMateriels, setStockMateriels] = useState<StockMateriel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStock, setSelectedStock] = useState<StockMateriel | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    materiel_id: 0,
    quantite: 0,
  });
  const [materiels, setMateriels] = useState<{ id: number, name: string }[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);

  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch stock_materiel data
  useEffect(() => {
    const fetchStockMateriels = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("stock_materiel")
          .select(`
            id_stock, 
            materiel_id, 
            quantite, 
            date_ajout
          `);

        if (error) throw new Error(error.message);

        if (Array.isArray(data)) {
          setStockMateriels(data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des stocks:", error);
      } finally {
        setLoading(false);
      }
    };

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
      } else {
        setUser(null);
        setUserRole(null);
        setIsAdmin(false);
      }
    };

    const initialize = async () => {
      await checkSession();
      await fetchStockMateriels();
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
        }
      } else {
        setUser(null);
        setUserRole(null);
        setIsAdmin(false);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Fetch materiels data
  useEffect(() => {
    const fetchMateriels = async () => {
      try {
        const { data, error } = await supabase
          .from("materiels")
          .select("id_materiel, nom");

        if (error) throw new Error(error.message);

        if (Array.isArray(data)) {
          setMateriels(data.map(item => ({ id: item.id_materiel, name: item.nom })));
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des matériels:", error);
      }
    };

    fetchMateriels();
  }, []);

  const handleEdit = (stock: StockMateriel) => {
    setSelectedStock(stock);
    setFormData({
      materiel_id: stock.materiel_id,
      quantite: stock.quantite,
    });
    setIsEditing(true);
  };

  const handleDelete = async (id_stock: number) => {
    try {
      const { error } = await supabase
        .from("stock_materiel")
        .delete()
        .eq("id_stock", id_stock);

      if (error) throw new Error(error.message);

      setStockMateriels(stockMateriels.filter((stock) => stock.id_stock !== id_stock));
    } catch (error) {
      console.error("Erreur lors de la suppression du stock:", error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      if (isEditing && selectedStock) {
        const { error } = await supabase
          .from("stock_materiel")
          .update(formData)
          .eq("id_stock", selectedStock.id_stock);

        if (error) throw new Error(error.message);

        setStockMateriels(
          stockMateriels.map((stock) =>
            stock.id_stock === selectedStock.id_stock ? { ...stock, ...formData } : stock
          )
        );
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du stock:", error);
    } finally {
      setIsEditing(false);
      setSelectedStock(null);
    }
  };

  return (
    <div className="relative flex h-screen bg-gray-800">
      <div className="animated-background"></div>
      <div className="waves"></div>

      <MenubarRe />

      <div className="content">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div>
            <h1 className="text-white text-xl mb-4">Stock des Matériels</h1>
            {isAdmin && (
              <button className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">
                Ajouter un matériel
              </button>
            )}
            <ul>
              {stockMateriels.map((stock) => (
                <li key={stock.id_stock} className="text-white mb-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h2 className="text-lg font-bold">{stock.materiel_id}</h2>
                    <p><strong>Quantité:</strong> {stock.quantite}</p>
                    <p><strong>Date d'ajout:</strong> {stock.date_ajout}</p>
                    {isAdmin && (
                      <div className="mt-4">
                        <button
                          className="mr-2 px-4 py-2 bg-red-500 text-white rounded"
                          onClick={() => handleDelete(stock.id_stock)}
                        >
                          Supprimer
                        </button>
                        <button
                          className="px-4 py-2 bg-yellow-500 text-white rounded"
                          onClick={() => handleEdit(stock)}
                        >
                          Modifier
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {isEditing && selectedStock && (
              <form onSubmit={handleSubmit} className="bg-gray-700 p-4 rounded-lg mt-4">
                <h2 className="text-lg font-bold text-white mb-4">Modifier le Stock</h2>
                {/* Add form fields here for editing the stock */}
                <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded">
                  Enregistrer
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StockMaterielsPage;
