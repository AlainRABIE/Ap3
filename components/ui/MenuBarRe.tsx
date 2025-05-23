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
import {  FiMenu, FiHome, FiShoppingCart, FiUsers, FiBook, FiLogOut, FiLogIn } from "react-icons/fi";
import { useUser } from "@/services/sidebar/useUser";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getUserRole } from "../../pages/api/role";

const Sidebar = () => {
  const { user, logout } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const checkSession = async () => {
    if (user) {
      const { data: userData } = await supabase
        .from("User")
        .select("id")
        .eq("email", user.email)
        .single();

      if (userData) {
        const role = await getUserRole(userData.id);
        setIsAdmin(role === "administrateur");
      }
    } else {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, [user, checkSession]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  return (
    <div
      className={`flex flex-col ${isSidebarVisible ? "w-64" : "w-16"} h-full ${isDarkMode ? "bg-black text-white" : "bg-white text-black"
        } bg-opacity-40 backdrop-blur-md shadow-lg transition-all duration-300`}
    >
      <div className="flex justify-between items-center py-4 px-2">
        <button
          onClick={toggleSidebar}
          className="p-2 text-gray-400 hover:text-gray-600"
        >
          <FiMenu size={24} />
        </button>
      </div>

      <div className="flex-grow p-4 main-content">
        {user && (
          <Menubar className="flex flex-col space-y-2">
            <Link
              href="/"
              className="block py-2 px-4 text-gray-400 hover:bg-gray-700 rounded flex items-center space-x-2 focus:outline-none"
              aria-label="Accueil"
            >
              <FiHome size={24} />
              {isSidebarVisible && <span>Accueil</span>}
            </Link>

            <MenubarMenu>
              <MenubarTrigger className="block py-2 px-4 text-gray-400 hover:bg-gray-700 rounded flex items-center space-x-2">
                <FiShoppingCart size={24} />
                {isSidebarVisible && <span>Stock</span>}
              </MenubarTrigger>
              <MenubarContent className="bg-gray-800/50 backdrop-blur-md text-gray-400">
                <MenubarItem>
                  <Link
                    href="/stock_medicaments"
                    className="py-2 px-4 text-gray-400 hover:bg-gray-600 backdrop-blur-md flex items-center space-x-2"
                    aria-label="Stock Médicaments"
                  >
                    <FiShoppingCart size={20} />
                    {isSidebarVisible && <span>Stock Médicaments</span>}
                  </Link>
                </MenubarItem>
                <MenubarItem>
                  <Link
                    href="/stock_materiel"
                    className="py-2 px-4 text-gray-400 hover:bg-gray-600 backdrop-blur-md flex items-center space-x-2"
                    aria-label="Stock Matériel"
                  >
                    <FiShoppingCart size={20} />
                    {isSidebarVisible && <span>Stock Matériel</span>}
                  </Link>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger className="block py-2 px-4 text-gray-400 hover:bg-gray-700 rounded flex items-center space-x-2">
                <FiShoppingCart size={24} />
                {isSidebarVisible && <span>Commande</span>}
              </MenubarTrigger>
              <MenubarContent className="bg-gray-900/80 backdrop-blur-md text-gray-300">
                <MenubarItem>
                  <Link
                    href="/commande_medicaments"
                    className="block py-2 px-4 text-gray-400 hover:bg-gray-700 flex items-center space-x-2"
                    aria-label="Commande de médicaments"
                  >
                    <FiShoppingCart size={20} />
                    {isSidebarVisible && <span>Commande Médicaments</span>}
                  </Link>
                </MenubarItem>
                <MenubarItem>
                  <Link
                    href="/commande_materiel"
                    className="block py-2 px-4 text-gray-400 hover:bg-gray-700 flex items-center space-x-2"
                    aria-label="Commande de Matériel"
                  >
                    <FiShoppingCart size={20} />
                    {isSidebarVisible && <span>Commande Matériel</span>}
                  </Link>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger className="block py-2 px-4 text-gray-400 hover:bg-gray-700 rounded flex items-center space-x-2">
                <FiShoppingCart size={24} />
                {isSidebarVisible && <span>Vos commande</span>}
              </MenubarTrigger>
              <MenubarContent className="bg-gray-900/80 backdrop-blur-md text-gray-300">
                <MenubarItem>
                  <Link
                    href="/commande_en_cour2"
                    className="block py-2 px-4 text-gray-400 hover:bg-gray-700 flex items-center space-x-2"
                    aria-label="Fournisseurs de Matériel"
                  >
                    <FiShoppingCart size={20} />
                    {isSidebarVisible && <span>Vos commande de materiaux</span>}
                  </Link>
                </MenubarItem>
                <MenubarItem>
                  <Link
                    href="/commande-en-cour"
                    className="block py-2 px-4 text-gray-400 hover:bg-gray-700 flex items-center space-x-2"
                    aria-label="Fournisseurs de Médicaments"
                  >
                    <FiShoppingCart size={20} />
                    {isSidebarVisible && <span>Vos commande de Médicaments</span>}
                  </Link>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger className="block py-2 px-4 text-gray-400 hover:bg-gray-700 rounded flex items-center space-x-2">
                <FiUsers size={24} />
                {isSidebarVisible && <span>Fournisseurs</span>}
              </MenubarTrigger>
              <MenubarContent className="bg-gray-900/80 backdrop-blur-md text-gray-300">
                <MenubarItem>
                  <Link
                    href="/fournisseur_materiel"
                    className="block py-2 px-4 text-gray-400 hover:bg-gray-700 flex items-center space-x-2"
                    aria-label="Fournisseurs de Matériel"
                  >
                    <FiUsers size={20} />
                    {isSidebarVisible && <span>Fournisseurs Matériel</span>}
                  </Link>
                </MenubarItem>
                <MenubarItem>
                  <Link
                    href="/fournisseur_medicaments"
                    className="block py-2 px-4 text-gray-400 hover:bg-gray-700 flex items-center space-x-2"
                    aria-label="Fournisseurs de Médicaments"
                  >
                    <FiUsers size={20} />
                    {isSidebarVisible && <span>Fournisseurs Médicaments</span>}
                  </Link>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            {isAdmin && (
              <Link
                href="/user"
                className="block py-2 px-4 text-gray-400 hover:bg-gray-700 rounded flex items-center space-x-2 focus:outline-none"
                aria-label="Liste des utilisateurs"
              >
                <FiUsers size={24} />
                {isSidebarVisible && <span>Liste d&apos;utilisateurs</span>}
              </Link>
            )}



            <MenubarMenu>
              <MenubarTrigger className="block py-2 px-4 text-gray-400 hover:bg-gray-700 rounded flex items-center space-x-2">
                <FiLogOut size={24} />
                {isSidebarVisible && <span>Déconnexion</span>}
              </MenubarTrigger>
              <MenubarContent className="bg-gray-900/80 backdrop-blur-md text-gray-400">
                <MenubarItem>
                  <button
                    onClick={logout}
                    className="block py-2 px-4 text-gray-400 hover:bg-gray-700 flex items-center space-x-2"
                    aria-label="Déconnexion"
                  >
                    <FiLogOut size={20} />
                    {isSidebarVisible && <span>Déconnexion</span>}
                  </button>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        )}

        {!user && (
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger className="block py-2 px-4 text-gray-400 hover:bg-gray-700 rounded flex items-center space-x-2">
                <FiLogIn size={24} />
                {isSidebarVisible && <span>Connexion</span>}
              </MenubarTrigger>
              <MenubarContent className="bg-gray-900/80 backdrop-blur-md text-gray-300">
                <MenubarItem>
                  <Link
                    href="/login"
                    className="block py-2 px-4 text-gray-400 hover:bg-gray-700 flex items-center space-x-2"
                    aria-label="Connexion"
                  >
                    <FiLogIn size={20} />
                    {isSidebarVisible && <span>Connexion</span>}
                  </Link>
                </MenubarItem>
                <MenubarItem>
                  <Link
                    href="/register"
                    className="block py-2 px-4 text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
                    aria-label="Inscription"
                  >
                    <FiLogIn size={20} />
                    {isSidebarVisible && <span>Inscription</span>}
                  </Link>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        )}
      </div>

      <div className="mt-auto p-4">
        <div className="flex items-center justify-center mb-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 bg-gray-800 text-white rounded-full transition duration-300 ease-in-out hover:bg-gray-600"
          >
            {isDarkMode ? (
              <span>🌞</span>
            ) : (
              <span>🌙</span>
            )}
          </button>
        </div>
        <div className="block py-2 px-4 text-gray-500">
          <Link
            href="/guide"
            className="block py-2 px-4 text-gray-400 hover:bg-gray-700 flex items-center space-x-2"
            aria-label="Guide d'utilisation"
          >
            <FiBook size={20} />
            {isSidebarVisible && <span>Guide d&apos;utilisation</span>}
          </Link>
        </div>
        {user && (
          <div className="block py-2 px-4 text-gray-500">
            Bienvenue, {user.email}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;