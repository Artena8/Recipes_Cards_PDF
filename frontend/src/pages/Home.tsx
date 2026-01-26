import { Typography } from "@mui/material";
import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div className="home-page">
        <main className="home-content">
            <Typography variant="h1" style={{marginBottom: "2%"}}>Cartes recettes</Typography>

            <p className="home-text">
            Remplis 8 recettes + 8 images, et récupère un PDF prêt à imprimer
            (recto/verso).
            </p>

            <Link to="/create">
            <button>Créer mon PDF</button>
            </Link>
        </main>

        <footer className="home-footer">
            © {new Date().getFullYear()} Héléna Chevalier – Cards Recipes  
            <br />
            Projet personnel – Tous droits réservés. Les icones sont issues de <a href="https://icones8.fr/" target="_blank" rel="noreferrer">Icones8</a>.
        </footer>
        </div>
    );
}
