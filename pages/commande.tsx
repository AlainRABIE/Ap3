import "../src/app/globals.css";
import { useState } from "react";
import { useUser } from "@/services/user/user"; 
import { useRouter } from "next/router";

const OrderPage = () => {
  const user = useUser(); 
  const router = useRouter();

  const [formData, setFormData] = useState({
    produit: "",
    quantite: 1,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Vous devez être connecté pour passer une commande");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        body: JSON.stringify({
          userId: user.id, 
          produit: formData.produit,
          quantite: formData.quantite,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const order = await response.json();
        alert("Commande passée avec succès !");
        router.push("/orders");
      } else {
        alert("Une erreur est survenue lors de la création de la commande");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur est survenue lors de la création de la commande");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Passer une Commande</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1" htmlFor="produit">
            Produit (médicament ou matériel)
          </label>
          <input
            type="text"
            id="produit"
            name="produit"
            value={formData.produit}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1" htmlFor="quantite">
            Quantité
          </label>
          <input
            type="number"
            id="quantite"
            name="quantite"
            value={formData.quantite}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            min="1"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
          disabled={loading}
        >
          {loading ? "Chargement..." : "Passer la commande"}
        </button>
      </form>
    </div>
  );
};

export default OrderPage;
