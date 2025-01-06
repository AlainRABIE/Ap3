// src/app/page.tsx
import "@/styles/page.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";

export default function Page() {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50">
        <AppSidebar />
        <main className="flex-1 p-8 overflow-auto bg-white shadow-lg rounded-xl mx-6 my-8">
          <div className="wave-container">
            <div className="wave"></div>
          </div>

          <div className="space-y-12 mt-8">
            <section className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-6">Bienvenue chez Ap3</h1>
              <p className="text-lg text-gray-600">
                Ap3 est une entreprise spécialisée dans la gestion des stocks et le traitement des commandes pour les établissements de santé.
              </p>
            </section>

            <section className="text-center">
              <h2 className="text-3xl font-semibold text-gray-800 mb-4">Nos Services</h2>
              <ul className="list-none space-y-3 text-gray-700">
                <li><strong>Consultation des Stocks :</strong> Consultez la liste des produits disponibles.</li>
                <li><strong>Passation de Commandes :</strong> Passez des commandes pour des médicaments ou du matériel.</li>
                <li><strong>Gestion des Commandes :</strong> Les administrateurs gèrent les commandes et les stocks.</li>
                <li><strong>Ajout de Stock :</strong> Ajoutez des articles aux stocks selon les besoins.</li>
              </ul>
            </section>

            <section className="text-center">
              <h2 className="text-3xl font-semibold text-gray-800 mb-4">Notre Mission</h2>
              <p className="text-lg text-gray-600">
                Notre mission est de garantir une gestion optimale des stocks et un traitement rapide des commandes dans le secteur médical.
              </p>
            </section>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
