// pages/api/commandes.js

import { createClient } from '@supabase/supabase-js';

// Utilise les variables d'environnement définies dans ton fichier .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key:", supabaseKey ? "clé trouvée" : "clé non trouvée");

const supabase = createClient(supabaseUrl, supabaseKey);

export default async (req, res) => {
  console.log("Requête reçue pour les commandes");

  if (!supabaseUrl || !supabaseKey) {
    console.error("Les variables d'environnement Supabase ne sont pas définies correctement.");
    return res.status(500).json({ error: "Supabase configuration error" });
  }

  const { user_id } = req.query;

  try {
    const { data, error } = await supabase
      .from('Commandes')
      .select('*')
      .eq('user_id', user_id); // Récupère les commandes associées à l'utilisateur

    if (error) {
      console.error("Erreur lors de la récupération des commandes :", error.message);
      return res.status(500).json({ error: error.message });
    }

    console.log("Commandes récupérées avec succès :", data);
    res.status(200).json(data);
  } catch (e) {
    console.error("Erreur lors de l'exécution de la requête :", e.message);
    res.status(500).json({ error: e.message });
  }
};
