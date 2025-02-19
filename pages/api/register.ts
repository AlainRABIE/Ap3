import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'POST') {
      const { email, password, name } = req.body;
      console.log('Données reçues pour inscription:', { email, password, name });

      if (!email || !password || !name) {
        console.error('Tous les champs sont requis');
        return res.status(400).json({ message: 'Tous les champs sont requis' });
      }

      const { data: roleData, error: roleError } = await supabase
        .from('role')
        .select('id')
        .limit(1)
        .single();

      if (roleError || !roleData) {
        console.error('Le rôle par défaut n\'existe pas');
        return res.status(400).json({ message: 'Le rôle par défaut n\'existe pas' });
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Erreur d\'inscription:', error.message);
        return res.status(400).json({ message: error.message });
      }

      const { error: userError } = await supabase
        .from('User')
        .insert([{ email, name, roleid: roleData.id }]);

      if (userError) {
        console.error('Erreur lors de l\'ajout de l\'utilisateur dans la table:', userError.message);
        return res.status(400).json({ message: userError.message });
      }

      console.log('Inscription réussie');
      res.status(200).json({ message: 'Inscription réussie' });
    } else {
      res.status(405).json({ message: 'Méthode non autorisée' });
    }
  } catch (error) {
    console.error('Erreur serveur:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

export default handler;