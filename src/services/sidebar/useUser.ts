import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

interface User {
  email: string;
}

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user', {
          credentials: 'include',
        });
        console.log('Requête envoyée à /api/user:', response);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: User = await response.json();
        setUser(data);
      } catch (error) {
        if (error instanceof Error) {
          console.error('Erreur lors de la récupération des données utilisateur:', error.message);
          setError(error.message);
        } else {
          console.error('Erreur inconnue lors de la récupération des données utilisateur:', error);
          setError('Erreur inconnue');
        }
      }
    };

    fetchUser();
  }, []);

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      Cookies.remove('supabaseToken');
      localStorage.removeItem('supabase.auth.token');
      setUser(null);
      
      console.log('Déconnexion réussie');
      window.location.href = '/login';
    } catch (error) {
      if (error instanceof Error) {
        console.error('Erreur lors de la déconnexion:', error.message);
        setError(error.message);
      } else {
        console.error('Erreur inconnue lors de la déconnexion:', error);
        setError('Erreur inconnue');
      }
    }
  };

  return { user, error, logout };
};