import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import MenubarRe from '../components/ui/MenuBarRe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type User = {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  roleid: number;
  role_name: string; // Ajout de cette ligne
};

const UserPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: userData } = await supabase
        .from('User')
        .select(`
          *,
          role:roleid (
            name
          )
        `)
        .eq('email', session.user.email)
        .single();

      if (userData) {
        setCurrentUser({
          ...userData,
          role_name: userData.role.name
        });
      }
    }

    const { data, error } = await supabase
      .from('User')
      .select(`
        *,
        role:roleid (
          name
        )
      `);

    if (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      setError(error.message);
    } else {
      setUsers(data.map(user => ({
        ...user,
        role_name: user.role.name
      })));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChangeRole = async (id: number, newRoleId: number) => {
    const { error } = await supabase
      .from('User')
      .update({ roleid: newRoleId })
      .eq('id', id);

    if (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
      setError(error.message);
    } else {
      // Re-fetch the users after the role is updated
      await fetchUsers();
    }
  };

  const handleResetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      console.error('Erreur lors de l\'envoi de l\'e-mail de réinitialisation:', error);
      setError(error.message);
    } else {
      alert(`E-mail de réinitialisation envoyé à ${email}`);
    }
  };

  return (
    <div className="relative flex h-screen bg-opacity-40 backdrop-blur-md">
      <div className="animated-background"></div>
      <div className="waves"></div>
      <MenubarRe />
      <main className="main-content flex-1 p-8 overflow-auto">
        <h1 className="text-4xl font-bold mb-6 text-white">Liste des Utilisateurs</h1>
        {error && <p className="text-red-500">{error}</p>}
        <table className="min-w-full table-auto mb-4">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Nom</th>
              <th className="px-4 py-2 border">Date de Création</th>
              <th className="px-4 py-2 border">Date de Mise à Jour</th>
              <th className="px-4 py-2 border">Rôle</th> {/* Modification du titre de la colonne */}
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users
              .filter(user => user.email !== currentUser?.email)
              .map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-2 border">{user.email}</td>
                  <td className="px-4 py-2 border">{user.name}</td>
                  <td className="px-4 py-2 border">{new Date(user.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2 border">{new Date(user.updatedAt).toLocaleString()}</td>
                  <td className="px-4 py-2 border">{user.role_name}</td> {/* Utilisation de role_name */}
                  <td className="px-4 py-2 border">
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                      onClick={() => handleChangeRole(user.id, user.roleid === 1 ? 2 : 1)}
                    >
                      Changer Rôle
                    </button>
                    <button
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                      onClick={() => handleResetPassword(user.email)}
                    >
                      Mot de passe oublié
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default UserPage;
