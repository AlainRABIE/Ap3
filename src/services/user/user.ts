import { useState, useEffect } from "react";

export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchedUser = localStorage.getItem("user");
    if (fetchedUser) {
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
