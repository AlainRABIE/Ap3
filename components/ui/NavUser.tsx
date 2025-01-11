import React from "react";
import { useRouter } from "next/router";

interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface NavUserProps {
  user: User; 
}

const NavUser: React.FC<NavUserProps> = ({ user }) => {
  const router = useRouter();

  const handleEditProfile = () => {
    router.push("/profile/edit");
  };

  return (
    <div className="nav-user bg-gray-100 p-4 rounded-md shadow-lg">
      <p className="font-bold text-lg mb-2">Bienvenue, {user.name}!</p>
      <p><strong>Nom :</strong> {user.name}</p>
      <p><strong>Email :</strong> {user.email}</p>
      <p><strong>Compte créé le :</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
      <p><strong>Dernière mise à jour :</strong> {new Date(user.updatedAt).toLocaleDateString()}</p>

      <div className="mt-4">
        <button 
          onClick={handleEditProfile}
          className="text-blue-500 hover:underline font-medium"
        >
          Modifier le profil
        </button>
      </div>
    </div>
  );
};

export default NavUser;
