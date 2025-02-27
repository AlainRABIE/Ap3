import { supabase } from "@/lib/supabaseClient";

export type Fournisseur = {
  fournisseur_id: number;
  medicament_id: number;
  nom: string;
  adresse: string;
  email: string;
  telephone: string;
  site_web: string;
};

export const getFournisseurs = async (): Promise<Fournisseur[]> => {
  const { data, error } = await supabase
    .from("fournisseur_medicament") 
    .select("*");

  if (error) {
    console.error("Erreur lors de la récupération des fournisseurs:", error.message);
    return [];
  }

  return data || [];
};

export const addFournisseur = async (fournisseur: Fournisseur): Promise<Fournisseur | null> => {
  const { data, error } = await supabase
    .from("fournisseur_medicament") 
    .insert([fournisseur]);

  if (error) {
    console.error("Erreur lors de l'ajout du fournisseur:", error.message);
    return null;
  }

  return data ? data[0] : null; 
};

export const deleteFournisseur = async (fournisseur_id: number): Promise<boolean> => {
  const { error } = await supabase
    .from("fournisseur_medicament")
    .delete()
    .eq("fournisseur_id", fournisseur_id);

  if (error) {
    console.error("Erreur lors de la suppression du fournisseur:", error.message);
    return false;
  }

  return true;
};

export const updateFournisseur = async (
  fournisseur_id: number,
  updatedData: Partial<Fournisseur>
): Promise<Fournisseur | null> => {
  const { data, error } = await supabase
    .from("fournisseur_medicament") 
    .update(updatedData)
    .eq("fournisseur_id", fournisseur_id);

  if (error) {
    console.error("Erreur lors de la mise à jour du fournisseur:", error.message);
    return null;
  }

  return data ? data[0] : null;
};

export const getFournisseurById = async (fournisseur_id: number): Promise<Fournisseur | null> => {
  const { data, error } = await supabase
    .from("fournisseur_medicament")
    .select("*")
    .eq("fournisseur_id", fournisseur_id)
    .single();

  if (error) {
    console.error("Erreur lors de la récupération du fournisseur:", error.message);
    return null;
  }

  return data || null;
};
