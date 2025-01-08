// pages/historique-commandes.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // Assurez-vous que vous avez configuré Supabase
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";

interface Commande {
  id_historique: number;
  quantite: number;
  date_creation: string;
  medicament_nom: string;  // Nom du médicament
  commande_nom: string;    // Nom de la commande
}

const HistoriqueCommandes = () => {
  const [commandes, setCommandes] = useState<Commande[]>([]);

  useEffect(() => {
    const fetchCommandes = async () => {
      const { data, error } = await supabase
        .from("historique_commandes")
        .select(`
          id_historique,
          quantite,
          date_creation,
          medicaments:medicament_id(nom),
          commandes:commande_id(nom)
        `);

      if (error) {
        console.error("Erreur lors de la récupération des commandes:", error.message);
      } else {
        const commandesWithNames = data.map((commande: any) => ({
          ...commande,
          medicament_nom: commande.medicaments?.nom || "Nom non disponible",
          commande_nom: commande.commandes?.nom || "Nom non disponible",
        }));

        setCommandes(commandesWithNames);
      }
    };

    fetchCommandes();
  }, []);

  return (
    <div className="flex">
      <AppSidebar />
      <div className="flex-1 p-4">
        <h1 className="text-3xl font-semibold text-center mb-8">Historique des Commandes</h1>
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Commande</th>
              <th className="py-2 px-4 border-b">Médicament</th>
              <th className="py-2 px-4 border-b">Quantité</th>
              <th className="py-2 px-4 border-b">Date de création</th>
            </tr>
          </thead>
          <tbody>
            {commandes.map((commande) => (
              <tr key={commande.id_historique} className="hover:bg-gray-100">
                <td className="py-2 px-4 border-b">{commande.commande_nom}</td>
                <td className="py-2 px-4 border-b">{commande.medicament_nom}</td>
                <td className="py-2 px-4 border-b">{commande.quantite}</td>
                <td className="py-2 px-4 border-b">{new Date(commande.date_creation).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const HistoriqueCommandesPage = () => {
  return (
    <SidebarProvider>
      <HistoriqueCommandes />
    </SidebarProvider>
  );
};

export default HistoriqueCommandesPage;
