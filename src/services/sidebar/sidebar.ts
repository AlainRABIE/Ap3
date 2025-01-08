import { useEffect, useState } from "react";

type User = {
  id: number;
  email: string;
  nom: string;
  created_at: string;
  updated_at: string;
  // Ajoute d'autres propriétés utilisateur si nécessaire
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
