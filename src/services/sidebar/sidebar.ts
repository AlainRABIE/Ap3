// sidebar.ts
import { useState, useEffect } from "react";

interface User {
  firstName: string;
  lastName: string;
}

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await fetch("/api/user");  
      const userJson = await userData.json();

      if (userJson.isAuthenticated) {
        setUser({ firstName: userJson.firstName, lastName: userJson.lastName });
      }
    };

    fetchUser();
  }, []);

  return user;
};
