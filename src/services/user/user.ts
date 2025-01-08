import { useEffect, useState } from "react";

type User = {
  nom: string;
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
