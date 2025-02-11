import { useState, useEffect } from 'react';
import { Fournisseur } from '../services/fournisseurService';

interface FournisseurFormProps {
    fournisseur?: Fournisseur;
    onSubmit: (fournisseur: Fournisseur) => void;
}

const FournisseurForm: React.FC<FournisseurFormProps> = ({ fournisseur, onSubmit }) => {
    const [formData, setFormData] = useState<Fournisseur>({
        nom: fournisseur?.nom || '',
        adresse: fournisseur?.adresse || '',
        email: fournisseur?.email || '',
        telephone: fournisseur?.telephone || '',
        site_web: fournisseur?.site_web || ''
    });

    useEffect(() => {
        if (fournisseur) {
            setFormData({
                nom: fournisseur.nom || '',
                adresse: fournisseur.adresse || '',
                email: fournisseur.email || '',
                telephone: fournisseur.telephone || '',
                site_web: fournisseur.site_web || ''
            });
        }
    }, [fournisseur]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Nom</label>
                <input type="text" name="nom" value={formData.nom} onChange={handleChange} />
            </div>
            <div>
                <label>Adresse</label>
                <input type="text" name="adresse" value={formData.adresse} onChange={handleChange} />
            </div>
            <div>
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} />
            </div>
            <div>
                <label>Téléphone</label>
                <input type="text" name="telephone" value={formData.telephone} onChange={handleChange} />
            </div>
            <div>
                <label>Site Web</label>
                <input type="text" name="site_web" value={formData.site_web} onChange={handleChange} />
            </div>
            <button type="submit">Enregistrer</button>
        </form>
    );
};

export default FournisseurForm;
