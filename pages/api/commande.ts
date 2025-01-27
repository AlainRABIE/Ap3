// import { supabase } from "@/lib/supabaseClient"; 

// // Types pour Commande et HistoriqueCommande
// interface Commande {
//   id_commande: number;
//   etat: 'en attente' | 'Accepté' | 'Refusée';
//   id_user: number;
//   id_medicament: number;
//   id_mouvement: number;
//   quantite: number;
//   date_commande: string;
// }

// interface HistoriqueCommande {
//   id_commande: number;
//   id_medicament: number;
//   quantite: number;
//   date_creation: string;
//   id_materiel?: number;
// }

// export async function handleCommandeTransfer(commandeId: number, newStatus: 'Accepté' | 'Refusée') {
//   try {
//     const { data, error: updateError } = await supabase
//       .from<Commande>('commande')
//       .update({ etat: newStatus })
//       .eq('id_commande', commandeId);

//     if (updateError) {
//       throw new Error(`Erreur lors de la mise à jour de l'état de la commande : ${updateError.message}`);
//     }

//     const updatedCommande = data![0]; // Récupérer la commande mise à jour

//     // 2. Déplacement de la commande dans l'historique
//     const { error: historiqueError } = await supabase
//       .from<HistoriqueCommande>('historique_commandes')
//       .insert([
//         {
//           id_commande: updatedCommande.id_commande,
//           id_medicament: updatedCommande.id_medicament,
//           quantite: updatedCommande.quantite,
//           date_creation: new Date().toISOString(),
//           id_materiel: updatedCommande.id_mouvement, // Ajout d'un matériel si applicable
//         },
//       ]);

//     if (historiqueError) {
//       throw new Error(`Erreur lors du déplacement de la commande dans l'historique : ${historiqueError.message}`);
//     }

//     // 3. Suppression de la commande de la table 'commande'
//     const { error: deleteError } = await supabase
//       .from('commande')
//       .delete()
//       .eq('id_commande', commandeId);

//     if (deleteError) {
//       throw new Error(`Erreur lors de la suppression de la commande : ${deleteError.message}`);
//     }

//     return { message: 'Commande mise à jour et déplacée avec succès.' };
//   } catch (error) {
//     console.error(error);
//     return { error: error.message };
//   }
// }
