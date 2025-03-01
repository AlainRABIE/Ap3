import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import MenubarRe from '../components/ui/MenuBarRe';
import { getUserRole } from './api/role';
import Modal from '../components/ui/modal';

type Materiel = {
  id: number;
  name: string;
  quantite: number | null;
  description: string | null;
  id_fournisseur: number | null;
};

type Fournisseur = {
  fournisseur_id: number;
  nom: string;
};

type FormErrors = {
  name?: string;
  description?: string;
  quantite?: string;
  id_fournisseur?: string;
};

const MaterielsPage = () => {
  const [materiels, setMateriels] = useState<Materiel[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMateriel, setSelectedMateriel] = useState<Materiel | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<Omit<Materiel, 'id'>>({
    name: '',
    description: '',
    quantite: null,
    id_fournisseur: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: userData } = await supabase
        .from('User')
        .select('id')
        .eq('email', session.user.email)
        .single();
      if (userData) {
        const role = await getUserRole(userData.id);
        setIsAdmin(role === 'administrateur');
      }
    } else {
      setIsAdmin(false);
    }
  };

  const fetchMateriels = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('materiel')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw new Error(error.message);
      if (Array.isArray(data)) setMateriels(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des matériels:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFournisseurs = async () => {
    try {
      const { data, error } = await supabase
        .from('fournisseur_materiel')
        .select('fournisseur_id, nom');
      if (error) throw new Error(error.message);
      if (Array.isArray(data)) setFournisseurs(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des fournisseurs:', error);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await checkSession();
      await fetchMateriels();
      await fetchFournisseurs();
    };
    initialize();
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: userData } = await supabase
          .from('User')
          .select('id')
          .eq('email', session.user.email)
          .single();
        if (userData) {
          const role = await getUserRole(userData.id);
          setIsAdmin(role === 'administrateur');
        }
      } else {
        setIsAdmin(false);
      }
    });
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleEdit = (materiel: Materiel) => {
    setSelectedMateriel(materiel);
    setFormData({
      name: materiel.name,
      description: materiel.description,
      quantite: materiel.quantite,
      id_fournisseur: materiel.id_fournisseur,
    });
    setIsEditing(true);
    setShowModal(true);
    setErrors({});
  };

  const isMaterielUtilise = async (id: number) => {
    const { data, error } = await supabase
      .from('commande_materiels')
      .select('*')
      .eq('id_materiel', id);
    if (error) {
      console.error('Erreur lors de la vérification des utilisations:', error);
      return false;
    }
    return data.length > 0;
  };

  const handleDelete = async (id: number) => {
    const utilise = await isMaterielUtilise(id);
    if (utilise) {
      alert('Ce matériel est utilisé et ne peut pas être supprimé.');
      return;
    }

    try {
      const { error } = await supabase.from('materiel').delete().eq('id', id);
      if (error) throw new Error(error.message);
      setMateriels(materiels.filter((materiel) => materiel.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression du matériel:', error);
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Le nom est requis';
      isValid = false;
    }

    if (formData.quantite !== null && formData.quantite < 0) {
      newErrors.quantite = 'La quantité ne peut pas être négative';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const dataToSubmit = {
        name: formData.name,
        description: formData.description,
        quantite: formData.quantite,
        id_fournisseur: formData.id_fournisseur,
      };

      if (isEditing && selectedMateriel) {
        const { error } = await supabase
          .from('materiel')
          .update(dataToSubmit)
          .eq('id', selectedMateriel.id);
        if (error) throw new Error(error.message);
        await fetchMateriels(); 
      } else {
        const { error } = await supabase.from('materiel').insert([dataToSubmit]);
        if (error) throw new Error(error.message);
        await fetchMateriels(); 
      }
      
      setFormData({
        name: '',
        description: '',
        quantite: null,
        id_fournisseur: null,
      });
      setErrors({});
      setIsEditing(false);
      setSelectedMateriel(null);
      setShowModal(false);
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setErrors({});
    if (!isEditing) {
      setFormData({
        name: '',
        description: '',
        quantite: null,
        id_fournisseur: null,
      });
    }
  };

  const getFournisseurNom = (id: number | null) => {
    if (!id) return 'Non spécifié';
    const fournisseur = fournisseurs.find(f => f.fournisseur_id === id);
    return fournisseur ? fournisseur.nom : 'Inconnu';
  };

  return (
    <div className="relative flex h-screen bg-opacity-40 backdrop-blur-md">
      <div className="animated-background"></div>
      <div className="waves"></div>
      <MenubarRe />
      <div className="content">
        {loading ? (
          <p>Chargement des matériels...</p>
        ) : (
          <div>
            <h1 className="text-white text-xl mb-4">Liste des Matériels</h1>
            {isAdmin && (
              <button
                className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
                onClick={() => {
                  setIsEditing(false);
                  setSelectedMateriel(null);
                  setFormData({
                    name: '',
                    description: '',
                    quantite: null,
                    id_fournisseur: null,
                  });
                  setShowModal(true);
                }}
              >
                Ajouter un matériel
              </button>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materiels.map((materiel) => (
                <div key={materiel.id} className="p-4 bg-white bg-opacity-40 backdrop-blur-md rounded-lg shadow-md">
                  <h2 className="text-lg font-bold mb-2">{materiel.name}</h2>
                  <p className="mb-2"><strong>Description:</strong> {materiel.description}</p>
                  <p className="mb-2"><strong>Quantité:</strong> {materiel.quantite}</p>
                  <p className="mb-2"><strong>Fournisseur:</strong> {getFournisseurNom(materiel.id_fournisseur)}</p>
                  {isAdmin && (
                    <div className="flex justify-around mt-4">
                      <button
                        className="px-4 py-2 bg-yellow-500 text-black rounded"
                        onClick={() => handleEdit(materiel)}
                      >
                        Modifier
                      </button>
                      <button
                        className="px-4 py-2 bg-red-500 text-white rounded"
                        onClick={() => handleDelete(materiel.id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Modal show={showModal} onClose={handleModalClose}>
              <div className="w-96 p-4 bg-white rounded-lg shadow-lg">
                <h2 className="text-lg font-bold mb-4 text-black">
                  {isEditing ? 'Modifier' : 'Ajouter'} un Matériel
                </h2>
                <form onSubmit={handleSubmit} className="flex flex-col">
                  <div className="mb-2">
                    <input
                      type="text"
                      placeholder="Nom *"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full p-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded text-black`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  
                  <div className="mb-2">
                    <textarea
                      placeholder="Description"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded text-black"
                    />
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                  </div>
                  
                  <div className="mb-2">
                    <input
                      type="number"
                      placeholder="Quantité"
                      value={formData.quantite === null ? '' : formData.quantite}
                      onChange={(e) => setFormData({ ...formData, quantite: e.target.value ? parseInt(e.target.value) : null })}
                      min="0"
                      className={`w-full p-2 border ${errors.quantite ? 'border-red-500' : 'border-gray-300'} rounded text-black`}
                    />
                    {errors.quantite && <p className="text-red-500 text-xs mt-1">{errors.quantite}</p>}
                  </div>
                  
                  <div className="mb-4">
                    <select
                      value={formData.id_fournisseur || ''}
                      onChange={(e) => setFormData({ ...formData, id_fournisseur: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full p-2 border border-gray-300 rounded text-black"
                    >
                      <option value="">Sélectionnez un fournisseur</option>
                      {fournisseurs.map((fournisseur) => (
                        <option key={fournisseur.fournisseur_id} value={fournisseur.fournisseur_id}>
                          {fournisseur.nom}
                        </option>
                      ))}
                    </select>
                    {errors.id_fournisseur && <p className="text-red-500 text-xs mt-1">{errors.id_fournisseur}</p>}
                  </div>
                  
                  <div className="flex justify-between mt-2">
                    <button 
                      type="button" 
                      className="px-4 py-2 bg-gray-500 text-white rounded"
                      onClick={handleModalClose}
                    >
                      Annuler
                    </button>
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

export default MaterielsPage;