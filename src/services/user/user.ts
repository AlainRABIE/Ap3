// services/user/user.ts
import { useState, useEffect } from "react";

// Hook personnalisé pour récupérer l'utilisateur connecté
export function useUser() {
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    // Simule la récupération des données de l'utilisateur (par exemple depuis localStorage)
    const fetchedUser = localStorage.getItem("user");
    if (fetchedUser) {
      // On peut aussi ajouter ici un traitement pour convertir la donnée si nécessaire (ex. JSON.parse)
      setUser(JSON.parse(fetchedUser));
    }
  }, []);

  return user;
}

export async function updateUserProfile(data: { firstName: string; lastName: string; email: string }) {
  try {
    const response = await fetch("/api/update-profile", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la mise à jour du profil");
    }

    const updatedUser = await response.json();
    return updatedUser;
  } catch (error) {
    console.error("Erreur de mise à jour du profil:", error);
    throw error;
  }
}
