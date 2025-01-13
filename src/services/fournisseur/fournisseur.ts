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

export const checkIfAdmin = async (userId: string) => {
  try {
    const { data: userData, error } = await supabase
      .from("user")
      .select(`
        id,
        role:roleid (
          name
        )
      `)
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Erreur lors de la récupération de l'utilisateur", error);
      return false;
    }

    return userData?.role?.name === "admin";
  } catch (error) {
    console.error("Erreur lors de la vérification du rôle administrateur", error);
    return false;
  }
};

export const addFournisseur = async (formData: any) => {
  try {
    const { error } = await supabase.from("fournisseur").insert([{
      nom: formData.nom,
      adresse: formData.adresse,
      email: formData.email,
      telephone: formData.telephone,
      site_web: formData.site_web,
    }]);
    
    if (error) throw error;
  } catch (error) {
    console.error("Erreur lors de l'ajout du fournisseur", error);
  }
};

export const updateFournisseur = async (formData: any) => {
  try {
    if (!formData.id) throw new Error("ID du fournisseur manquant");

    const { error } = await supabase
      .from("fournisseur")
      .update({
        nom: formData.nom,
        adresse: formData.adresse,
        email: formData.email,
        telephone: formData.telephone,
        site_web: formData.site_web,
      })
      .eq("id", formData.id);
    
    if (error) throw error;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du fournisseur", error);
  }
};

export const deleteFournisseur = async (id: number) => {
  try {
    const { error } = await supabase
      .from("fournisseur")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
  } catch (error) {
    console.error("Erreur lors de la suppression du fournisseur", error);
  }
};
