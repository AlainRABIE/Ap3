import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import "../src/app/globals.css";
import MenubarRe from "../components/ui/MenuBarRe";

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
    medicament_id: 0,
    quantite: 0,
    date_expiration: "", // Le champ date_expiration est initialisé ici
  });
  const [medicaments, setMedicaments] = useState<{ id: number, name: string }[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false); // état pour afficher/masquer le modal

  // Fetch stock_medicaments data
  useEffect(() => {
    const fetchStockMedicaments = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("stock_medicaments")
          .select(`
            id_stock, 
            medicament_id, 
            quantite, 
            date_ajout, 
            date_expiration
          `);

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

    fetchStockMedicaments();
  }, []);

  // Fetch medicaments data
  useEffect(() => {
    const fetchMedicaments = async () => {
      try {
        const { data, error } = await supabase
          .from("medicaments")
          .select("id, name");  // Change 'nom' to 'name'

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
      medicament_id: stock.medicament_id,
      quantite: stock.quantite,
      date_expiration: stock.date_expiration || "", // Remplir la date d'expiration si elle existe
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

    try {
      if (isEditing && selectedStock) {
        const { error } = await supabase
          .from("stock_medicaments")
          .update(formData)
          .eq("id_stock", selectedStock.id_stock);

        if (error) throw new Error(error.message);

        setStockMedicaments(
          stockMedicaments.map((stock) =>
            stock.id_stock === selectedStock.id_stock ? { ...stock, ...formData } : stock
          )
        );
      } else {
        const { data, error } = await supabase
          .from("stock_medicaments")
          .insert([formData]);

        if (error) throw new Error(error.message);

        if (data) {
          setStockMedicaments([...stockMedicaments, ...data]);
        }
      }

      setIsEditing(false);
      setSelectedStock(null);
      setFormData({
        medicament_id: 0,
        quantite: 0,
        date_expiration: "",
      });
      setShowModal(false); // Masque le formulaire après soumission
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error);
    }
  };

  // Fonction pour obtenir le nom du médicament à partir de l'ID
  const getMedicamentName = (medicament_id: number) => {
    const medicament = medicaments.find((med) => med.id === medicament_id);
    return medicament ? medicament.name : "Inconnu"; // Change 'nom' to 'name'
  };

  return (
    <div className="relative flex h-screen bg-gray-800">
      <div className="animated-background"></div>
      <div className="waves"></div>
      <MenubarRe />
      <main className="main-content flex-1 p-8 overflow-auto">
        <h1 className="text-4xl font-bold mb-6 text-white">Stock des Médicaments</h1>

        {/* Bouton Ajouter */}
        <button
          onClick={() => setShowModal(true)}
          className="absolute top-5 right-5 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Ajouter
        </button>

        {loading ? (
          <p className="text-white">Chargement...</p>
        ) : (
          <table className="min-w-full table-auto mb-4">
            <thead>
              <tr>
                <th className="px-4 py-2 border">ID Stock</th>
                <th className="px-4 py-2 border">Médicament</th>
                <th className="px-4 py-2 border">Quantité</th>
                <th className="px-4 py-2 border">Date d'Ajout</th>
                <th className="px-4 py-2 border">Date d'Expiration</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stockMedicaments.map((stock) => (
                <tr key={stock.id_stock}>
                  <td className="px-4 py-2 border">{stock.id_stock}</td>
                  <td className="px-4 py-2 border">{getMedicamentName(stock.medicament_id)}</td>
                  <td className="px-4 py-2 border">{stock.quantite}</td>
                  <td className="px-4 py-2 border">{stock.date_ajout}</td>
                  <td className="px-4 py-2 border">{stock.date_expiration || "N/A"}</td>
                  <td className="px-4 py-2 border">
                    <button
                      onClick={() => handleEdit(stock)}
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(stock.id_stock)}
                      className="bg-red-500 text-white px-4 py-2 rounded ml-2"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Modal pour ajouter un médicament */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
              <h2 className="text-2xl font-bold mb-4">Ajouter un Médicament</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="medicament_id" className="block text-sm font-medium text-gray-700">Médicament</label>
                  <select
                    id="medicament_id"
                    name="medicament_id"
                    value={formData.medicament_id}
                    onChange={(e) => setFormData({ ...formData, medicament_id: +e.target.value })}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="" disabled>Choisissez un médicament</option>
                    {medicaments.map((medicament) => (
                      <option key={medicament.id} value={medicament.id}>
                        {medicament.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="quantite" className="block text-sm font-medium text-gray-700">Quantité</label>
                  <input
                    id="quantite"
                    name="quantite"
                    type="number"
                    value={formData.quantite}
                    onChange={(e) => setFormData({ ...formData, quantite: +e.target.value })}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="date_expiration" className="block text-sm font-medium text-gray-700">Date d'Expiration</label>
                  <input
                    id="date_expiration"
                    name="date_expiration"
                    type="date"
                    value={formData.date_expiration}
                    onChange={(e) => setFormData({ ...formData, date_expiration: e.target.value })}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Sauvegarder
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StockMedicamentsPage;
