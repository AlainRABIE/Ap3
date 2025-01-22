import { supabase } from "@/lib/supabaseClient";

export const fetchFournisseurs = async () => {
  try {
    const { data, error } = await supabase
      .from("fournisseur")
      .select("*")
      .order('nom', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des fournisseurs", error);
    return [];
  }
};

export const fetchFournisseurById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("fournisseur")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error("Erreur lors de la récupération du fournisseur", error);
    return null;
  }
};

export const createFournisseur = async (fournisseur: any) => {
  try {
    const { data, error } = await supabase
      .from("fournisseur")
      .insert([fournisseur]);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erreur lors de la création du fournisseur", error);
    return null;
  }
};

export const updateFournisseur = async (id: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from("fournisseur")
      .update(updates)
      .eq("id", id);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du fournisseur", error);
    return null;
  }
};

export const deleteFournisseur = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("fournisseur")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erreur lors de la suppression du fournisseur", error);
    return null;
  }
};
