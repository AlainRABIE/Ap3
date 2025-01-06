// pages/api/order.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialiser le client Supabase
const supabase = createClient(
  'https://your-project-url.supabase.co', // Remplace par ton URL Supabase
  'public-anon-key' // Remplace par ta clé publique
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, produit, quantite } = req.body;

    // Ajouter la commande dans la base de données
    try {
      const { data, error } = await supabase
        .from('commandes')
        .insert([
          {
            user_id: userId,
            produit: produit,
            quantite: quantite,
            status: 'En attente',
          },
        ]);

      if (error) {
        throw error;
      }

      res.status(201).json(data); // Retourne les données de la commande créée
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la création de la commande' });
    }
  } else {
    res.status(405).json({ error: 'Méthode HTTP non autorisée' });
  }
}
