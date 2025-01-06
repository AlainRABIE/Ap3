import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  // Récupère les informations utilisateur au chargement
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);
        setFormData({
          name: user.user_metadata?.name || "",
          email: user.email || "",
        });
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  // Gestion de la mise à jour des champs du formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      email: formData.email,
      data: { name: formData.name },
    });

    if (error) {
      console.error("Erreur lors de la mise à jour :", error);
    } else {
      alert("Paramètres mis à jour avec succès !");
    }

    setLoading(false);
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Paramètres de votre compte</h1>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
          Nom
        </label>
        <input
          type="text"
          name="name"
          id="name"
          className="w-full p-2 border rounded"
          value={formData.name}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
          Email
        </label>
        <input
          type="email"
          name="email"
          id="email"
          className="w-full p-2 border rounded"
          value={formData.email}
          onChange={handleChange}
        />
      </div>
      <button
        onClick={handleSave}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        Sauvegarder
      </button>
    </div>
  );
}
