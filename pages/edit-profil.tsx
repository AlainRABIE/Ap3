import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        setFormData({
          ...formData,
          email: session.user.email ?? '',
          name: session.user.user_metadata.full_name ?? '',
        });
      } else {
        router.push('/login');  
      }
    };

    checkSession();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.newPassword && formData.newPassword !== formData.confirmNewPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        email: formData.email,
        password: formData.newPassword || undefined,
        data: { full_name: formData.name },
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess("Profil mis à jour avec succès");
      }
    } catch (error) {
      setError('Erreur lors de la mise à jour du profil');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Modifier le Profil</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium">Nom</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium">Nouveau mot de passe</label>
            <input
              id="newPassword"
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="confirmNewPassword" className="block text-sm font-medium">Confirmer le nouveau mot de passe</label>
            <input
              id="confirmNewPassword"
              type="password"
              name="confirmNewPassword"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}
          <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700">
            Mettre à jour le profil
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
