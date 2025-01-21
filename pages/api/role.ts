import { supabase } from "@/lib/supabaseClient";

export const getUserRole = async (userId: number) => { 
  try {
    const { data, error } = await supabase
      .from("User")
      .select("roleid")
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error("Erreur lors de la récupération du rôle dans la table User :", error);
      return null;
    }

    const { data: roleData, error: roleError } = await supabase
      .from("role")
      .select("name")
      .eq("id", data.roleid)
      .single();

    if (roleError || !roleData) {
      console.error("Erreur lors de la récupération du nom du rôle dans la table role :", roleError);
      return null;
    }

    return roleData.name;
  } catch (error) {
    console.error("Erreur inattendue lors de la récupération du rôle :", error);
    return null;
  }
};