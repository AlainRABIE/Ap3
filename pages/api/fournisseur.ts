import { supabase } from "@/lib/supabaseClient";

// Type pour un fournisseur
export type Fournisseur = {
  fournisseur_id: number;
  medicament_id: number;
  nom: string;
  adresse: string;
  email: string;
  telephone: string;
  site_web: string;
};

// Fonction pour récupérer tous les fournisseurs
export const getFournisseurs = async (): Promise<Fournisseur[]> => {
  const { data, error } = await supabase
    .from("fournisseur_medicament") // Assurez-vous que le nom de la table est correct
    .select("*");

  if (error) {
    console.error("Erreur lors de la récupération des fournisseurs:", error.message);
    return [];
  }

  return data || [];
};

// Fonction pour ajouter un fournisseur
export const addFournisseur = async (fournisseur: Fournisseur): Promise<Fournisseur | null> => {
  const { data, error } = await supabase
    .from("fournisseur_medicament") // Assurez-vous que le nom de la table est correct
    .insert([fournisseur]);

  if (error) {
    console.error("Erreur lors de l'ajout du fournisseur:", error.message);
    return null;
  }

  return data ? data[0] : null; // Retourne le fournisseur ajouté
};

// Fonction pour supprimer un fournisseur
export const deleteFournisseur = async (fournisseur_id: number): Promise<boolean> => {
  const { error } = await supabase
    .from("fournisseur_medicament") // Assurez-vous que le nom de la table est correct
    .delete()
    .eq("fournisseur_id", fournisseur_id);

  if (error) {
    console.error("Erreur lors de la suppression du fournisseur:", error.message);
    return false;
  }

  return true;
};

// Fonction pour mettre à jour un fournisseur
export const updateFournisseur = async (
  fournisseur_id: number,
  updatedData: Partial<Fournisseur>
): Promise<Fournisseur | null> => {
  const { data, error } = await supabase
    .from("fournisseur_medicament") // Assurez-vous que le nom de la table est correct
    .update(updatedData)
    .eq("fournisseur_id", fournisseur_id);

  if (error) {
    console.error("Erreur lors de la mise à jour du fournisseur:", error.message);
    return null;
  }

  return data ? data[0] : null;
};

// Fonction pour récupérer un fournisseur par son ID
export const getFournisseurById = async (fournisseur_id: number): Promise<Fournisseur | null> => {
  const { data, error } = await supabase
    .from("fournisseur_medicament") // Assurez-vous que le nom de la table est correct
    .select("*")
    .eq("fournisseur_id", fournisseur_id)
    .single();

  if (error) {
    console.error("Erreur lors de la récupération du fournisseur:", error.message);
    return null;
  }

  return data || null;
};
