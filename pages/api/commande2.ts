import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('commande_materiel')
        .select('*')
        .eq('etat', 'en attente');

      if (error) {
        throw error;
      }

      res.status(200).json(data);
    } catch (error) {
      const typedError = error as Error;
      res.status(500).json({ error: typedError.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Méthode ${req.method} non autorisée`);
  }
}
