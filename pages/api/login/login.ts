import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      const { email, password } = req.body;
      console.log('Reçu:', { email, password }); // Log des valeurs reçues

      // Vérifie si les données de connexion sont fournies
      if (!email || !password) {
        return res.status(400).json({ message: 'Email et mot de passe sont requis' });
      }

      // Vérifie si les données de connexion sont correctes
      if (email === 'admin@example.com' && password === 'password123') {
        res.status(200).json({ message: 'Connexion réussie' });
      } else {
        res.status(401).json({ message: 'Informations de connexion incorrectes' });
      }
    } else {
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
}