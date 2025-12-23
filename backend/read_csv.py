import pandas as pd
from config import IMPORTS_DIR

REQUIRED_COLUMNS = [
    "Collection", "Titre", "Temps", "URL", "Régime", "Saison"
]

def load_recipes(filename: str) -> list[dict]:
    path = IMPORTS_DIR / filename
    df = pd.read_csv(path)

    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(f"Colonnes manquantes : {missing}")

    return df.to_dict(orient="records")
