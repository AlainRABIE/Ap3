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

  const deleteCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      Cookies.remove('supabaseToken');
      
      // Nettoyer localStorage et sessionStorage
      localStorage.removeItem('supabase.auth.token');
      // Si vous utilisez d'autres clés liées à l'authentification, supprimez-les aussi
      
      // Réinitialiser l'état de l'utilisateur
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