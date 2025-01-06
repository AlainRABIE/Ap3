import { useState } from 'react';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    try {
      const response = await fetch('/api/register/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Inscription réussie:', data);
        // Rediriger ou faire quelque chose après l'inscription réussie
      } else {
        console.error('Erreur d\'inscription:', data);
        setError(data.message);
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  };

  return (
    <div>
      <h1>Inscription</h1>
      <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Nom</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">S'inscrire</button>
      </form>
    </div>
  );
};

export default RegisterPage;
