import { useEffect, useState } from 'react';
import { AffichStock, SupprimerMedicament, ModifierMedicament } from '@/services/medicaments/medicaments';
import "@/styles/page.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

interface Medicament {
  id: number;
  name: string;
  description: string;
  posologie: string;
  maladies_non_compatibles: string[];
}

export default function Page() {
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getMedicaments = async () => {
      const data = await AffichStock();
      setMedicaments(data);
      setLoading(false);
    };

    getMedicaments();
  }, []);

  const handleDelete = async (id: number) => {
    await SupprimerMedicament(id);
    setMedicaments(medicaments.filter(medicament => medicament.id !== id));
  };

  const handleEdit = (id: number) => {
    // Logique pour modifier le médicament
    console.log(`Modifier le médicament avec l'ID: ${id}`);
  };

  return (
    <SidebarProvider>
      <div className="flex">
        <AppSidebar />
        <main className="flex-1 p-4">
          <div className="wave-container">
            <div className="wave"></div>
          </div>
          <div className="center-content">
            <section className="mb-8">
              <h1 className="text-3xl font-bold mb-4">Liste des Médicaments</h1>
              {loading ? (
                <p>Chargement...</p>
              ) : (
                <ul className="list-disc list-inside">
                  {medicaments.map((medicament) => (
                    <li key={medicament.id} className="mb-4 flex items-center">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold">{medicament.name}</h2>
                        <p>{medicament.description}</p>
                        <p><strong>Posologie :</strong> {medicament.posologie}</p>
                        <p><strong>Maladies non compatibles :</strong> {medicament.maladies_non_compatibles.join(', ')}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => handleEdit(medicament.id)} className="text-blue-500 hover:text-blue-700">
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button onClick={() => handleDelete(medicament.id)} className="text-red-500 hover:text-red-700">
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}