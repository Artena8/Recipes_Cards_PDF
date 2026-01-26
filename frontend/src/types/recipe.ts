export type Regime = "Végétarien" | "Végan" | "Omnivore" | "Poisson";
export type Saison = "Printemps" | "Été" | "Automne" | "Hiver";

export type Recipe = {
    Collection: string;
    Titre: string;
    Temps: string;
    URL: string;
    Régime: Regime;
    Saison: Saison;
    Allergènes: string;
    Image: string;
};