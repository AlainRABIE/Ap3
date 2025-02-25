"use client";

import './globals.css';
import CustomMenubar from "../../components/ui/MenuBarRe";

export default function Page() {
  return (
    <div className="relative flex h-screen">
      <div className="animated-background"></div>
      <CustomMenubar />
      <main className="main-content flex-1 p-8 overflow-auto">
        <div className="space-y-12 mt-8">
          <section className="text-center">
            <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-gray-300">
              Bienvenue chez Ap3
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Ap3 est une entreprise spécialisée dans la gestion des stocks et le traitement des commandes pour les établissements de santé.
            </p>
          </section>

          <section className="text-center">
            <h2 className="text-3xl font-semibold mb-4 text-gray-800 dark:text-gray-300">
              Nos Services
            </h2>
            <ul className="list-none space-y-3 text-gray-700 dark:text-gray-300">
              <li><strong>Consultation des Stocks :</strong> Consultez la liste des produits disponibles.</li>
              <li><strong>Passation de Commandes :</strong> Passez des commandes pour des médicaments ou du matériel.</li>
              <li><strong>Gestion des Commandes :</strong> Les administrateurs gèrent les commandes et les stocks.</li>
              <li><strong>Ajout de Stock :</strong> Ajoutez des articles aux stocks selon les besoins.</li>
            </ul>
          </section>

          <section className="text-center">
            <h2 className="text-3xl font-semibold mb-4 text-gray-800 dark:text-gray-300">
              Notre Mission
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Notre mission est de garantir une gestion optimale des stocks et un traitement rapide des commandes dans le secteur médical.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
