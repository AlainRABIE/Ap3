import { NextApiRequest, NextApiResponse } from 'next';
import { parseCookies } from 'nookies';
import { supabase } from '@/lib/supabaseClient';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Méthode non autorisée' });
    }

    // Utilisez nookies pour récupérer les cookies
    const cookies = parseCookies({ req });
    const token = cookies.supabaseToken;
    console.log('Token reçu:', token);
    if (!token) {
      console.error('Token d\'accès manquant');
      return res.status(401).json({ message: 'Token d\'accès manquant' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) {
      console.error('Erreur de validation du token:', error.message);
      return res.status(401).json({ message: 'Token d\'accès invalide' });
    }

    console.log('Utilisateur validé:', user);
    res.status(200).json(user);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Erreur serveur:', error.message);
      res.status(500).json({ message: 'Erreur interne du serveur', error: error.message });
    } else {
      console.error('Erreur serveur inconnue:', error);
      res.status(500).json({ message: 'Erreur interne du serveur' });
    }
  }
};

export default handler;
