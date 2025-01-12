import { AppProps } from 'next/app';  
import { UserProvider } from '@/contexte/UserContext'; 
import "../src/app/globals.css";

function MyApp({ Component, pageProps }: AppProps) { 
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
}

export default MyApp;
