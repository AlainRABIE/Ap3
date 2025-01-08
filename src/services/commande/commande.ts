// services/commandeService.ts

import { supabase } from "@/lib/supabaseClient"; // Assurez-vous que ce chemin est correct

// Définition de l'interface Commande
interface Commande {
  id: number; // L'ID sera généré par Supabase
  user_id: number;
  fournisseur_id: number;
  produit_id: number;
  quantite: number;
  statut: string;
  etat: string;
}

// Méthode pour ajouter une commande
export const addCommande = async (
  commande: Omit<Commande, 'id'> // On omet 'id' car il sera généré automatiquement par Supabase
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { data, error } = await supabase.from("commandes").insert([commande]);

    if (error) {
      console.error("Erreur lors de l'ajout de la commande :", error.message);
      return { success: false, error: error.message };
    }

    console.log("Commande ajoutée avec succès :", data);
    return { success: true, error: null };
  } catch (error) {
    console.error("Une erreur est survenue lors de l'ajout de la commande :", error);
    return { success: false, error: error instanceof Error ? error.message : "Erreur inconnue" };
  }
};

// Méthode pour récupérer toutes les commandes
export const getCommandes = async (): Promise<Commande[]> => {
  try {
    const { data, error } = await supabase.from("commandes").select("*");

    if (error) {
      console.error("Erreur lors de la récupération des commandes :", error.message);
      return [];
    }

    console.log("Commandes récupérées :", data);
    return data as Commande[]; // Typecasting explicite pour s'assurer que 'data' correspond à un tableau de Commande
  } catch (error) {
    console.error("Une erreur est survenue lors de la récupération des commandes :", error);
    return [];
  }
};
