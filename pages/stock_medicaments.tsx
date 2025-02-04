import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import "../src/app/globals.css";
import MenubarRe from "../components/ui/MenuBarRe";
import { User } from "@supabase/supabase-js";
import { getUserRole } from "./api/role";
import Modal from "../components/ui/modal";

type StockMedicament = {
  id_stock: number;
  medicament_id: number;
  quantite: number;
  date_ajout: string;
  date_expiration: string | null;
};

const StockMedicamentsPage = () => {
  const [stockMedicaments, setStockMedicaments] = useState<StockMedicament[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStock, setSelectedStock] = useState<StockMedicament | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    id_stock: 0,
    medicament_id: 0,
    quantite: 0,
    date_ajout: new Date().toISOString(),
    date_expiration: "",
  });
  const [medicaments, setMedicaments] = useState<{ id: number; name: string }[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);

  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

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

  const fetchStockMedicaments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("stock_medicaments")
        .select(`id_stock, medicament_id, quantite, date_ajout, date_expiration`);

      if (error) throw new Error(error.message);

      if (Array.isArray(data)) {
        setStockMedicaments(data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des stocks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await checkSession();
      await fetchStockMedicaments();
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
    const fetchMedicaments = async () => {
      try {
        const { data, error } = await supabase
          .from("medicaments")
          .select("id, name");

        if (error) throw new Error(error.message);

        if (Array.isArray(data)) {
          setMedicaments(data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des médicaments:", error);
      }
    };

    fetchMedicaments();
  }, []);

  const handleEdit = (stock: StockMedicament) => {
    setSelectedStock(stock);
    setFormData({
      ...stock,
      date_expiration: stock.date_expiration || "",
    });
    setIsEditing(true);
  };

  const handleDelete = async (id_stock: number) => {
    try {
      const { error } = await supabase
        .from("stock_medicaments")
        .delete()
        .eq("id_stock", id_stock);

      if (error) throw new Error(error.message);

      setStockMedicaments(stockMedicaments.filter((stock) => stock.id_stock !== id_stock));
    } catch (error) {
      console.error("Erreur lors de la suppression du stock:", error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const sanitizedFormData = {
      ...formData,
      date_expiration: formData.date_expiration || null,
    };

    try {
      if (isEditing && selectedStock) {
        const { error } = await supabase
          .from("stock_medicaments")
          .update(sanitizedFormData)
          .eq("id_stock", selectedStock.id_stock);

        if (error) throw new Error(error.message);

        setStockMedicaments(
          stockMedicaments.map((stock) =>
            stock.id_stock === selectedStock.id_stock ? { ...stock, ...sanitizedFormData } : stock
          )
        );
      } else {
        const { error } = await supabase
          .from("stock_medicaments")
          .insert([sanitizedFormData]);

        if (error) throw new Error(error.message);

        setStockMedicaments([...stockMedicaments, sanitizedFormData]);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    } finally {
      setIsEditing(false);
      setSelectedStock(null);
      setShowModal(false);
    }
  };

  const availableMedicaments = medicaments.filter(
    (medicament) =>
      !stockMedicaments.some((stock) => stock.medicament_id === medicament.id)
  );

  return (
    <div className="relative flex h-screen bg-gray-800">
      <div className="animated-background"></div>
      <div className="waves"></div>

      <MenubarRe />

      <div className="content">
        {loading ? (
          <p>chargement des médicaments...</p>
        ) : (
          <div>
            <h1 className="text-white text-xl mb-4">Stock des Médicaments</h1>
            {isAdmin && (
              <button className="mb-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setShowModal(true)}>
                Ajouter un médicament
              </button>
            )}
            <ul>
              {stockMedicaments.map((stock) => (
                <li key={stock.id_stock} className="text-white mb-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h2 className="text-lg font-bold">
                      {medicaments.find(med => med.id === stock.medicament_id)?.name || "Médicament non trouvé"}
                    </h2>                    <p><strong>Quantité:</strong> {stock.quantite}</p>
                    <p><strong>Date d'ajout:</strong> {stock.date_ajout}</p>
                    <p><strong>Date d'expiration:</strong> {stock.date_expiration || "N/A"}</p>
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
            <Modal show={showModal} onClose={() => setShowModal(false)}>
              <div className="w-80 p-4 bg-white rounded-lg shadow-lg">
                <h2 className="text-lg font-bold mb-4 text-black">Ajouter un Stock</h2>
                <form onSubmit={handleSubmit} className="flex flex-col">
                  <select
                    value={formData.medicament_id}
                    onChange={(e) => setFormData({ ...formData, medicament_id: Number(e.target.value) })}
                    className="mb-2 p-2 border border-gray-300 rounded text-black"
                  >
                    <option value="">Sélectionner un médicament</option>
                    {availableMedicaments.map((medicament) => (
                      <option key={medicament.id} value={medicament.id}>
                        {medicament.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    placeholder="Quantité"
                    value={formData.quantite}
                    min="0"
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value >= 0) {
                        setFormData({ ...formData, quantite: value });
                      }
                    }}
                    className="mb-2 p-2 border border-gray-300 rounded text-black"
                  />

                  <input
                    type="date"
                    placeholder="Date d'expiration"
                    value={formData.date_expiration}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setFormData({ ...formData, date_expiration: e.target.value })}
                    className="mb-2 p-2 border border-gray-300 rounded text-black"
                  />

                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
                      disabled={
                        formData.quantite < 0 ||
                        (formData.date_expiration !== "" &&
                          formData.date_expiration < new Date().toISOString().split("T")[0])
                      }
                    >
                      {isEditing ? "Modifier" : "Ajouter"}
                    </button>

                  </div>
                </form>

              </div>
            </Modal>

          </div>
        )}
      </div>
    </div>
  );
};

export default StockMedicamentsPage;
