import React, { useState, useEffect } from "react";
import { createClient, User } from "@supabase/supabase-js";
import MenubarRe from "../components/ui/MenuBarRe";
import Modal from "../components/ui/modal"; 
import { getUserRole } from "./api/role";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Fournisseur {
  fournisseur_id: number;
  nom: string;
  adresse: string;
  email: string;
  telephone: string;
  site_web: string;
}

const GestionFournisseurs = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFournisseur, setSelectedFournisseur] = useState<Fournisseur | null>(null);
  const [formData, setFormData] = useState<Omit<Fournisseur, 'fournisseur_id'>>({
    nom: '',
    adresse: '',
    email: '',
    telephone: '',
    site_web: '',
  });

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
      .from("fournisseur_medicament")
      .select("*")
      .order("fournisseur_id", { ascending: false });

    if (error) {
      console.error("❌ Erreur lors de la récupération des fournisseurs:", error);
      setError(error.message);
      return;
    }

    setFournisseurs(data || []);
  };

  const handleAddFournisseur = async (event: React.FormEvent) => {
    event.preventDefault();

    const { data, error } = await supabase
      .from("fournisseur_medicament")
      .insert([formData]);

    if (error) {
      alert("Erreur lors de l'ajout !");
      console.error(error);
    } else {
      fetchData();
      setShowAddModal(false);
      setFormData({
        nom: '',
        adresse: '',
        email: '',
        telephone: '',
        site_web: '',
      });
    }
  };

  const handleEditFournisseur = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedFournisseur) return;

    const { error } = await supabase
      .from("fournisseur_medicament")
      .update(formData)
      .eq("fournisseur_id", selectedFournisseur.fournisseur_id);

    if (error) {
      alert("Erreur lors de la modification !");
      console.error(error);
    } else {
      fetchData();
      setShowEditModal(false);
      setSelectedFournisseur(null);
      setFormData({
        nom: '',
        adresse: '',
        email: '',
        telephone: '',
        site_web: '',
      });
    }
  };

  const openEditModal = (fournisseur: Fournisseur) => {
    setSelectedFournisseur(fournisseur);
    setFormData({
      nom: fournisseur.nom,
      adresse: fournisseur.adresse,
      email: fournisseur.email,
      telephone: fournisseur.telephone,
      site_web: fournisseur.site_web,
    });
    setShowEditModal(true);
  };

  const deleteFournisseur = async (id: number) => {
    if (!confirm("Supprimer ce fournisseur ?")) return;

    const { error } = await supabase
      .from("fournisseur_medicament")
      .delete()
      .eq("fournisseur_id", id);

    if (error) {
      alert("Erreur lors de la suppression !");
      console.error(error);
    } else {
      fetchData();
    }
  };

  return (
    <div className="relative flex h-screen bg-opacity-40 backdrop-blur-md">
      <div className="animated-background"></div>
      <div className="waves"></div>
      <MenubarRe />
      <div className="content p-8 overflow-auto">
        <h1 className="text-white text-2xl mb-6">Liste des Fournisseurs</h1>
  
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
  
        {isAdmin && (
          <button
            className="mb-6 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            onClick={() => setShowAddModal(true)}
          >
            ➕ Ajouter un Fournisseur
          </button>
        )}
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fournisseurs.map((fournisseur) => (
            <div 
              key={fournisseur.fournisseur_id}
              className="bg-transparent border border-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-xl font-bold mb-2 text-white">{fournisseur.nom}</h2>
              <p className="text-sm text-gray-350 mb-4">
                <span className="font-medium">Adresse:</span> {fournisseur.adresse}
              </p>
              <p className="text-sm text-gray-350 mb-4">
                <span className="font-medium">Email:</span> {fournisseur.email}
              </p>
              <p className="text-sm text-gray-350 mb-4">
                <span className="font-medium">Téléphone:</span> {fournisseur.telephone}
              </p>
              {fournisseur.site_web && (
                <p className="text-sm text-gray-350 mb-4">
                  <span className="font-medium">Site Web:</span>{" "}
                  <a 
                    href={fournisseur.site_web}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-600 underline"
                  >
                    {fournisseur.site_web}
                  </a>
                </p>
              )}
  
              {isAdmin && (
                <div className="flex justify-around mt-4 pt-4 border-t border-gray-600">
                  <button
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                    onClick={() => openEditModal(fournisseur)}
                  >
                    Modifier
                  </button>
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    onClick={() => deleteFournisseur(fournisseur.fournisseur_id)}
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <Modal show={showAddModal} onClose={() => setShowAddModal(false)}>
          <div className="w-80 p-4 bg-white rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-black">Ajouter un Fournisseur</h2>
            <form onSubmit={handleAddFournisseur} className="flex flex-col">
              <input
                type="text"
                placeholder="Nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="mb-2 p-2 border border-gray-300 rounded text-black"
              />
              <input
                type="text"
                placeholder="Adresse"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                className="mb-2 p-2 border border-gray-300 rounded text-black"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mb-2 p-2 border border-gray-300 rounded text-black"
              />
              <input
                type="text"
                placeholder="Téléphone"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="mb-2 p-2 border border-gray-300 rounded text-black"
              />
              <input
                type="text"
                placeholder="Site web"
                value={formData.site_web}
                onChange={(e) => setFormData({ ...formData, site_web: e.target.value })}
                className="mb-2 p-2 border border-gray-300 rounded text-black"
              />
              <div className="flex justify-end mt-2">
                <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded">
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </Modal>

        <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
          <div className="w-80 p-4 bg-white rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-black">Modifier un Fournisseur</h2>
            <form onSubmit={handleEditFournisseur} className="flex flex-col">
              <input
                type="text"
                placeholder="Nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="mb-2 p-2 border border-gray-300 rounded text-black"
              />
              <input
                type="text"
                placeholder="Adresse"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                className="mb-2 p-2 border border-gray-300 rounded text-black"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mb-2 p-2 border border-gray-300 rounded text-black"
              />
              <input
                type="text"
                placeholder="Téléphone"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="mb-2 p-2 border border-gray-300 rounded text-black"
              />
              <input
                type="text"
                placeholder="Site web"
                value={formData.site_web}
                onChange={(e) => setFormData({ ...formData, site_web: e.target.value })}
                className="mb-2 p-2 border border-gray-300 rounded text-black"
              />
              <div className="flex justify-end mt-2">
                <button type="submit" className="px-4 py-2 bg-yellow-500 text-white rounded">
                  Modifier
                </button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default GestionFournisseurs;