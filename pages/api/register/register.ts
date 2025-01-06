import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'POST') {
      const { email, password } = req.body;
      console.log('Reçu côté serveur pour inscription:', { email, password });

      // Vérifiez si les données d'inscription sont fournies
      if (!email || !password) {
        console.error('Email ou mot de passe manquant pour l\'inscription');
        return res.status(400).json({ message: 'Email et mot de passe sont requis pour l\'inscription' });
      }

      // Stockez les informations d'inscription dans Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Erreur d\'inscription:', error.message);
        return res.status(400).json({ message: error.message });
      }

      console.log('Utilisateur inscrit:', data.user);
      res.status(200).json({ message: 'Inscription réussie', user: data.user });
    } else {
      console.error('Méthode non autorisée');
      res.status(405).json({ message: 'Méthode non autorisée' });
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Erreur serveur:', error.message); // Affiche le message d'erreur
      res.status(500).json({ message: 'Erreur interne du serveur', error: error.message });
    } else {
      console.error('Erreur serveur inconnue:', error); // Affiche l'erreur inconnue
      res.status(500).json({ message: 'Erreur interne du serveur' });
    }
  }
};

export default handler;
