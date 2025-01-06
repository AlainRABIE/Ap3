import { supabase } from '@/lib/supabaseClient';

interface Medicament {
  id: number;
  name: string;
  description: string;
  posologie: string;
  maladies_non_compatibles: string[];
}

export const AffichStock = async (): Promise<Medicament[]> => {
  const { data, error } = await supabase
    .from('medicaments')
    .select('*');

  if (error) {
    console.error('Error fetching medicaments:', error);
    return [];
  }

  return data || [];
};

export const AjouterMedicament = async (medicament: Medicament): Promise<void> => {
  const { error } = await supabase
    .from('medicaments')
    .insert([medicament]);

  if (error) {
    console.error('Error adding medicament:', error);
  }
};

export const SupprimerMedicament = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('medicaments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting medicament:', error);
  }
};

export const ModifierMedicament = async (id: number, medicament: Partial<Medicament>): Promise<void> => {
  const { error } = await supabase
    .from('medicaments')
    .update(medicament)
    .eq('id', id);

  if (error) {
    console.error('Error updating medicament:', error);
  }
};