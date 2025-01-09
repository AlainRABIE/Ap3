import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialisation de Supabase avec les variables d'environnement
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const Page = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Récupérez les données de la table 'commandes'
      const { data, error } = await supabase
        .from('commandes')  // Nom de la table
        .select('*');  // Sélectionne toutes les colonnes (vous pouvez être plus spécifique si nécessaire)

      if (error) {
        console.error('Erreur lors de la récupération des données:', error);
      } else {
        setData(data);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Liste des Commandes</h1>
      <table>
        <thead>
          <tr>
            <th>ID Commande</th>
            <th>ID Utilisateur</th>
            <th>ID Produit</th>
            <th>Quantité</th>
            <th>État</th>
            <th>Date de Création</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.user_id}</td>
              <td>{item.produit_id}</td>
              <td>{item.quantite}</td>
              <td>{item.etat}</td>
              <td>{new Date(item.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Page;
