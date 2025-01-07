import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'POST') {
      const { email, password } = req.body;
      console.log('Reçu côté serveur pour connexion:', { email, password });

      if (!email || !password) {
        console.error('Email ou mot de passe manquant pour la connexion');
        return res.status(400).json({ message: 'Email et mot de passe sont requis pour la connexion' });
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Informations de connexion incorrectes:', error.message);
        return res.status(401).json({ message: 'Informations de connexion incorrectes' });
      }

      console.log('Connexion réussie:', data.user);
      res.status(200).json({ message: 'Connexion réussie', user: data.user });
    } else {
      console.error('Méthode non autorisée');
      res.status(405).json({ message: 'Méthode non autorisée' });
    }
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
