// pages/register.tsx
import { useState } from 'react';
import { register } from './api/register/register';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    try {
      await register(email, password, name);
      // Si succès, redirection ou autre action
    } catch (error) {
      // Si une erreur se produit, on la capture et on l'affiche
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  };

  return (
    <div>
      <h1>Inscription</h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mot de passe"
      />
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nom"
      />
      <button onClick={handleRegister}>S'inscrire</button>
      {error && <p>{error}</p>}
    </div>
  );
};

export default RegisterPage;
