import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import MenubarRe from '../components/ui/MenuBarRe';
import { getUserRole } from './api/role';
import Modal from '../components/ui/modal';

type Medicament = {
  id: number;
  name: string;
  posologie: string | null;
  description: string | null;
  quantite: number | null;
  id_fournisseur: number | null;
};

type Fournisseur = {
  fournisseur_id: number;
  nom: string;
};

type FormErrors = {
  name?: string;
  posologie?: string;
  description?: string;
  quantite?: string;
  id_fournisseur?: string;
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

  const fetchMedicaments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('medicaments')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw new Error(error.message);
      if (Array.isArray(data)) setMedicaments(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des médicaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFournisseurs = async () => {
    try {
      const { data, error } = await supabase
        .from('fournisseur_medicament')
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
      await fetchMedicaments();
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

  const handleEdit = (medicament: Medicament) => {
    setSelectedMedicament(medicament);
    setFormData({
      name: medicament.name,
      posologie: medicament.posologie,
      description: medicament.description,
      quantite: medicament.quantite,
      id_fournisseur: medicament.id_fournisseur,
    });
    setIsEditing(true);
    setShowModal(true);
    setErrors({});
  };

  const isMedicamentCommanded = async (id: number) => {
    const { data, error } = await supabase
      .from('commande_medicaments')
      .select('*')
      .eq('id_medicament', id);
    if (error) {
      console.error('Erreur lors de la vérification des commandes:', error);
      return false;
    }
    return data.length > 0;
  };

  const handleDelete = async (id: number) => {
    const commanded = await isMedicamentCommanded(id);
    if (commanded) {
      alert('Ce médicament a été commandé et ne peut pas être supprimé.');
      return;
    }

    try {
      const { error } = await supabase.from('medicaments').delete().eq('id', id);
      if (error) throw new Error(error.message);
      setMedicaments(medicaments.filter((medicament) => medicament.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression du médicament:', error);
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
        posologie: formData.posologie,
        description: formData.description,
        quantite: formData.quantite,
        id_fournisseur: formData.id_fournisseur,
      };

      if (isEditing && selectedMedicament) {
        const { error } = await supabase
          .from('medicaments')
          .update(dataToSubmit)
          .eq('id', selectedMedicament.id);
        if (error) throw new Error(error.message);
        await fetchMedicaments(); 
      } else {
        const { error } = await supabase.from('medicaments').insert([dataToSubmit]);
        if (error) throw new Error(error.message);
        await fetchMedicaments(); 
      }
      
      setFormData({
        name: '',
        posologie: '',
        description: '',
        quantite: null,
        id_fournisseur: null,
      });
      setErrors({});
      setIsEditing(false);
      setSelectedMedicament(null);
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
        posologie: '',
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
          <p>Chargement des médicaments...</p>
        ) : (
          <div>
            <h1 className="text-white text-xl mb-4">Liste des Médicaments</h1>
            {isAdmin && (
              <button
                className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
                onClick={() => {
                  setIsEditing(false);
                  setSelectedMedicament(null);
                  setFormData({
                    name: '',
                    posologie: '',
                    description: '',
                    quantite: null,
                    id_fournisseur: null,
                  });
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
                  <p className="mb-2"><strong>Fournisseur:</strong> {getFournisseurNom(medicament.id_fournisseur)}</p>
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
            <Modal show={showModal} onClose={handleModalClose}>
              <div className="w-96 p-4 bg-white rounded-lg shadow-lg">
                <h2 className="text-lg font-bold mb-4 text-black">
                  {isEditing ? 'Modifier' : 'Ajouter'} un Médicament
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
                    <input
                      type="text"
                      placeholder="Posologie"
                      value={formData.posologie || ''}
                      onChange={(e) => setFormData({ ...formData, posologie: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded text-black"
                    />
                    {errors.posologie && <p className="text-red-500 text-xs mt-1">{errors.posologie}</p>}
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

export default MedicamentsPage;