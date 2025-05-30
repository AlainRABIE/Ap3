import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from "@/lib/supabaseClient";
import Cookies from 'js-cookie';
import Link from 'next/link';
import "../src/app/globals.css";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('supabaseToken');
    if (token) {
      router.push('/');
    }
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const { data: { user, session }, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      console.error('Erreur de connexion:', authError.message);
      setError(authError.message);
      return;
    }

    if (user && session) {
      console.log('Connexion réussie:', user);
      console.log('Token de session:', session.access_token);

      Cookies.set('supabaseToken', session.access_token, { expires: 1, secure: true, sameSite: 'Strict' });
      console.log('Cookie après connexion:', document.cookie);
      localStorage.setItem('supabase.auth.token', session.access_token);
      router.push('/');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--background-main)', color: 'var(--text-main)' }}>
      <div className="w-full max-w-md p-8 bg-white rounded shadow-md" style={{ backgroundColor: 'var(--background-main)', color: 'var(--text-main)' }}>
        <h1 className="text-2xl font-bold text-center mb-6">Connexion</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              style={{ backgroundColor: 'var(--background-main)', color: 'var(--text-main)' }}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              style={{ backgroundColor: 'var(--background-main)', color: 'var(--text-main)' }}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
            Se connecter
          </button>
        </form>
        <div className="text-center mt-4 space-y-2">
          <p className="text-sm">
            Pas encore de compte ? <Link href="/register" className="text-blue-600 hover:underline">Inscrivez-vous</Link>
          </p>
          <p className="text-sm">
            <Link href="/forgot-password" className="text-blue-600 hover:underline">Mot de passe oublié ?</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
