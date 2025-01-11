import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient'; // Assure-toi que tu as configuré Supabase dans ce fichier

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'POST') {
      const { email, password, name, role } = req.body;
      console.log('Données reçues côté serveur:', { email, password, name, role });

      // Vérification des données requises
      if (!email || !password || !name || !role) {
        return res.status(400).json({ message: 'Tous les champs sont requis.' });
      }

      // Inscription de l'utilisateur via Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        console.error('Erreur d\'inscription:', signUpError.message);
        return res.status(400).json({ message: signUpError.message });
      }

      // Insérer les informations supplémentaires dans la table 'users'
      const { error: insertError } = await supabase
        .from('users') // Remplace 'users' par le nom de ta table
        .insert([
          { email, name, role, user_id: data.user?.id } // Ajoute l'ID utilisateur de Supabase ici
        ]);

      if (insertError) {
        console.error('Erreur d\'insertion dans la table users:', insertError.message);
        return res.status(400).json({ message: insertError.message });
      }

      console.log('Utilisateur inscrit avec succès:', data.user);
      res.status(200).json({ message: 'Inscription réussie', user: data.user });

    } else {
      return res.status(405).json({ message: 'Méthode non autorisée' });
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Erreur serveur:', error.message);
      res.status(500).json({ message: 'Erreur interne du serveur', error: error.message });
    } else {
      console.error('Erreur inconnue:', error);
      res.status(500).json({ message: 'Erreur interne du serveur' });
    }
  }
};

export default handler;
