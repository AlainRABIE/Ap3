import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import "../src/app/globals.css";
import { SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/ui/app-sidebar";

// Définir un type pour les médicaments
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

  // Récupérer les médicaments depuis Supabase
  useEffect(() => {
    const fetchMedicaments = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("medicaments")
          .select("id, name, description, posologie, maladies_non_compatibles");

        if (error) throw new Error(error.message);

        if (Array.isArray(data)) {
          setMedicaments(data as Medicament[]); // S'assurer que les données sont du type attendu
        } else {
          console.error("Les données récupérées ne sont pas sous forme de tableau.");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des médicaments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicaments();
  }, []);

  // Supprimer un médicament
  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer ce médicament ?");
    if (!confirmDelete) return;

    try {
      const { data, error } = await supabase
        .from("medicaments")
        .delete()
        .eq("id", id);

      if (error) throw new Error(`Erreur lors de la suppression : ${error.message}`);

      setMedicaments((prevMedicaments) =>
        prevMedicaments.filter((medicament) => medicament.id !== id)
      );

      alert("Médicament supprimé avec succès.");
    } catch (error) {
      console.error("Erreur lors de la suppression du médicament:", error);
      alert("Erreur lors de la suppression du médicament.");
    }
  };

  // Voir les détails d'un médicament
  const handleDetail = (medicament: Medicament) => {
    setSelectedMedicament(medicament);
  };

  // Modifier un médicament
  const handleEdit = (medicament: Medicament) => {
    setFormData({
      name: medicament.name,
      description: medicament.description,
      posologie: medicament.posologie,
      maladies_non_compatibles: medicament.maladies_non_compatibles,
    });
    setIsEditing(true);
    setSelectedMedicament(medicament);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedicament) return;

    try {
      const { data, error } = await supabase
        .from("medicaments")
        .update(formData)
        .eq("id", selectedMedicament.id);

      if (error) throw new Error(error.message);

      setMedicaments((prevMedicaments) =>
        prevMedicaments.map((medicament) =>
          medicament.id === selectedMedicament.id ? { ...medicament, ...formData } : medicament
        )
      );

      alert("Médicament mis à jour avec succès.");
      setIsEditing(false);
      setSelectedMedicament(null);
    } catch (error) {
      console.error("Erreur lors de la modification du médicament:", error);
      alert("Erreur lors de la modification du médicament.");
    }
  };

  return (
    <SidebarProvider>
      <div className="flex">
        <AppSidebar />

        <div className="container mx-auto p-4 flex-1">
          <h1 className="text-2xl font-bold mb-4">Médicaments en Stock</h1>

          {loading ? (
            <p>Chargement des médicaments...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border-b">Nom</th>
                    <th className="px-4 py-2 border-b">Description</th>
                    <th className="px-4 py-2 border-b">Posologie</th>
                    <th className="px-4 py-2 border-b">Maladies non compatibles</th>
                    <th className="px-4 py-2 border-b">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {medicaments.map((medicament) => (
                    <tr key={medicament.id}>
                      <td className="px-4 py-2 border-b">{medicament.name}</td>
                      <td className="px-4 py-2 border-b">{medicament.description}</td>
                      <td className="px-4 py-2 border-b">{medicament.posologie}</td>
                      <td className="px-4 py-2 border-b">{medicament.maladies_non_compatibles}</td>
                      <td className="px-4 py-2 border-b">
                        <button
                          onClick={() => handleDetail(medicament)}
                          className="text-blue-500 hover:text-blue-700 mr-2"
                        >
                          Détail
                        </button>
                        <button
                          onClick={() => handleEdit(medicament)}
                          className="text-green-500 hover:text-green-700"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(medicament.id)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedMedicament && !isEditing && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Détails du Médicament</h2>
              <p><strong>Nom:</strong> {selectedMedicament.name}</p>
              <p><strong>Description:</strong> {selectedMedicament.description}</p>
              <p><strong>Posologie:</strong> {selectedMedicament.posologie}</p>
              <p><strong>Maladies non compatibles:</strong> {selectedMedicament.maladies_non_compatibles}</p>
            </div>
          )}

          {isEditing && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-xl font-semibold mb-2 text-black">Modifier le Médicament</h2>
                <form onSubmit={handleFormSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-black">Nom</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-black">Description</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-black">Posologie</label>
                    <input
                      type="text"
                      value={formData.posologie}
                      onChange={(e) => setFormData({ ...formData, posologie: e.target.value })}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-black">Maladies non compatibles</label>
                    <input
                      type="text"
                      value={formData.maladies_non_compatibles}
                      onChange={(e) =>
                        setFormData({ ...formData, maladies_non_compatibles: e.target.value })
                      }
                      className="mt-1 block w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex justify-between">
                    <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700">
                      Enregistrer
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-300 text-black p-2 rounded hover:bg-gray-400"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MedicamentsPage;
