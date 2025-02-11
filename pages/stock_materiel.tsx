import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import MenubarRe from '../components/ui/MenuBarRe';
import { User } from '@supabase/supabase-js';
import { getUserRole } from './api/role';
import Modal from '../components/ui/modal';

type Materiel = {
  id_materiel: number;
  nom: string;
  description: string | null;
  quantite: number | null;
  date_ajout: string;
  numero_serie: string | null;
  etat: string;
  date_expiration: string | null;
};

const MaterielsPage = () => {
  const [materiels, setMateriels] = useState<Materiel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMateriel, setSelectedMateriel] = useState<Materiel | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<Omit<Materiel, 'id_materiel' | 'date_ajout'>>({
    nom: '',
    description: '',
    quantite: null,
    numero_serie: '',
    etat: 'neuf',
    date_expiration: null,
  });
  const [showModal, setShowModal] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
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
      quantite: materiel.quantite,
      numero_serie: materiel.numero_serie,
      etat: materiel.etat,
      date_expiration: materiel.date_expiration,
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase.from('materiels').delete().eq('id_materiel', id);
      if (error) throw new Error(error.message);
      setMateriels(materiels.filter((materiel) => materiel.id_materiel !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression du matériel:', error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const dataToSubmit = {
        nom: formData.nom,
        description: formData.description,
        quantite: formData.quantite,
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
        await fetchMateriels(); // Rafraîchir les données après la mise à jour
      } else {
        const { error } = await supabase.from('materiels').insert([dataToSubmit]);
        if (error) throw new Error(error.message);
        await fetchMateriels(); // Rafraîchir les données après l'insertion
      }
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
    } finally {
      setIsEditing(false);
      setSelectedMateriel(null);
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
          <p>Chargement des matériels...</p>
        ) : (
          <div>
            <h1 className="text-white text-xl mb-4">Liste des Matériels</h1>
            {isAdmin && (
              <button
                className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
                onClick={() => setShowModal(true)}
              >
                Ajouter un matériel
              </button>
            )}
            <table className="table-auto w-full text-white">
              <thead>
                <tr>
                  <th className="px-4 py-2">Nom</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2">Quantité</th>
                  <th className="px-4 py-2">N° de série</th>
                  <th className="px-4 py-2">État</th>
                  <th className="px-4 py-2">Date d'expiration</th>
                  {isAdmin && <th className="px-4 py-2">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {materiels.map((materiel) => (
                  <tr key={materiel.id_materiel} className="bg-gray-700">
                    <td className="px-4 py-2">{materiel.nom}</td>
                    <td className="px-4 py-2">{materiel.description}</td>
                    <td className="px-4 py-2">{materiel.quantite}</td>
                    <td className="px-4 py-2">{materiel.numero_serie}</td>
                    <td className="px-4 py-2">{materiel.etat}</td>
                    <td className="px-4 py-2">{materiel.date_expiration}</td>
                    {isAdmin && (
                      <td className="px-4 py-2">
                        <div className="flex justify-around">
                          <button
                            className="px-4 py-2 bg-yellow-500 text-white rounded"
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
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            <Modal show={showModal} onClose={() => setShowModal(false)}>
              <div className="w-80 p-4 bg-white rounded-lg shadow-lg">
                <h2 className="text-lg font-bold mb-4 text-black">
                  {isEditing ? 'Modifier' : 'Ajouter'} un Matériel
                </h2>
                <form onSubmit={handleSubmit} className="flex flex-col">
                  <input
                    type="text"
                    placeholder="Nom"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="mb-2 p-2 border border-gray-300 rounded text-black"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mb-2 p-2 border border-gray-300 rounded text-black"
                  />
                  <input
                    type="number"
                    placeholder="Quantité"
                    value={formData.quantite || ''}
                    onChange={(e) => setFormData({ ...formData, quantite: parseInt(e.target.value) })}
                    min="0"
                    className="mb-2 p-2 border border-gray-300 rounded text-black"
                  />
                  <input
                    type="text"
                    placeholder="Numéro de série"
                    value={formData.numero_serie || ''}
                    onChange={(e) => setFormData({ ...formData, numero_serie: e.target.value })}
                    className="mb-2 p-2 border border-gray-300 rounded text-black"
                  />
                  <select
                    value={formData.etat}
                    onChange={(e) => setFormData({ ...formData, etat: e.target.value })}
                    className="mb-2 p-2 border border-gray-300 rounded text-black"
                    required
                  >
                    <option value="neuf">Neuf</option>
                    <option value="bon">Bon</option>
                    <option value="moyen">Moyen</option>
                    <option value="mauvais">Mauvais</option>
                    <option value="hors_service">Hors service</option>
                  </select>
                  <input
                    type="date"
                    placeholder="Date d'expiration"
                    value={formData.date_expiration || ''}
                    onChange={(e) => setFormData({ ...formData, date_expiration: e.target.value })}
                    className="mb-2 p-2 border border-gray-300 rounded text-black"
                  />
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

export default MaterielsPage;