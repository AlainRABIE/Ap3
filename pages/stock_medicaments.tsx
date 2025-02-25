import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import MenubarRe from '../components/ui/MenuBarRe';
import { getUserRole } from './api/role';
import Modal from '../components/ui/modal';

type Materiel = {
  id_materiel: number;
  nom: string;
  description: string | null;
  quantite: number; // Modifié: n'accepte plus de null
  date_ajout: string;
  numero_serie: string | null;
  etat: string;
  date_expiration: string | null;
};

type FormErrors = {
  nom?: string;
  description?: string;
  quantite?: string;
  numero_serie?: string;
  etat?: string;
  date_expiration?: string;
};

const MaterielsPage = () => {
  const [materiels, setMateriels] = useState<Materiel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMateriel, setSelectedMateriel] = useState<Materiel | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<Omit<Materiel, 'id_materiel' | 'date_ajout'>>({
    nom: '',
    description: '',
    quantite: 0, // Valeur par défaut à 0 au lieu de null
    numero_serie: '',
    etat: 'neuf',
    date_expiration: null,
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
        .from('materiels')
        .select('*')
        .order('id_materiel', { ascending: true });
      if (error) throw new Error(error.message);
      if (Array.isArray(data)) setMateriels(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des matériels:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await checkSession();
      await fetchMateriels();
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
      nom: materiel.nom,
      description: materiel.description,
      quantite: materiel.quantite, // Ne peut plus être null
      numero_serie: materiel.numero_serie,
      etat: materiel.etat,
      date_expiration: materiel.date_expiration,
    });
    setIsEditing(true);
    setShowModal(true);
    setErrors({});
  };

  const isMaterielCommanded = async (id: number) => {
    const { data, error } = await supabase
      .from('commande_materiel')
      .select('*')
      .eq('id_materiel', id);
    if (error) {
      console.error('Erreur lors de la vérification des commandes:', error);
      return false;
    }
    return data.length > 0;
  };

  const handleDelete = async (id: number) => {
    const commanded = await isMaterielCommanded(id);
    if (commanded) {
      alert('Ce matériel a été commandé et ne peut pas être supprimé.');
      return;
    }

    try {
      const { error } = await supabase.from('materiels').delete().eq('id_materiel', id);
      if (error) throw new Error(error.message);
      setMateriels(materiels.filter((materiel) => materiel.id_materiel !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression du matériel:', error);
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.nom || formData.nom.trim() === '') {
      newErrors.nom = 'Le nom est requis';
      isValid = false;
    }

    // Ajouter une validation pour la quantité
    if (formData.quantite === undefined || formData.quantite < 0) {
      newErrors.quantite = formData.quantite < 0 
        ? 'La quantité ne peut pas être négative' 
        : 'La quantité est requise';
      isValid = false;
    }

    if (!formData.etat) {
      newErrors.etat = 'L\'état est requis';
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
        nom: formData.nom,
        description: formData.description,
        quantite: formData.quantite, // Maintenant toujours un nombre
        numero_serie: formData.numero_serie,
        etat: formData.etat,
        date_expiration: formData.date_expiration,
      };

      if (isEditing && selectedMateriel) {
        const { error } = await supabase
          .from('materiels')
          .update(dataToSubmit)
          .eq('id_materiel', selectedMateriel.id_materiel);
        if (error) throw new Error(error.message);
        await fetchMateriels(); 
      } else {
        const { error } = await supabase.from('materiels').insert([dataToSubmit]);
        if (error) throw new Error(error.message);
        await fetchMateriels(); 
      }
      
      // Réinitialiser le formulaire
      setFormData({
        nom: '',
        description: '',
        quantite: 0, // Réinitialiser à 0 au lieu de null
        numero_serie: '',
        etat: 'neuf',
        date_expiration: null,
      });
      setErrors({});
      setIsEditing(false);
      setSelectedMateriel(null);
      setShowModal(false);
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      alert('Erreur lors de l\'enregistrement: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setErrors({});
    // Réinitialiser le formulaire si on n'est pas en mode édition
    if (!isEditing) {
      setFormData({
        nom: '',
        description: '',
        quantite: 0, // Réinitialiser à 0 au lieu de null
        numero_serie: '',
        etat: 'neuf',
        date_expiration: null,
      });
    }
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
                    nom: '',
                    description: '',
                    quantite: 0, // Réinitialiser à 0 au lieu de null
                    numero_serie: '',
                    etat: 'neuf',
                    date_expiration: null,
                  });
                  setShowModal(true);
                }}
              >
                Ajouter un matériel
              </button>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materiels.map((materiel) => (
                <div key={materiel.id_materiel} className="p-4 bg-white bg-opacity-40 backdrop-blur-md rounded-lg shadow-md">
                  <h2 className="text-lg font-bold mb-2">{materiel.nom}</h2>
                  <p className="mb-2"><strong>Description:</strong> {materiel.description}</p>
                  <p className="mb-2"><strong>Quantité:</strong> {materiel.quantite}</p>
                  <p className="mb-2"><strong>N° de série:</strong> {materiel.numero_serie}</p>
                  <p className="mb-2"><strong>État:</strong> {materiel.etat}</p>
                  <p className="mb-2"><strong>Date d&apos;expiration:</strong> {materiel.date_expiration}</p>
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
                        onClick={() => handleDelete(materiel.id_materiel)}
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
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      className={`w-full p-2 border ${errors.nom ? 'border-red-500' : 'border-gray-300'} rounded text-black`}
                    />
                    {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
                  </div>
                  
                  <div className="mb-2">
                    <input
                      type="text"
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
                      placeholder="Quantité *"
                      value={formData.quantite}
                      onChange={(e) => setFormData({ ...formData, quantite: parseInt(e.target.value) || 0 })}
                      min="0"
                      className={`w-full p-2 border ${errors.quantite ? 'border-red-500' : 'border-gray-300'} rounded text-black`}
                      required
                    />
                    {errors.quantite && <p className="text-red-500 text-xs mt-1">{errors.quantite}</p>}
                  </div>
                  
                  <div className="mb-2">
                    <input
                      type="text"
                      placeholder="Numéro de série"
                      value={formData.numero_serie || ''}
                      onChange={(e) => setFormData({ ...formData, numero_serie: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded text-black"
                    />
                    {errors.numero_serie && <p className="text-red-500 text-xs mt-1">{errors.numero_serie}</p>}
                  </div>
                  
                  <div className="mb-2">
                    <select
                      value={formData.etat}
                      onChange={(e) => setFormData({ ...formData, etat: e.target.value })}
                      className={`w-full p-2 border ${errors.etat ? 'border-red-500' : 'border-gray-300'} rounded text-black`}
                      required
                    >
                      <option value="">Sélectionnez un état *</option>
                      <option value="neuf">Neuf</option>
                      <option value="bon état">Bon état</option>
                      <option value="à réparer">À réparer</option>
                      <option value="hors service">Hors service</option>
                    </select>
                    {errors.etat && <p className="text-red-500 text-xs mt-1">{errors.etat}</p>}
                  </div>
                  
                  <div className="mb-4">
                    <input
                      type="date"
                      placeholder="Date d'expiration"
                      value={formData.date_expiration || ''}
                      onChange={(e) => setFormData({ ...formData, date_expiration: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded text-black"
                    />
                    {errors.date_expiration && <p className="text-red-500 text-xs mt-1">{errors.date_expiration}</p>}
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