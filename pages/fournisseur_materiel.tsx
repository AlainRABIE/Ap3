import React, { useState, useEffect } from "react";
import { createClient, User } from "@supabase/supabase-js";
import MenubarRe from "../components/ui/MenuBarRe";
import { getUserRole } from "./api/role";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface FournisseurMateriel {
  id: number;
  nom: string;
  adresse: string;
  email: string;
  telephone: string;
  site_web: string;
  materiel_id: number;
}

const GestionFournisseurs = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [fournisseurs, setFournisseurs] = useState<FournisseurMateriel[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      await checkSession();
      await fetchData();
    };
    initialize();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      const { data: userData } = await supabase
        .from("User")
        .select("id")
        .eq("email", session.user.email)
        .single();

      if (userData) {
        const role = await getUserRole(userData.id);
        setUserRole(role);
        setIsAdmin(role === "administrateur");
      }
    }
  };

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("fournisseur_materiel")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("❌ Erreur lors de la récupération des fournisseurs:", error);
      setError(error.message);
      return;
    }

    setFournisseurs(data || []);
  };

  const addFournisseur = async () => {
    const nom = prompt("Nom du fournisseur ?");
    const adresse = prompt("Adresse ?");
    const email = prompt("Email ?");
    const telephone = prompt("Téléphone ?");
    const site_web = prompt("Site web ?");
    const materiel_id = prompt("ID du matériel ?");

    if (!nom || !adresse || !email || !telephone || !materiel_id) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    const { data, error } = await supabase
      .from("fournisseur_materiel")
      .insert([{ nom, adresse, email, telephone, site_web, materiel_id }]);

    if (error) {
      alert("Erreur lors de l'ajout !");
      console.error(error);
    } else {
      fetchData();
    }
  };

  const editFournisseur = async (id: number) => {
    const nom = prompt("Nouveau nom ?");
    if (!nom) return;

    const { error } = await supabase
      .from("fournisseur_materiel")
      .update({ nom })
      .eq("id", id);

    if (error) {
      alert("Erreur lors de la modification !");
      console.error(error);
    } else {
      fetchData();
    }
  };

  const deleteFournisseur = async (id: number) => {
    if (!confirm("Supprimer ce fournisseur ?")) return;

    const { error } = await supabase
      .from("fournisseur_materiel")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Erreur lors de la suppression !");
      console.error(error);
    } else {
      fetchData();
    }
  };

  return (
    <div className="p-6">
      <MenubarRe />
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Liste des Fournisseurs</h1>

      {error && <p className="text-red-500 text-center">{error}</p>}

      {isAdmin && (
        <button
          className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={addFournisseur}
        >
          ➕ Ajouter un Fournisseur
        </button>
      )}

      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-blue-500 text-white text-left">
              <th className="p-3 border">ID</th>
              <th className="p-3 border">Nom</th>
              <th className="p-3 border">Adresse</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Téléphone</th>
              <th className="p-3 border">Site Web</th>
              <th className="p-3 border">Matériel ID</th>
              {isAdmin && <th className="p-3 border">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {fournisseurs.map((fournisseur, index) => (
              <tr key={fournisseur.id} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                <td className="p-3 border">{fournisseur.id}</td>
                <td className="p-3 border">{fournisseur.nom}</td>
                <td className="p-3 border">{fournisseur.adresse}</td>
                <td className="p-3 border">{fournisseur.email}</td>
                <td className="p-3 border">{fournisseur.telephone}</td>
                <td className="p-3 border">
                  {fournisseur.site_web ? (
                    <a href={fournisseur.site_web} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                      {fournisseur.site_web}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td className="p-3 border">{fournisseur.materiel_id}</td>
                {isAdmin && (
                  <td className="p-3 border flex gap-2">
                    <button
                      className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      onClick={() => editFournisseur(fournisseur.id)}
                    >
                      ✏️ Modifier
                    </button>
                    <button
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      onClick={() => deleteFournisseur(fournisseur.id)}
                    >
                      🗑️ Supprimer
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionFournisseurs;
