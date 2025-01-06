// pages/api/register/register.ts
import { supabase } from '@/lib/supabaseClient';

export const register = async (email: string, password: string, name: string) => {
  // Appel à l'API Spabase pour s'inscrire
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  // Vérification de l'erreur
  if (error) {
    throw new Error(error.message); // Si une erreur est présente
  }

  // Si pas d'erreur, on poursuit
  const { error: insertError } = await supabase
    .from('User')
    .insert([{ email, name }]);

  // Vérification de l'erreur d'insertion dans la table User
  if (insertError) {
    throw new Error(insertError.message); // Si erreur
  }

  return data; // Retourne les données de l'utilisateur
};
