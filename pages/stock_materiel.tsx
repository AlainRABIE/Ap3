import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import "../src/app/globals.css";
import MenubarRe from "../components/ui/MenuBarRe";
import { User } from "@supabase/supabase-js";
import { getUserRole } from "./api/role";

type StockMateriel = {
  id_stock?: number;
  materiel_id: number;
  quantite: number;
  date_ajout: string;
  nom?: string; 
  etat?: string; 
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
  const [materiels, setMateriels] = useState<{ id: number; name: string }[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);

  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchStockMateriels = async () => {
      setLoading(true);
      try {
        const { data: stockData, error: stockError } = await supabase
          .from("stock_materiel")
          .select(`
            id_stock, 
            materiel_id, 
            quantite, 
            date_ajout
          `);

        if (stockError) throw new Error(stockError.message);

        const { data: materielsData, error: materielsError } = await supabase
          .from("materiels")
          .select("id_materiel, nom");

        if (materielsError) throw new Error(materielsError.message);

        // Associer les noms des matériels aux stocks
        if (Array.isArray(stockData) && Array.isArray(materielsData)) {
          const materielsMap = new Map(materielsData.map((item) => [item.id_materiel, item.nom]));
          const combinedData = stockData.map((stock) => ({
            ...stock,
            nom: materielsMap.get(stock.materiel_id),
          }));

          setStockMateriels(combinedData);
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

  const getAvailableMateriels = () => {
    const addedMaterielIds = stockMateriels.map(stock => stock.materiel_id);
    return materiels.filter(materiel => !addedMaterielIds.includes(materiel.id));
  };

  const handleEdit = (stock: StockMateriel) => {
    setSelectedStock(stock);
    setFormData({
      materiel_id: stock.materiel_id,
      quantite: stock.quantite,
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id_stock: number) => {
    try {
      const { error } = await supabase
        .from("stock_materiel")
        .delete()
        .eq("id_stock", id_stock);

      if (error) throw new Error(error.message);

      setStockMateriels(stockMateriels.filter((stock) => stock.id_stock !== id_stock));
      alert("Matériel supprimé avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression du stock:", error);
      alert("Erreur lors de la suppression du stock, veuillez réessayer.");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (formData.materiel_id === 0 || formData.quantite === 0) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    try {
      let data, error;

      if (isEditing && selectedStock) {
        // Mise à jour du matériel existant
        ({ data, error } = await supabase
          .from("stock_materiel")
          .update({
            materiel_id: formData.materiel_id,
            quantite: formData.quantite,
            date_ajout: new Date().toISOString(), // Mettre à jour la date si nécessaire
          })
          .eq("id_stock", selectedStock.id_stock)
          .select());
      } else {
        // Ajout d'un nouveau matériel
        ({ data, error } = await supabase
          .from("stock_materiel")
          .insert([{
            materiel_id: formData.materiel_id,
            quantite: formData.quantite,
            date_ajout: new Date().toISOString(),
          }])
          .select());
      }

      if (error) {
        throw new Error(error.message);
      }

      if (Array.isArray(data) && data.length > 0) {
        const newData = data[0];
        setStockMateriels((prevStockMateriels) => [
          ...prevStockMateriels.filter((stock) => stock.id_stock !== newData.id_stock),
          {
            ...newData,
            id_stock: newData.id_stock || 0,
            nom: materiels.find(m => m.id === newData.materiel_id)?.name || "Nom inconnu"
          }
        ]);
      }

      alert(isEditing ? "Matériel modifié avec succès !" : "Matériel ajouté avec succès !");
    } catch (error) {
      console.error("Erreur lors de la soumission du matériel:", error);
      alert("Erreur lors de la soumission du matériel, veuillez réessayer.");
    } finally {
      setShowModal(false);
      setFormData({ materiel_id: 0, quantite: 0 });
      setSelectedStock(null);
      setIsEditing(false);
    }
  };

  const handleAdd = () => {
    setFormData({ materiel_id: 0, quantite: 0 });
    setIsEditing(false);
    setSelectedStock(null);
    setShowModal(true);
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
              <button
                className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
                onClick={handleAdd}
              >
                Ajouter un matériel
              </button>
            )}
            <ul>
              {stockMateriels.map((stock) => (
                <li key={stock.id_stock} className="text-white mb-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h2 className="text-lg font-bold">{stock.nom || "Nom inconnu"}</h2>
                    <p><strong>Quantité:</strong> {stock.quantite}</p>
                    <p><strong>Date d'ajout:</strong> {stock.date_ajout}</p>
                    {isAdmin && (
                      <div className="mt-4">
                        <button
                          className="mr-2 px-4 py-2 bg-red-500 text-white rounded"
                          onClick={() => handleDelete(stock.id_stock || 0)}
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
          </div>
        )}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? "Modifier le Matériel" : "Ajouter un Matériel"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="materiel_id" className="block text-sm font-medium text-gray-700">
                  Matériel
                </label>
                <select
                  id="materiel_id"
                  value={formData.materiel_id}
                  onChange={(e) => setFormData({ ...formData, materiel_id: parseInt(e.target.value) })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value={0}>Sélectionner un matériel</option>
                  {getAvailableMateriels().map((materiel) => (
                    <option key={materiel.id} value={materiel.id}>
                      {materiel.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="quantite" className="block text-sm font-medium text-gray-700">
                  Quantité
                </label>
                <input
                  id="quantite"
                  type="number"
                  value={formData.quantite}
                  onChange={(e) => setFormData({ ...formData, quantite: parseInt(e.target.value) })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-2 px-4 py-2 bg-gray-500 text-white rounded"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  {isEditing ? "Modifier" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockMaterielsPage;
