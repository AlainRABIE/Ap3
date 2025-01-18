import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import "../src/app/globals.css";
import MenubarRe from "../components/ui/MenuBarRe";

type Medicament = {
  id: number;
  name: string;
  description: string;
  posologie: string;
  maladies_non_compatibles: string;
};

const MedicamentsPage = () => {
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMedicament, setSelectedMedicament] = useState<Medicament | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    posologie: "",
    maladies_non_compatibles: "",
  });

  useEffect(() => {
    const fetchMedicaments = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("medicaments")
          .select("id, name, description, posologie, maladies_non_compatibles");

        if (error) throw new Error(error.message);

        if (Array.isArray(data)) {
          setMedicaments(data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des médicaments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicaments();
  }, []);

  const handleEdit = (medicament: Medicament) => {
    setSelectedMedicament(medicament);
    setFormData({
      name: medicament.name,
      description: medicament.description,
      posologie: medicament.posologie,
      maladies_non_compatibles: medicament.maladies_non_compatibles,
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from("medicaments")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);

      setMedicaments(medicaments.filter((medicament) => medicament.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression du médicament:", error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      if (isEditing && selectedMedicament) {
        const { error } = await supabase
          .from("medicaments")
          .update(formData)
          .eq("id", selectedMedicament.id);

        if (error) throw new Error(error.message);

        setMedicaments(
          medicaments.map((medicament) =>
            medicament.id === selectedMedicament.id ? { ...medicament, ...formData } : medicament
          )
        );
      } else {
        const { data, error } = await supabase
          .from("medicaments")
          .insert([formData]);

        if (error) throw new Error(error.message);

        if (data) {
          setMedicaments([...medicaments, ...data]);
        }
      }

      setIsEditing(false);
      setSelectedMedicament(null);
      setFormData({
        name: "",
        description: "",
        posologie: "",
        maladies_non_compatibles: "",
      });
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error);
    }
  };

  return (
    <div className="relative flex h-screen bg-gray-800">
      <div className="animated-background"></div>
      <div className="waves"></div>
      <MenubarRe />
      <main className="main-content flex-1 p-8 overflow-auto">
        <h1 className="text-4xl font-bold mb-6 text-white">Liste des Médicaments</h1>
        {loading ? (
          <p className="text-white">Chargement...</p>
        ) : (
          <table className="min-w-full table-auto mb-4">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Nom</th>
                <th className="px-4 py-2 border">Description</th>
                <th className="px-4 py-2 border">Posologie</th>
                <th className="px-4 py-2 border">Maladies Non Compatibles</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicaments.map((medicament) => (
                <tr key={medicament.id}>
                  <td className="px-4 py-2 border">{medicament.name}</td>
                  <td className="px-4 py-2 border">{medicament.description}</td>
                  <td className="px-4 py-2 border">{medicament.posologie}</td>
                  <td className="px-4 py-2 border">{medicament.maladies_non_compatibles}</td>
                  <td className="px-4 py-2 border">
                    <button
                      onClick={() => handleEdit(medicament)}
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(medicament.id)}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <input
              id="description"
              name="description"
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="posologie" className="block text-sm font-medium text-gray-700">Posologie</label>
            <input
              id="posologie"
              name="posologie"
              type="text"
              value={formData.posologie}
              onChange={(e) => setFormData({ ...formData, posologie: e.target.value })}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="maladies_non_compatibles" className="block text-sm font-medium text-gray-700">Maladies Non Compatibles</label>
            <input
              id="maladies_non_compatibles"
              name="maladies_non_compatibles"
              type="text"
              value={formData.maladies_non_compatibles}
              onChange={(e) => setFormData({ ...formData, maladies_non_compatibles: e.target.value })}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {isEditing ? "Mettre à jour" : "Ajouter"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default MedicamentsPage;