import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/router';

const SuccessModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-green-600">Inscription réussie!</h2>
        <p className="mb-6 text-gray-700">Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    </div>
  );
};

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, role: 'user' }), 
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Une erreur s&apos;est produite lors de l&apos;inscription.');
      }

      console.log('Inscription réussie:', data);
      setShowSuccessModal(true);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Erreur lors de l&apos;inscription:', error.message);
        setError(error.message);
      } else {
        console.error('Erreur inconnue lors de l&apos;inscription:', error);
        setError('Erreur inconnue');
      }
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    router.push('/login');
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Inscription</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium" style={{ color: 'black' }}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium" style={{ color: 'black' }}>Nom</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium" style={{ color: 'black' }}>Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <button type="submit" className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            S&apos;inscrire
          </button>
        </form>
      </div>
      <SuccessModal isOpen={showSuccessModal} onClose={handleCloseModal} />
    </div>
  );
};

export default RegisterPage;