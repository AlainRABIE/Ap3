"use client";

import * as React from "react";
import {
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarTrigger,
  MenubarMenu,
} from "./Menubar";
import Link from "next/link";
import { FiSettings } from "react-icons/fi";
import { useUser } from "@/services/sidebar/useUser"; 

const MenubarRe = () => {
  const { user, logout } = useUser(); 

  const handleLogout = async () => {
    try {
      await logout(); // Déconnectez l'utilisateur
      alert("Déconnexion réussie !");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  return (
    <Menubar className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-gray-900 shadow-lg rounded-t-lg flex justify-around w-full max-w-4xl p-2">
      <Link href="/" className="block py-2 px-4 text-gray-300 hover:bg-gray-700 rounded">
        Accueil
      </Link>

      <MenubarMenu>
        <MenubarTrigger className="block py-2 px-4 text-gray-300 hover:bg-gray-700 rounded">Stock</MenubarTrigger>
        <MenubarContent className="bg-gray-900 text-gray-300">
          <MenubarItem>
            <Link href="/medicaments" className="block py-2 px-4 text-gray-300 hover:bg-gray-700">
              Stock Médicaments
            </Link>
          </MenubarItem>
          <MenubarItem>
            <Link href="/materiel" className="block py-2 px-4 text-gray-300 hover:bg-gray-700">
              Stock Matériel
            </Link>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger className="block py-2 px-4 text-gray-300 hover:bg-gray-700 rounded">Commande</MenubarTrigger>
        <MenubarContent className="bg-gray-900 text-gray-300">
          <MenubarItem>
            <Link href="/commande" className="block py-2 px-4 text-gray-300 hover:bg-gray-700">
              Liste des Commandes
            </Link>
          </MenubarItem>
          <MenubarItem>
            <Link href="/nouvelle-commande" className="block py-2 px-4 text-gray-300 hover:bg-gray-700">
              Nouvelle Commande
            </Link>
          </MenubarItem>
          <MenubarItem>
            <Link href="/commande-en-cours" className="block py-2 px-4 text-gray-300 hover:bg-gray-700">
              Commande en cours de traitement
            </Link>
          </MenubarItem>
          <MenubarItem>
            <Link href="/historique-commandes" className="block py-2 px-4 text-gray-300 hover:bg-gray-700">
              Historique de commande
            </Link>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger className="block py-2 px-4 text-gray-300 hover:bg-gray-700 rounded">Fournisseurs</MenubarTrigger>
        <MenubarContent className="bg-gray-900 text-gray-300">
          <MenubarItem>
            <Link href="/fournisseur" className="block py-2 px-4 text-gray-300 hover:bg-gray-700">
              Fournisseurs
            </Link>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger className="block py-2 px-4 text-gray-300 hover:bg-gray-700 rounded">
          <FiSettings className="inline-block mr-2" /> Paramètres
        </MenubarTrigger>
        <MenubarContent className="bg-gray-900 text-gray-300">
          <MenubarItem>
            <Link href="/settings" className="block py-2 px-4 text-gray-300 hover:bg-gray-700">
              Paramètres
            </Link>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      {user ? (
        <div className="flex items-center space-x-4">
          <span className="block py-2 px-4 text-gray-300">Bienvenue, {user.email}</span>
          <button
            onClick={handleLogout}
            className="block py-2 px-4 text-gray-300 hover:bg-red-700 bg-red-600 rounded"
          >
            Déconnexion
          </button>
        </div>
      ) : (
        <MenubarMenu>
          <MenubarTrigger className="block py-2 px-4 text-gray-300 hover:bg-gray-700 rounded">Connexion</MenubarTrigger>
          <MenubarContent className="bg-gray-900 text-gray-300">
            <MenubarItem>
              <Link href="/login" className="block py-2 px-4 text-gray-300 hover:bg-gray-700">
                Connexion
              </Link>
            </MenubarItem>
            <MenubarItem>
              <Link href="/register" className="block py-2 px-4 text-gray-300 hover:bg-gray-700">
                Inscription
              </Link>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      )}
    </Menubar>
  );
};

export default MenubarRe;