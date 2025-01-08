import { useEffect, useState } from "react";

// Type pour les commandes
type Commande = {
  id: number;
  produit: string;
  quantite: number;
  date: string;
  // Ajoute d'autres propriétés si nécessaire
};

// Type pour l'utilisateur
type User = {
  id: number;
  name: string;
  // Ajoute d'autres propriétés si nécessaire
};

export function useUser(): { user: User | null, error: Error | null } {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch("/api/user")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setUser(data))
      .catch((error) => setError(error));
  }, []);

  return { user, error };
}

export function useCommandes(userId: number): { commandes: Commande[] | null, error: Error | null } {
  const [commandes, setCommandes] = useState<Commande[] | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (userId) {
      fetch(`/api/commandes?user_id=${userId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => setCommandes(data))
        .catch((error) => setError(error));
    }
  }, [userId]);

  return { commandes, error };
}
