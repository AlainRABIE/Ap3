import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import MenubarRe from '../components/ui/MenuBarRe';
import { User } from '@supabase/supabase-js';
import { getUserRole } from './api/role';
import Modal from '../components/ui/modal';

type Medicament = {
  id: number;
  name: string | null;
  posologie: string | null;
  description: string | null;
  quantite: number | null;
  id_fournisseur: number | null;
};

type Fournisseur = {
  fournisseur_id: number;
  nom: string;
  adresse: string;
  email: string;
  telephone: string;
  site_web: string;
};

const MedicamentsPage = () => {
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMedicament, setSelectedMedicament] = useState<Medicament | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<Omit<Medicament, 'id'>>({
    name: '',
    posologie: '',
    description: '',
    quantite: null,
    id_fournisseur: null,
  });
  const [showModal, setShowModal] = useState<boolean>(false);
  const [, setUser] = useState<User | null>(null);
  const [, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      const { data: userData } = await supabase
        .from('User')
        .select('id')
        .eq('email', session.user.email)
        .single();
      if (userData) {
        const role = await getUserRole(userData.id);
        setUserRole(role);
        setIsAdmin(role === 'administrateur');
      }
    } else {
      setUser(null);
      setUserRole(null);
      setIsAdmin(false);
    }
  };

  const fetchMedicaments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('medicaments').select('*');
      if (error) throw new Error(error.message);
      setMedicaments(data || []);
      console.log('Médicaments chargés:', data);
    } catch (error) {
      console.error('Erreur lors de la récupération des médicaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFournisseurs = async () => {
    try {
      const { data, error } = await supabase.from('fournisseur_medicament').select('*');
      if (error) throw new Error(error.message);
      setFournisseurs(data || []);
      console.log('Fournisseurs chargés:', data);
    } catch (error) {
      console.error('Erreur lors de la récupération des fournisseurs:', error);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await checkSession();
      await fetchFournisseurs(); // Charger d'abord les fournisseurs
      await fetchMedicaments(); // Puis les médicaments
    };
    initialize();
  }, []);

  // Fonction pour trouver le nom du fournisseur par ID
  const getFournisseurNom = (id: number | null) => {
    if (!id) return 'À attribuer';
    const fournisseur = fournisseurs.find(f => f.fournisseur_id === id);
    return fournisseur ? fournisseur.nom : 'Erreur de référence';
  };

  const handleEdit = (medicament: Medicament) => {
    setSelectedMedicament(medicament);
    setFormData({ 
      ...medicament, 
      id_fournisseur: medicament.id_fournisseur || (fournisseurs.length > 0 ? fournisseurs[0].fournisseur_id : null)
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase.from('medicaments').delete().eq('id', id);
      if (error) throw new Error(error.message);
      setMedicaments(medicaments.filter((medicament) => medicament.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression du médicament:', error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const dataToSubmit = {
        name: formData.name || '',
        posologie: formData.posologie || '',
        description: formData.description || '',
        quantite: formData.quantite || 0,
        id_fournisseur: formData.id_fournisseur || (fournisseurs.length > 0 ? fournisseurs[0].fournisseur_id : null),
      };

      if (isEditing && selectedMedicament) {
        const { error } = await supabase
          .from('medicaments')
          .update(dataToSubmit)
          .eq('id', selectedMedicament.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from('medicaments').insert([dataToSubmit]);
        if (error) throw new Error(error.message);
      }

      await fetchMedicaments();
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
    } finally {
      setIsEditing(false);
      setSelectedMedicament(null);
      setShowModal(false);
    }
  };

  return (
    <div className="relative flex h-screen bg-opacity-40 backdrop-blur-md">
      <div className="animated-background"></div>
      <div className="waves"></div>
      <MenubarRe />
      <div className="content">
        {loading ? (
          <p>Chargement des médicaments...</p>
        ) : (
          <div>
            <h1 className="text-white text-xl mb-4">Liste des Médicaments</h1>
            {isAdmin && (
              <button
                className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
                onClick={() => {
                  setFormData({
                    name: '',
                    posologie: '',
                    description: '',
                    quantite: 0,
                    id_fournisseur: fournisseurs.length > 0 ? fournisseurs[0].fournisseur_id : null,
                  });
                  setIsEditing(false);
                  setShowModal(true);
                }}
              >
                Ajouter un médicament
              </button>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {medicaments.map((medicament) => (
                <div key={medicament.id} className="p-4 bg-white bg-opacity-40 backdrop-blur-md rounded-lg shadow-md">
                  <h2 className="text-lg font-bold mb-2">{medicament.name}</h2>
                  <p className="mb-2"><strong>Posologie:</strong> {medicament.posologie}</p>
                  <p className="mb-2"><strong>Description:</strong> {medicament.description}</p>
                  <p className="mb-2"><strong>Quantité:</strong> {medicament.quantite}</p>
                  <p className="mb-2">
                    <strong>Fournisseur:</strong>{' '}
                    {getFournisseurNom(medicament.id_fournisseur)}
                  </p>
                  {isAdmin && (
                    <div className="flex justify-around mt-4">
                      <button
                        className="px-4 py-2 bg-yellow-500 text-black rounded"
                        onClick={() => handleEdit(medicament)}
                      >
                        Modifier
                      </button>
                      <button
                        className="px-4 py-2 bg-red-500 text-white rounded"
                        onClick={() => handleDelete(medicament.id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Modal show={showModal} onClose={() => setShowModal(false)}>
              <div className="w-80 p-4 bg-white rounded-lg shadow-lg">
                <h2 className="text-lg font-bold mb-4 text-black">
                  {isEditing ? 'Modifier' : 'Ajouter'} un Médicament
                </h2>
                <form onSubmit={handleSubmit} className="flex flex-col">
                  <input
                    type="text"
                    placeholder="Nom"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mb-2 p-2 border border-gray-300 rounded text-black"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Posologie"
                    value={formData.posologie || ""}
                    onChange={(e) => setFormData({ ...formData, posologie: e.target.value })}
                    className="mb-2 p-2 border border-gray-300 rounded text-black"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mb-2 p-2 border border-gray-300 rounded text-black"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Quantité"
                    value={formData.quantite || ""}
                    onChange={(e) => setFormData({ ...formData, quantite: parseInt(e.target.value) })}
                    min="0"
                    className="mb-2 p-2 border border-gray-300 rounded text-black"
                    required
                  />
                  <select
                    value={formData.id_fournisseur || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, id_fournisseur: parseInt(e.target.value) })
                    }
                    className="mb-2 p-2 border border-gray-300 rounded text-black"
                    required
                  >
                    <option value="" disabled>Sélectionner un fournisseur</option>
                    {fournisseurs.map((fournisseur) => (
                      <option key={fournisseur.fournisseur_id} value={fournisseur.fournisseur_id}>
                        {fournisseur.nom}
                      </option>
                    ))}
                  </select>
                  <div className="flex justify-end mt-2">
                    <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded">
                      {isEditing ? 'Modifier' : 'Ajouter'}
                    </button>
                  </div>
                </form>
              </div>
            </Modal>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicamentsPage;