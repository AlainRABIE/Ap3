import React, { useState, useEffect } from "react";

interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface EditProfileProps {
  userId: number;  // ID de l'utilisateur pour récupérer ses données
  onUpdate: (updatedUser: Partial<User>) => void;  // Mise à jour de l'utilisateur
}

const EditProfile: React.FC<EditProfileProps> = ({ userId, onUpdate }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the user data when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/user/${userId}`); // Utiliser l'ID de l'utilisateur pour récupérer ses données
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données utilisateur");
        }
        const data = await response.json();
        setUser(data);
        setIsLoading(false);  // Données chargées
      } catch (error) {
        setError("Impossible de charger les données utilisateur");
        setIsLoading(false);  // Erreur ou données chargées
      }
    };

    fetchUserData();
  }, [userId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      onUpdate({ name: user.name, email: user.email });
      alert("Profil mis à jour !");
    }
  };

  // Affichage du message de chargement
  if (isLoading) {
    return <p>Chargement des informations utilisateur...</p>;
  }

  // Affichage d'une erreur si elle existe
  if (error) {
    return <p>{error}</p>;
  }

  // Si le profil n'est pas disponible
  if (!user) {
    return <p>Impossible de trouver l'utilisateur.</p>;
  }

  return (
    <div className="edit-profile max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h1 className="text-xl font-bold mb-4">Modifier le profil</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="name">
            Nom
          </label>
          <input
            type="text"
            id="name"
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        >
          Sauvegarder les modifications
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
