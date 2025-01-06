// services/fournisseur.ts
import { supabase } from "@/lib/supabaseClient"; // Assure-toi que tu utilises la bonne configuration de Supabase

// Type pour les produits fournis par un fournisseur
export interface Produit {
  id: number;
  nom: string;
  description: string;
  prix: number;
}

// Type pour un fournisseur avec ses produits
export interface FournisseurWithProduits {
  id: number;
  nom: string;
  adresse: string;
  email: string;
  telephone: string;
  site_web: string;
  produits: Produit[];
}

// Fonction pour récupérer tous les fournisseurs et leurs produits
export const getAllFournisseurs = async (): Promise<FournisseurWithProduits[]> => {
  try {
    // Récupérer les fournisseurs avec leurs produits
    const { data: fournisseurs, error } = await supabase
      .from("fournisseur")
      .select("id, nom, adresse, email, telephone, site_web, produits(id, nom, description, prix)")
      .order("nom"); // Récupérer les données des produits en même temps

    if (error) {
      throw new Error(error.message);
    }

    return fournisseurs as FournisseurWithProduits[];
  } catch (error) {
    console.error("Erreur lors de la récupération des fournisseurs:", error);
    throw error;
  }
};
