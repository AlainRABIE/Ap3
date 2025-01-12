import { supabase } from "@/lib/supabaseClient"; 

export interface Produit {
  id: number;
  nom: string;
  description: string;
  prix: number;
}

export interface FournisseurWithProduits {
  id: number;
  nom: string;
  adresse: string;
  email: string;
  telephone: string;
  site_web: string;
  produits: Produit[];
}

export const getAllFournisseurs = async (): Promise<FournisseurWithProduits[]> => {
  try {
    const { data: fournisseurs, error } = await supabase
      .from("fournisseur")
      .select("id, nom, adresse, email, telephone, site_web, produits(id, nom, description, prix)")
      .order("nom"); 

    if (error) {
      throw new Error(error.message);
    }

    return fournisseurs as FournisseurWithProduits[];
  } catch (error) {
    console.error("Erreur lors de la récupération des fournisseurs:", error);
    throw error;
  }
};
