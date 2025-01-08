import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import "../src/app/globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";

// Définir un type pour les commandes
type Commande = {
  id: number;
  produit_id: number;
  quantite: number;
  statut: string;
  etat: string;
};

const CommandesEnAttente = () => {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCommandesEnAttente = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("commandes") // Nom de la table dans Supabase
          .select("id, produit_id, quantite, statut, etat") // Utilisation des bonnes colonnes
          .eq("statut", "En attente"); // Filtrer uniquement les commandes "En attente"

        if (error) throw new Error(error.message);

        if (Array.isArray(data)) {
          setCommandes(data as Commande[]);
        } else {
          console.error("Les données récupérées ne sont pas sous forme de tableau.");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des commandes :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommandesEnAttente();
  }, []);

  return (
    <SidebarProvider>
      <div className="flex">
        <AppSidebar />

        <div className="container mx-auto p-4 flex-1">
          <h1 className="text-2xl font-bold mb-4">Commandes en Attente</h1>

          {loading ? (
            <p>Chargement des commandes...</p>
          ) : commandes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-4 py-2 border-b">Produit</th>
                    <th className="px-4 py-2 border-b">Quantité</th>
                    <th className="px-4 py-2 border-b">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {commandes.map((commande) => (
                    <tr key={commande.id} className="hover:bg-gray-100">
                      <td className="px-4 py-2 border-b">{commande.produit_id}</td> {/* Affichez l'id du produit ou faites une jointure pour obtenir le nom */}
                      <td className="px-4 py-2 border-b">{commande.quantite}</td>
                      <td className="px-4 py-2 border-b">{commande.statut}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Aucune commande en attente trouvée.</p>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CommandesEnAttente;
