// // pages/api/commandes.ts
// import { NextApiRequest, NextApiResponse } from 'next';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method === 'GET') {
//     try {
//       const commandes = await prisma.commande_médicaments.findMany({
//         orderBy: {
//           date_commande: 'desc',
//         },
//       });
//       res.status(200).json(commandes);
//     } catch (error) {
//       res.status(500).json({ error: 'Erreur lors de la récupération des commandes' });
//     }
//   } 
//   else if (req.method === 'POST') {
//     try {
//       const commande = await prisma.commande_médicaments.create({
//         data: {
//           ...req.body,
//           date_commande: new Date(),
//         },
//       });
//       res.status(201).json(commande);
//     } catch (error) {
//       res.status(500).json({ error: 'Erreur lors de la création de la commande' });
//     }
//   }
//   else {
//     res.setHeader('Allow', ['GET', 'POST']);
//     res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }

// // pages/api/commandes/[id].ts
// import { NextApiRequest, NextApiResponse } from 'next';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   const { id } = req.query;
//   const commandeId = parseInt(id as string);

//   if (req.method === 'PUT') {
//     try {
//       const commande = await prisma.commande_médicaments.update({
//         where: { id_commande: commandeId },
//         data: req.body,
//       });
//       res.status(200).json(commande);
//     } catch (error) {
//       res.status(500).json({ error: 'Erreur lors de la mise à jour de la commande' });
//     }
//   }
//   else if (req.method === 'DELETE') {
//     try {
//       await prisma.commande_médicaments.delete({
//         where: { id_commande: commandeId },
//       });
//       res.status(204).end();
//     } catch (error) {
//       res.status(500).json({ error: 'Erreur lors de la suppression de la commande' });
//     }
//   }
//   else {
//     res.setHeader('Allow', ['PUT', 'DELETE']);
//     res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }