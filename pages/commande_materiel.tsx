import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import MenubarRe from "../components/ui/MenuBarRe";
import { ShoppingCart } from "lucide-react";
import { getUserRole } from "./api/role";

interface Medicament {
  id: number;
  name: string;
  description: string;
  stock: number;
}

interface CartItem {
  medicamentId: number;
  quantity: number;
  name: string;
}

interface Quantities {
  [key: number]: number;
}

// Ajout du bon type pour `user`
interface User {
  id: string;
  email: string;
}

const CataloguePage = () => {
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quantities, setQuantities] = useState<Quantities>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null); // Correction ici
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userObj: User = {
          id: session.user.id,
          email: session.user.email || "",
        };
        setUser(userObj);

        const { data: userData } = await supabase
          .from("User")
          .select("id")
          .eq("email", session.user.email)
          .single();

        if (userData) {
          const role = await getUserRole(userData.id);
          setUserRole(role);
          setIsAdmin(role === "administrateur");
        }
      }
    };

    checkSession();
    fetchMedicaments();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userObj: User = {
          id: session.user.id,
          email: session.user.email || "",
        };
        setUser(userObj);

        const { data: userData } = await supabase
          .from("User")
          .select("id")
          .eq("email", session.user.email)
          .single();

        if (userData) {
          const role = await getUserRole(userData.id);
          setUserRole(role);
          setIsAdmin(role === "administrateur");
          fetchMedicaments();
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const fetchMedicaments = async () => {
    const { data, error } = await supabase.from("medicaments").select("*");
    if (!error && data) {
      setMedicaments(data);
      const initialQuantities: Quantities = {};
      data.forEach((med) => {
        initialQuantities[med.id] = 1;
      });
      setQuantities(initialQuantities);
    }
  };

  const handleQuantityChange = (medicamentId: number, value: string) => {
    const numericValue = parseInt(value) || 1;
    setQuantities((prev: Quantities) => ({
      ...prev,
      [medicamentId]: Math.max(1, numericValue),
    }));
  };

  const addToCart = (medicament: Medicament) => {
    const quantity = quantities[medicament.id] || 1;
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((item) => item.medicamentId === medicament.id);

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + quantity,
        };
        return newCart;
      }

      return [
        ...prevCart,
        {
          medicamentId: medicament.id,
          quantity,
          name: medicament.name,
        },
      ];
    });
  };

  return (
    <div className="relative flex h-screen bg-opacity-40 backdrop-blur-md">
      <MenubarRe />
      <main className="flex-1 p-8 overflow-auto">
        <div className="w-full max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white">Catalogue des Médicaments</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {medicaments.map((medicament) => (
              <div key={medicament.id} className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-2">{medicament.name}</h2>
                <p className="text-gray-600 mb-4">{medicament.description}</p>
                <p className="text-sm text-gray-500">Stock: {medicament.stock}</p>
                <input
                  type="number"
                  min="1"
                  value={quantities[medicament.id] || 1}
                  onChange={(e) => handleQuantityChange(medicament.id, e.target.value)}
                  className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg"
                />
                <button 
                  onClick={() => addToCart(medicament)}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg mt-4 hover:bg-blue-600"
                >
                  Ajouter au panier
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CataloguePage;
