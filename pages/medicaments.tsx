import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import "../src/app/globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";

// Définir un type pour les médicaments
type Medicament = {
  id: number;
  name: string;
  description: string;
  posologie: string;
  maladies_non_compatibles: string;
};

const MedicamentsPage = () => {
  const [medicaments, setMedicaments] = useState<Medicament[]>([]); // Typage explicite
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
      try {
        const { data, error } = await supabase
          .from("medicaments")
          .select("id, name, description, posologie, maladies_non_compatibles");

        if (error) {
          throw new Error(error.message);
        }

        // Vérifier explicitement que 'data' est un tableau de médicaments
        if (Array.isArray(data)) {
          setMedicaments(data);
        } else {
          throw new Error("Les données récupérées ne sont pas sous forme de tableau.");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des médicaments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicaments();
  }, []);

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer ce médicament ?");

    if (confirmDelete) {
      try {
        const { data, error } = await supabase
          .from("medicaments")
          .delete()
          .eq("id", id);

        if (error) {
          throw new Error(`Erreur lors de la suppression : ${error.message}`);
        }

        // Vérification de 'data' pour qu'il soit un tableau avant d'utiliser 'length'
        if (Array.isArray(data) && data.length > 0) {
          setMedicaments((prevMedicaments) =>
            prevMedicaments.filter((medicament) => medicament.id !== id)
          );
          alert("Médicament supprimé avec succès.");
        } else {
          alert("Aucun médicament trouvé avec cet ID.");
        }
      } catch (error) {
        console.error("Erreur lors de la suppression du médicament:", error);
        alert(`Erreur lors de la suppression du médicament : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }
    }
  };

  const handleDetail = (medicament: Medicament) => {
    setSelectedMedicament(medicament);
  };

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

    try {
      const { data, error } = await supabase
        .from("medicaments")
        .update(formData)
        .eq("id", selectedMedicament!.id);

      if (error) {
        throw new Error(error.message);
      }

      // Mettre à jour la liste des médicaments après modification
      setMedicaments((prevMedicaments) =>
        prevMedicaments.map((medicament) =>
          medicament.id === selectedMedicament!.id ? { ...medicament, ...formData } : medicament
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
                    <th className="px-4 py-2 border-b">ID</th>
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
                      <td className="px-4 py-2 border-b">{medicament.id}</td>
                      <td className="px-4 py-2 border-b">{medicament.name}</td>
                      <td className="px-4 py-2 border-b">{medicament.description}</td>
                      <td className="px-4 py-2 border-b">{medicament.posologie}</td>
                      <td className="px-4 py-2 border-b">{medicament.maladies_non_compatibles}</td>
                      <td className="px-4 py-2 border-b">
                        <button 
                          onClick={() => handleDetail(medicament)} 
                          className="text-blue-500 hover:text-blue-700 mr-2">
                          Détail
                        </button>
                        <button 
                          onClick={() => handleEdit(medicament)} 
                          className="text-green-500 hover:text-green-700">
                          Modifier
                        </button>
                        <button 
                          onClick={() => handleDelete(medicament.id)} 
                          className="text-red-500 hover:text-red-700 ml-2">
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Formulaire Détail */}
          {selectedMedicament && !isEditing && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Détails du Médicament</h2>
              <p><strong>Nom:</strong> {selectedMedicament.name}</p>
              <p><strong>Description:</strong> {selectedMedicament.description}</p>
              <p><strong>Posologie:</strong> {selectedMedicament.posologie}</p>
              <p><strong>Maladies non compatibles:</strong> {selectedMedicament.maladies_non_compatibles}</p>
            </div>
          )}

          {/* Formulaire Modifier */}
          {isEditing && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Modifier le Médicament</h2>
              <form onSubmit={handleFormSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium">Nom</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium">Posologie</label>
                  <input
                    type="text"
                    value={formData.posologie}
                    onChange={(e) => setFormData({ ...formData, posologie: e.target.value })}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium">Maladies non compatibles</label>
                  <input
                    type="text"
                    value={formData.maladies_non_compatibles}
                    onChange={(e) => setFormData({ ...formData, maladies_non_compatibles: e.target.value })}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <button 
                  type="submit" 
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700">
                  Enregistrer les modifications
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MedicamentsPage;
