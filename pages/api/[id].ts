// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://yoounvoicycbdpqdwyxa.supabase.co',
  'votre-clé-api'
);

export const updateCommandeEtat = async (commandeId: number, newEtat: string): Promise<{ success: boolean, data?: any, message?: string }> => {
  try {
    const { data, error } = await supabase
      .from('commandes')
      .update({ etat: newEtat })
      .eq('id', commandeId);

    if (error) {
      console.error('Erreur lors de la mise à jour:', error.message);
      return { success: false, message: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Erreur:', err);
    return { success: false, message: 'Erreur lors de la mise à jour' };
  }
};
