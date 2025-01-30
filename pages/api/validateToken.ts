// import { NextApiRequest, NextApiResponse } from 'next';
// import { parseCookies, setCookie, destroyCookie } from 'nookies';
// import { supabase } from '@/lib/supabaseClient';
// import jwt from 'jsonwebtoken';

// const handler = async (req: NextApiRequest, res: NextApiResponse) => {
//   try {
//     if (req.method !== 'GET') {
//       return res.status(405).json({ message: 'Méthode non autorisée' });
//     }

//     const cookies = parseCookies({ req });
//     let token = cookies.supabaseToken;
//     console.log('Token reçu:', token);

//     if (!token) {
//       console.error('Token d\'accès manquant');
//       return res.status(401).json({ message: 'Token d\'accès manquant' });
//     }

//     const decodedToken = jwt.decode(token) as { exp: number };
//     const isTokenExpired = decodedToken.exp * 1000 < Date.now();

//     if (isTokenExpired) {
//       console.log('Token expiré, tentative de rafraîchissement...');
//       const { data: { session }, error: refreshError } = await supabase.auth.refreshSession({ refresh_token: cookies.refreshToken });
//       if (refreshError || !session) {
//         console.error('Erreur lors du rafraîchissement du token:', refreshError?.message);
//         destroyCookie({ res }, 'supabaseToken');
//         destroyCookie({ res }, 'refreshToken');
//         return res.status(401).json({ message: 'Token d\'accès invalide' });
//       }

//       setCookie({ res }, 'supabaseToken', session.access_token, {
//         maxAge: 60 * 60 * 24 * 7, 
//         path: '/',
//       });

//       // setCookie({ res }, 'refreshToken', session.refresh_token, {
//       //   maxAge: 60 * 60 * 24 * 7, 
//       //   path: '/',
//       // });

//       console.log('Token rafraîchi avec succès');
//       token = session.access_token;
//     }

//     const { data: { user }, error } = await supabase.auth.getUser(token);
//     if (error) {
//       console.error('Erreur de validation du token:', error.message);
//       return res.status(401).json({ message: 'Token d\'accès invalide' });
//     }

//     console.log('Utilisateur validé:', user);
//     res.status(200).json(user);
//   } catch (error) {
//     if (error instanceof Error) {
//       console.error('Erreur serveur:', error.message);
//       res.status(500).json({ message: 'Erreur interne du serveur', error: error.message });
//     } else {
//       console.error('Erreur serveur inconnue:', error);
//       res.status(500).json({ message: 'Erreur interne du serveur' });
//     }
//   }
// };

// export default handler;