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
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getUserRole } from "../../pages/api/role";
const MenuBarRe = () => {
  const { user, logout } = useUser();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkSession = async () => {
    if (user) {
      const { data: userData } = await supabase
        .from('User')
        .select('id')
        .eq('email', user.email)
        .single();

      if (userData) {
        const role = await getUserRole(userData.id);
        setUserRole(role);
        setIsAdmin(role === "administrateur");
      }
    } else {
      setUserRole(null);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, [user]);

  return (
    <Menubar className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-gray-900 shadow-lg rounded-t-lg flex justify-around w-full max-w-4xl p-2">
      <Link
        href="/"
        className="block py-2 px-4 text-gray-300 hover:bg-gray-700 rounded"
      >
        Accueil
      </Link>

      <MenubarMenu>
        <MenubarTrigger className="block py-2 px-4 text-gray-300 hover:bg-gray-700 rounded">
          Stock
        </MenubarTrigger>
        <MenubarContent className="bg-gray-900 text-gray-300">
          <MenubarItem>
            <Link
              href="/medicaments"
              className="block py-2 px-4 text-gray-300 hover:bg-gray-700"
            >
              Stock Médicaments
            </Link>
          </MenubarItem>
          <MenubarItem>
            <Link
              href="/materiel"
              className="block py-2 px-4 text-gray-300 hover:bg-gray-700"
            >
              Stock Matériel
            </Link>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger className="block py-2 px-4 text-gray-300 hover:bg-gray-700 rounded">
          Commande
        </MenubarTrigger>
        <MenubarContent className="bg-gray-900 text-gray-300">
          <MenubarItem>
            <Link
              href="/commande"
              className="block py-2 px-4 text-gray-300 hover:bg-gray-700"
            >
              Liste des Commandes
            </Link>
          </MenubarItem>
          <MenubarItem>
          </MenubarItem>
          <MenubarItem>
            <Link
              href="/commande-en-cours"
              className="block py-2 px-4 text-gray-300 hover:bg-gray-700"
            >
              Commande en cours de traitement
            </Link>
          </MenubarItem>
          <MenubarItem>
            <Link
              href="/historique-commandes"
              className="block py-2 px-4 text-gray-300 hover:bg-gray-700"
            >
              Historique de commande
            </Link>
          </MenubarItem>
          {user && isAdmin && (
            <MenubarItem>
              <Link
                href="/liste-utilisateurs"
                className="block py-2 px-4 text-gray-300 hover:bg-gray-700"
              >
                Liste d'utilisateur
              </Link>
            </MenubarItem>
          )}
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger className="block py-2 px-4 text-gray-300 hover:bg-gray-700 rounded">
          Fournisseurs
        </MenubarTrigger>
        <MenubarContent className="bg-gray-900 text-gray-300">
          <MenubarItem>
            <Link
              href="/fournisseur"
              className="block py-2 px-4 text-gray-300 hover:bg-gray-700"
            >
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
            <Link
              href="/settings"
              className="block py-2 px-4 text-gray-300 hover:bg-gray-700"
            >
              Paramètres
            </Link>
            <Link
              href="/profil"
              className="block py-2 px-4 text-gray-300 hover:bg-gray-700"
            >
              Profil
            </Link>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      {user ? (
        <>
          <div className="block py-2 px-4 text-gray-300">
            Bienvenue, {user.email}
          </div>
          <Link
            href="/dashboard"
            className="common-button bg-blue"
          >
            Dashboard
          </Link>
          <button
            onClick={logout}
            className="common-button bg-red"
          >
            Déconnexion
          </button>
        </>
      ) : (
        <MenubarMenu>
          <MenubarTrigger className="block py-2 px-4 text-gray-300 hover:bg-gray-700 rounded">
            Connexion
          </MenubarTrigger>
          <MenubarContent className="bg-gray-900 text-gray-300">
            <MenubarItem>
              <Link
                href="/login"
                className="block py-2 px-4 text-gray-300 hover:bg-gray-700"
              >
                Connexion
              </Link>
            </MenubarItem>
            <MenubarItem>
              <Link
                href="/register"
                className="block py-2 px-4 text-gray-300 hover:bg-gray-700"
              >
                Inscription
              </Link>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      )}
    </Menubar>
  );
};

export default MenuBarRe;