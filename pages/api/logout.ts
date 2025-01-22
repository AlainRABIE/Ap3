 import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      res.setHeader('Set-Cookie', 'session=; Path=/; HttpOnly; Secure; Max-Age=0;');

      res.status(200).json({ message: 'Déconnexion réussie' });
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error);
      res.status(500).json({ error: 'Erreur lors de la déconnexion' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
}