import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient"; 
import MenubarRe from "../components/ui/MenuBarRe";

interface Commande {
  id_historique: number;
  quantite: number;
  date_creation: string;
  medicament_nom: string;  
  commande_nom: string;    
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
    <div className="relative flex h-screen bg-gray-800">
      <div className="animated-background"></div>
      <div className="waves"></div>
      <MenubarRe />
      <main className="main-content flex-1 p-8 overflow-auto">
        <h1 className="text-4xl font-bold mb-6 text-white">Historique des Commandes</h1>
        <table className="min-w-full table-auto mb-4">
          <thead>
            <tr>
              <th className="px-4 py-2 border">ID Historique</th>
              <th className="px-4 py-2 border">Nom du Médicament</th>
              <th className="px-4 py-2 border">Nom de la Commande</th>
              <th className="px-4 py-2 border">Quantité</th>
              <th className="px-4 py-2 border">Date de Création</th>
            </tr>
          </thead>
          <tbody>
            {commandes.map((commande) => (
              <tr key={commande.id_historique}>
                <td className="px-4 py-2 border">{commande.id_historique}</td>
                <td className="px-4 py-2 border">{commande.medicament_nom}</td>
                <td className="px-4 py-2 border">{commande.commande_nom}</td>
                <td className="px-4 py-2 border">{commande.quantite}</td>
                <td className="px-4 py-2 border">{new Date(commande.date_creation).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default HistoriqueCommandes;