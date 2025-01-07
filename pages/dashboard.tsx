import "../src/app/globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { Link } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="flex flex-col h-screen">
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>

      <main className="flex-1 p-4 overflow-y-auto">
        <div className="wave-container">
          <div className="wave"></div>
        </div>
        <div className="center-content">
          <h1 className="text-3xl font-bold mb-6">Tableau de Bord</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-700 p-4 rounded shadow-md">
              <h2 className="text-xl font-semibold mb-2">Statistique 1</h2>
              <p>Contenu de la statistique 1</p>
            </div>
            <div className="bg-gray-700 p-4 rounded shadow-md">
              <h2 className="text-xl font-semibold mb-2">Statistique 2</h2>
              <p>Contenu de la statistique 2</p>
            </div>
            <div className="bg-gray-700 p-4 rounded shadow-md">
              <h2 className="text-xl font-semibold mb-2">Statistique 3</h2>
              <p>Contenu de la statistique 3</p>
            </div>
          </div>
        </div>
      </main>

      <div className="flex justify-center items-center mt-auto w-full">
        <div className="w-full max-w-4xl p-2 bg-gray-200 border-2 border-gray-400 rounded-lg flex">
          <Link
            href="/dashboard"
            className="flex-1 text-center p-2 text-gray-700 hover:bg-gray-300 border-r-2 border-gray-400"
          >
            Dashboard
          </Link>
          <Link
            href="/medicaments"
            className="flex-1 text-center p-2 text-gray-700 hover:bg-gray-300 border-r-2 border-gray-400"
          >
            Médicaments
          </Link>
          <Link
            href="/materiel"
            className="flex-1 text-center p-2 text-gray-700 hover:bg-gray-300 border-r-2 border-gray-400"
          >
            Matériel
          </Link>
          <Link
            href="/fournisseur"
            className="flex-1 text-center p-2 text-gray-700 hover:bg-gray-300 border-r-2 border-gray-400"
          >
            Fournisseurs
          </Link>
          <Link
            href="/commande"
            className="flex-1 text-center p-2 text-gray-700 hover:bg-gray-300 border-r-2 border-gray-400"
          >
            Commandes
          </Link>
          <Link
            href="/login"
            className="flex-1 text-center p-2 text-gray-700 hover:bg-gray-300 border-r-2 border-gray-400"
          >
            Connexion
          </Link>
          <Link
            href="/register"
            className="flex-1 text-center p-2 text-gray-700 hover:bg-gray-300"
          >
            Inscription
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
