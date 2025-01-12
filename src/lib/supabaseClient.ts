import { createClient } from '@supabase/supabase-js';
import { destroyCookie } from 'nookies';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey);

export const handleSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Erreur lors de la récupération de la session:', error);
    return;
  }
  if (session) {
    console.log('Session actuelle:', session);
  } else {
    console.log('Aucun utilisateur connecté');
  }
};

export const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Erreur lors de la déconnexion:', error);
  } else {
    destroyCookie(null, 'supabaseToken');
    console.log('Utilisateur déconnecté');
    window.location.href = '/login';
  }
};

handleSession();
