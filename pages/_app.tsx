import { AppProps } from 'next/app'; // Importation de AppProps pour typer les props
import { UserProvider } from '@/contexte/UserContext'; // Assurez-vous du bon chemin
import "../src/app/globals.css";

function MyApp({ Component, pageProps }: AppProps) { // Ajout du type 'AppProps'
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
}

export default MyApp;
