import { useUser } from "@/services/sidebar/sidebar";
import Link from "next/link";
import "@/styles/navbar.css";

const Navbar = () => {
  const user = useUser(); 

  return (
    <nav className="bg-white shadow-lg fixed top-0 w-full z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <img src="/favicon.ico" alt="Logo" className="h-8 w-8 mr-2" />
          <span className="text-xl font-bold">Ap3</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/" className="nav-link">Accueil</Link>
          <Link href="/medicaments" className="nav-link">Médicaments</Link>
          <Link href="/materiel" className="nav-link">Matériel</Link>
          <Link href="/fournisseur" className="nav-link">Fournisseurs</Link>
          <Link href="/commande" className="nav-link">Commandes</Link>
        </div>
        <div className="flex items-center">
          {user ? (
            <span className="text-gray-600">Bienvenue, {user.firstName} {user.lastName}</span>
          ) : (
            <Link href="/login" className="nav-link text-blue-600 hover:text-blue-800">Connexion</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
