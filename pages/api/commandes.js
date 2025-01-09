import { supabase } from "@/lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, type, articleId, quantité } = req.body;

    const { data, error } = await supabase
      .from('commandes')
      .insert([
        {
          userId,
          type,
          articleId,
          quantité,
          statut: 'en attente',
          dateCommande: new Date().toISOString(),
        },
      ]);

    if (error) {
      return res.status(400).json({ message: 'Erreur lors de la commande', error });
    }

    res.status(200).json({ message: 'Commande passée avec succès', data });
  } else {
    res.status(405).json({ message: 'Méthode non autorisée' });
  }
}
