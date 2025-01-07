import './globals.css';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
} from '@/components/ui/Menubar';
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Assure-toi d'importer le composant Button de Shadcn UI

export default function Page() {
  return (
    <div className="relative flex flex-col h-screen bg-black">
      <main className="main-content flex-1 p-8 overflow-auto">
        <div className="space-y-12 mt-8">
          <section className="text-center">
            <h1 className="text-4xl font-bold mb-6 text-white">Bienvenue chez Ap3</h1>
            <p className="text-lg text-white">
              Ap3 est une entreprise spécialisée dans la gestion des stocks et le traitement des commandes pour les établissements de santé.
            </p>
          </section>

          <section className="text-center">
            <h2 className="text-3xl font-semibold mb-4 text-white">Nos Services</h2>
            <ul className="list-none space-y-3 text-white">
              <li><strong>Consultation des Stocks :</strong> Consultez la liste des produits disponibles.</li>
              <li><strong>Passation de Commandes :</strong> Passez des commandes pour des médicaments ou du matériel.</li>
              <li><strong>Gestion des Commandes :</strong> Les administrateurs gèrent les commandes et les stocks.</li>
              <li><strong>Ajout de Stock :</strong> Ajoutez des articles aux stocks selon les besoins.</li>
            </ul>
          </section>

          <section className="text-center">
            <h2 className="text-3xl font-semibold mb-4 text-white">Notre Mission</h2>
            <p className="text-lg text-white">
              Notre mission est de garantir une gestion optimale des stocks et un traitement rapide des commandes dans le secteur médical.
            </p>
          </section>
        </div>
      </main>

      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-8 flex space-x-4">
        <Link href="/" legacyBehavior>
          <Button variant="default">Accueil</Button>
        </Link>
        <Link href="/medicaments" legacyBehavior>
          <Button variant="default">Afficher stock Médicaments</Button>
        </Link>
        <Link href="/materiel" legacyBehavior>
          <Button variant="default">Afficher stock Matériel</Button>
        </Link>
        <Link href="/fournisseur" legacyBehavior>
          <Button variant="default">Afficher les Fournisseurs</Button>
        </Link>
        <Link href="/commande" legacyBehavior>
          <Button variant="default">Liste de Commandes</Button>
        </Link>
        <Link href="/login" legacyBehavior>
          <Button variant="secondary">Connexion</Button>
        </Link>
        <Link href="/register" legacyBehavior>
          <Button variant="secondary">Inscription</Button>
        </Link>
      </div>
    </div>
  );
}