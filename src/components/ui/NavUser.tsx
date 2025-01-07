import React from "react";

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
  return (
    <div className="nav-user">
      <p><strong>Nom :</strong> {user.name}</p>
      <p><strong>Email :</strong> {user.email}</p>
      <p><strong>Compte créé le :</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
      <p><strong>Dernière mise à jour :</strong> {new Date(user.updatedAt).toLocaleDateString()}</p>
    </div>
  );
};

export default NavUser;
