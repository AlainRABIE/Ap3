"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/services/user/user"; 
import { supabase } from "@/lib/supabaseClient";
import "../src/app/globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar"; 

const MedicamentsPage = () => {
  const user = useUser();
  const [medicaments, setMedicaments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMedicaments = async () => {
      try {
        const { data, error } = await supabase
          .from("medicaments") 
          .select("id, name, description, posologie, maladies_non_compatibles");

        if (error) {
          throw new Error(error.message);
        }

        setMedicaments(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des médicaments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicaments();
  }, []);

  return (
    <SidebarProvider> 
      <div className="flex">
        <AppSidebar />
        
        <div className="container mx-auto p-4 flex-1">
          <h1 className="text-2xl font-bold mb-4">Médicaments en Stock</h1>

          {user ? (
            loading ? (
              <p>Chargement des médicaments...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto border-collapse">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border-b">ID</th>
                      <th className="px-4 py-2 border-b">Nom</th>
                      <th className="px-4 py-2 border-b">Description</th>
                      <th className="px-4 py-2 border-b">Posologie</th>
                      <th className="px-4 py-2 border-b">Maladies non compatibles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicaments.map((medicament) => (
                      <tr key={medicament.id}>
                        <td className="px-4 py-2 border-b">{medicament.id}</td>
                        <td className="px-4 py-2 border-b">{medicament.name}</td>
                        <td className="px-4 py-2 border-b">{medicament.description}</td>
                        <td className="px-4 py-2 border-b">{medicament.posologie}</td>
                        <td className="px-4 py-2 border-b">{medicament.maladies_non_compatibles}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <p className="text-red-500">Lorsque vous serez connecter vous pourrez voir ici les médicaments disponibles dans le stock</p>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MedicamentsPage;
