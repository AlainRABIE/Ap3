"use client";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader } from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/services/sidebar/sidebar";

export function AppSidebar() {
  const pathname = usePathname();
  const user = useUser();

  const isActive = (path: string) => {
    return pathname === path ? "bg-gray-200" : "";
  };

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center space-x-2">
        <img src="/favicon.ico" alt="Logo" className="h-8 w-8" style={{ height: "20px", width: "20px" }} />
        <h2 className="text-xl font-bold">Ap3</h2>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <Link
            href="/"
            className={`block py-2 px-4 hover:bg-gray-200 transition-colors ${isActive("/")}`}
          >
            Accueil
          </Link>
          <Link
            href="/medicaments"
            className={`block py-2 px-4 hover:bg-gray-200 transition-colors ${isActive("/medicaments")}`}
          >
            Afficher stock Médicaments
          </Link>
          <Link
            href="/materiel"
            className={`block py-2 px-4 hover:bg-gray-200 transition-colors ${isActive("/materiel")}`}
          >
            Afficher stock Matériel
          </Link>
          <Link
            href="/fournisseur"
            className={`block py-2 px-4 hover:bg-gray-200 transition-colors ${isActive("/fournisseur")}`}
          >
            Afficher les Fournisseurs
          </Link>
          <Link
            href="/commande"
            className={`block py-2 px-4 hover:bg-gray-200 transition-colors ${isActive("/commande")}`}
          >
            Liste de Commandes
          </Link>
        </SidebarGroup>

        <SidebarGroup>
          {user ? (
            <>
              <Link
                href="/settings"
                className={`block py-2 px-4 hover:bg-gray-200 transition-colors ${isActive("/settings")}`}
              >
                Paramètres
              </Link>
              <Link
                href="/profile"
                className={`block py-2 px-4 hover:bg-gray-200 transition-colors ${isActive("/profile")}`}
              >
                Profil
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Connexion
              </Link>

              <Link href="/register">
                <button className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors mt-2">
                  Inscription
                </button>
              </Link>
            </>
          )}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="flex flex-col items-start p-4">
        {user && (
          <div className="w-full mb-4">
            <p className="text-sm font-semibold">Bienvenue, {user.firstName} {user.lastName}</p>
          </div>
        )}
        <p className="text-sm text-gray-600">© 2025 Ap3 Alain RABIE BTS SIO 2023-2025</p>
      </SidebarFooter>
    </Sidebar>
  );
}
export default AppSidebar; // Assurez-vous d'exporter le composant
