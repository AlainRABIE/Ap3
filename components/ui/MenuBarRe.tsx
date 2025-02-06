"use client";

import * as React from "react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarTrigger,
  MenubarMenu,
} from "./Menubar";
import Link from "next/link";
import { FiSettings, FiBell } from "react-icons/fi";
import { useUser } from "@/services/sidebar/useUser";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getUserRole } from "../../pages/api/role";

const Sidebar = () => {
  const { user, logout } = useUser();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const checkSession = async () => {
    if (user) {
      const { data: userData } = await supabase
        .from("User")
        .select("id")
        .eq("email", user.email)
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

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div
      className={`flex flex-col w-64 h-full ${isDarkMode ? "bg-black text-white" : "bg-white text-black"} bg-opacity-40 backdrop-blur-md shadow-lg`}
    >
      <div className="flex items-center justify-center py-4 backdrop-blur-md border-gray-700">
      </div>
      <div className="flex-grow p-4 main-content">
        {user && (
          <Menubar className="flex flex-col space-y-2">
            <Link
              href="/"
              className="block py-2 px-4 text-gray-400 hover:bg-gray-700 rounded"
            >
              Accueil
            </Link>

            {/* Menu Stock */}
            <MenubarMenu>
              <MenubarTrigger className="block py-2 px-4 text-gray-400 hover:bg-gray-700 rounded">
                Stock
              </MenubarTrigger>
              <MenubarContent className="bg-gray-800/50 backdrop-blur-md text-gray-400">
                <MenubarItem>
                  <Link href="/stock_medicaments" className="py-2 px-4 text-gray-400 hover:bg-gray-600 backdrop-blur-md">
                    Stock Médicaments
                  </Link>
                </MenubarItem>
                <MenubarItem>
                  <Link href="/stock_materiel" className="py-2 px-4 text-gray-400 hover:bg-gray-600 backdrop-blur-md">
                    Stock Matériel
                  </Link>
                </MenubarItem>
              </MenubarContent>

            </MenubarMenu>

            {/* Menu Commande */}
            <MenubarMenu>
              <MenubarTrigger className="block py-2 px-4 text-gray-400 hover:bg-gray-700 rounded">
                Commande
              </MenubarTrigger>
              <MenubarContent className="bg-gray-900/80 backdrop-blur-md text-gray-300">
                <MenubarItem>
                  <Link
                    href="/commande_medicaments"
                    className="block py-2 px-4 text-gray-400 hover:bg-gray-700"
                  >
                    Commande de médicaments
                  </Link>
                </MenubarItem>
                <MenubarItem>
                  <Link
                    href="/commande_materiel"
                    className="block py-2 px-4 text-gray-400 hover:bg-gray-700"
                  >
                    Commande de Matériel
                  </Link>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            {/* Menu Fournisseurs */}
            <MenubarMenu>
              <MenubarTrigger className="block py-2 px-4 text-gray-400 hover:bg-gray-700 rounded">
                Fournisseurs
              </MenubarTrigger>
              <MenubarContent className="bg-gray-900/80 backdrop-blur-md text-gray-300">
                <MenubarItem>
                  <Link
                    href="/fournisseur_materiel"
                    className="block py-2 px-4 text-gray-400 hover:bg-gray-700"
                  >
                    Fournisseurs De Matériel
                  </Link>
                  <Link
                    href="/fournisseur_medicaments"
                    className="block py-2 px-4 text-gray-400 hover:bg-gray-700"
                  >
                    Fournisseurs De Médicaments
                  </Link>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            {/* Menu Paramètres */}
            <MenubarMenu>
              <MenubarTrigger className="block py-2 px-4 text-gray-400 hover:bg-gray-700 rounded">
                <FiSettings className="inline-block mr-2" /> Paramètres
              </MenubarTrigger>
              <MenubarContent className="bg-gray-900/80 backdrop-blur-md text-gray-300">
                <MenubarItem>
                  <Link
                    href="/settings"
                    className="block py-2 px-4 text-gray-400 hover:bg-gray-700"
                  >
                    Paramètres
                  </Link>
                </MenubarItem>
                {isAdmin && (
                  <MenubarItem>
                    <Link
                      href="/user"
                      className="block py-2 px-4 text-gray-400 hover:bg-gray-700"
                    >
                      Liste d'utilisateur
                    </Link>
                  </MenubarItem>
                )}
                <Link
                  href="/profil"
                  className="block py-2 px-4 text-gray-400 hover:bg-gray-700"
                >
                  Profil
                </Link>
              </MenubarContent>
            </MenubarMenu>

            {/* Menu Dashboard */}
            <MenubarMenu>
              <MenubarTrigger className="block py-2 px-4 text-gray-400 hover:bg-gray-700 rounded">
                Dashboard
              </MenubarTrigger>
              <MenubarContent className="bg-gray-900/80 backdrop-blur-md text-gray-400">
                <MenubarItem>
                  <Link
                    href="/dashboard"
                    className="block py-2 px-4 text-gray-400 hover:bg-gray-700"
                  >
                    Dashboard
                  </Link>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            {/* Menu Déconnexion */}
            <MenubarMenu>
              <MenubarTrigger className="block py-2 px-4 text-gray-400 hover:bg-gray-700 rounded">
                Déconnexion
              </MenubarTrigger>
              <MenubarContent className="bg-gray-900/80 backdrop-blur-md text-gray-400">
                <MenubarItem>
                  <button
                    onClick={logout}
                    className="block py-2 px-4 text-gray-400 hover:bg-gray-700"
                  >
                    Déconnexion
                  </button>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            {/* Menu Notifications */}
            <MenubarMenu>
              <MenubarTrigger className="block py-2 px-4 text-gray-400 hover:bg-gray-700 rounded">
                <FiBell className="inline-block mr-2" /> Notifications
              </MenubarTrigger>
              <MenubarContent className="bg-gray-900/80 backdrop-blur-md text-gray-400">
                <MenubarItem>
                  <Link
                    href="/notifications"
                    className="block py-2 px-4 text-gray-400 hover:bg-gray-700"
                  >
                    Voir les Notifications
                  </Link>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        )}

        {!user && (
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger className="block py-2 px-4 text-gray-400 hover:bg-gray-700 rounded">
                Connexion
              </MenubarTrigger>
              <MenubarContent className="bg-gray-900/80 backdrop-blur-md text-gray-300">
                <MenubarItem>
                  <Link
                    href="/login"
                    className="block py-2 px-4 text-gray-400 hover:bg-gray-700"
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
          </Menubar>
        )}
      </div>

      <div className="fixed bottom-8 right-8 flex items-center justify-center">
        <button
          onClick={toggleDarkMode}
          className="p-2 bg-gray-800 text-white rounded-full transition duration-300 ease-in-out hover:bg-gray-600"
        >
          {isDarkMode ? (
            <span>🌞 Mode Clair</span>
          ) : (
            <span>🌙 Mode Sombre</span>
          )}
        </button>
      </div>

      <div className="mt-auto p-4">
        {user && (
          <div className="block py-2 px-4 text-gray-300">
            Bienvenue, {user.email}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;