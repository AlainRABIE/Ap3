// import { createClient } from '@supabase/supabase-js';

// const supabase = createClient('https://yoounvoicycbdpqdwyxa.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlvb3Vudm9pY3ljYmRwcWR3eXhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwMTg4NzAsImV4cCI6MjA0OTU5NDg3MH0.2_EGFXaReYh0qCqVx17KB-dzuaEx_BT9YcykIUhvEls');

// export const updateStock = async (produitId: number, quantity: number): Promise<{ success: boolean, message?: string }> => {
//   try {
//     const { data, error } = await supabase
//       .from('produits')
//       .update({
//         stock: supabase.rpc('update_stock', {
//           produit_id: produitId,
//           quantity: -quantity
//         })
//       })
//       .eq('id', produitId);

//     if (error) {
//       console.error('Erreur lors de la mise à jour du stock:', error.message);
//       return { success: false, message: error.message };
//     }

//     return { success: true, message: 'Stock mis à jour avec succès' };
//   } catch (err) {
//     console.error('Erreur:', err);
//     return { success: false, message: 'Erreur lors de la mise à jour du stock' };
//   }
// };

// export const revertStock = async (produitId: number, quantity: number): Promise<{ success: boolean, message?: string }> => {
//   try {
//     const { data, error } = await supabase
//       .from('produits')
//       .update({
//         stock: supabase.rpc('update_stock', {
//           produit_id: produitId,
//           quantity: quantity
//         })
//       })
//       .eq('id', produitId);

//     if (error) {
//       console.error('Erreur lors du rétablissement du stock:', error.message);
//       return { success: false, message: error.message };
//     }

//     return { success: true, message: 'Stock rétabli avec succès' };
//   } catch (err) {
//     console.error('Erreur:', err);
//     return { success: false, message: 'Erreur lors du rétablissement du stock' };
//   }
// };
