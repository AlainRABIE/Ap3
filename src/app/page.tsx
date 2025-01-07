import './globals.css';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar"; 

export default function Page() {
  return (
    <SidebarProvider>
      <div className="relative flex h-screen bg-gray-800">
        <AppSidebar />
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
      </div>
    </SidebarProvider>
  );
}
