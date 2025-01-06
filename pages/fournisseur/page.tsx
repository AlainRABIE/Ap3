import { useEffect, useState } from "react";
import { getAllFournisseurs, FournisseurWithProduits } from "@/services/fournisseur/fournisseur"; // Importer les bonnes méthodes et types

const FournisseursPage = () => {
  const [fournisseurs, setFournisseurs] = useState<FournisseurWithProduits[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFournisseurs = async () => {
      try {
        const data = await getAllFournisseurs();
        setFournisseurs(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des fournisseurs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFournisseurs();
  }, []);

  if (loading) {
    return <p>Chargement...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-semibold mb-6">Fournisseurs et Produits</h1>
      {fournisseurs.length === 0 ? (
        <p>Aucun fournisseur trouvé.</p>
      ) : (
        fournisseurs.map((fournisseur) => (
          <div key={fournisseur.id} className="mb-6">
            <h2 className="text-2xl font-bold">{fournisseur.nom}</h2>
            <p>{fournisseur.adresse}</p>
            <p>{fournisseur.email}</p>
            <p>{fournisseur.telephone}</p>
            <p>
              <a href={fournisseur.site_web} target="_blank" className="text-blue-500">
                Site Web
              </a>
            </p>
            <h3 className="text-xl font-semibold mt-4">Produits Fournis :</h3>
            <ul className="list-disc pl-6">
              {fournisseur.produits.map((produit) => (
                <li key={produit.id}>
                  <strong>{produit.nom}</strong> - {produit.description} -{" "}
                  <span className="text-green-500">{produit.prix}€</span>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default FournisseursPage;
